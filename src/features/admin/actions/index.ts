'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient } from '@/lib/supabaseServer';
import { hashPassword, verifyPassword } from '@/lib/password';
import { Member, CommitteeMember, ExhibitionSubmission } from '@/types/admin';

async function requireAdmin() {
  const supabaseServer = await createClient();
  const { data: { user }, error } = await supabaseServer.auth.getUser();
  if (error || !user) {
    throw new Error('Unauthorized: Admin access required');
  }
  return user;
}

// ─── AUDIT LOGGING ────────────────────────────────────────────────────────
export async function logAuditAction(
  action: string,
  targetTable: string,
  targetId?: string,
  oldData?: any,
  newData?: any,
  userOrEmail?: any
) {
  let email = 'system';
  let adminId = null;

  if (userOrEmail) {
    email = userOrEmail.email || userOrEmail;
  } else {
    try {
      const user = await requireAdmin();
      email = user.email || 'system';
    } catch (e) {
      // fallback to system
    }
  }
  
  // Look up admin profile to get their UUID
  if (email !== 'system') {
    const { data: adminProfile } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();
    if (adminProfile) adminId = adminProfile.id;
  }

  const { error } = await supabaseAdmin.from('audit_logs').insert({
    action,
    admin_id: adminId,
    admin_email: email,
    target_table: targetTable,
    target_id: targetId || null,
    old_data: oldData || null,
    new_data: newData || null
  });

  if (error) console.error("Audit log error:", error.message);
}

// ─── UNIFIED MUTATION ROUTER ─────────────────────────────────────────────
export async function executeAdminMutation(
  targetTable: string,
  action: 'create' | 'update' | 'delete',
  payload: any,
  targetId?: string
) {
  const user = await requireAdmin();
  
  // Check if approvals are required
  const { data: settings } = await supabaseAdmin
    .from('admin_settings')
    .select('value')
    .eq('key', 'require_approvals')
    .maybeSingle();
    
  const requireApprovals = settings?.value === 'true';

  // Get user role
  const { data: adminProfile } = await supabaseAdmin
    .from('admins')
    .select('id, role')
    .eq('email', user.email)
    .single();

  const isCore = adminProfile?.role === 'core';

  if (requireApprovals && !isCore) {
    // Route to pending changes
    const { error } = await supabaseAdmin.from('pending_changes').insert({
      requested_by: adminProfile?.id,
      target_table: targetTable,
      target_id: targetId,
      action,
      new_data: action !== 'delete' ? payload : null,
      status: 'pending'
    });
    if (error) return { success: false, message: error.message };
    return { success: true, pending: true, message: 'Change submitted for approval.' };
  }

  // Execute directly
  let result;
  if (action === 'create') {
    result = await supabaseAdmin.from(targetTable).insert([payload]).select().single();
  } else if (action === 'update' && targetId) {
    result = await supabaseAdmin.from(targetTable).update(payload).eq('id', targetId).select().single();
  } else if (action === 'delete' && targetId) {
    result = await supabaseAdmin.from(targetTable).delete().eq('id', targetId);
  } else {
    return { success: false, message: 'Invalid mutation parameters' };
  }

  if (result.error) return { success: false, message: result.error.message };

  await logAuditAction(action, targetTable, targetId || result.data?.id, null, action !== 'delete' ? payload : null, user);
  revalidatePath('/admin');
  
  return { success: true, pending: false, data: result.data };
}


// ─── ADMIN PASSWORD ────────────────────────────────────────────────────────

/**
 * Initialize admin password if not already set.
 * Call this once to seed the database with the hashed password.
 */
export async function initAdminPassword() {
  const { data } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'admin_password')
    .single();

  if (!data) {
    const hashed = hashPassword('Test123');
    await supabase
      .from('admin_settings')
      .upsert({ key: 'admin_password', value: hashed });
  }
}

/**
 * Validate a password against the stored admin password.
 * Returns { valid: true } or { valid: false, error: string }.
 */
export async function validateAdminPassword(password: string): Promise<{ valid: boolean; error?: string }> {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  const { data, error } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'admin_password')
    .single();

  if (error || !data) {
    return { valid: false, error: 'Admin password not configured' };
  }

  const isValid = verifyPassword(password, data.value);
  return isValid ? { valid: true } : { valid: false, error: 'Incorrect password' };
}

// ─── PENDING CHANGES APPROVAL ──────────────────────────────────────────────
export async function approvePendingChange(id: string) {
  const user = await requireAdmin();
  
  // Verify core role
  const { data: profile } = await supabaseAdmin.from('admins').select('role').eq('email', user.email).single();
  if (profile?.role !== 'core') return { success: false, message: 'Only core admins can approve changes.' };

  // Get the pending change
  const { data: pending } = await supabaseAdmin.from('pending_changes').select('*').eq('id', id).single();
  if (!pending || pending.status !== 'pending') return { success: false, message: 'Invalid or already processed request.' };

  // Apply the actual mutation
  let result;
  if (pending.action === 'create') {
    result = await supabaseAdmin.from(pending.target_table).insert([pending.new_data]);
  } else if (pending.action === 'update' && pending.target_id) {
    result = await supabaseAdmin.from(pending.target_table).update(pending.new_data).eq('id', pending.target_id);
  } else if (pending.action === 'delete' && pending.target_id) {
    result = await supabaseAdmin.from(pending.target_table).delete().eq('id', pending.target_id);
  } else {
    return { success: false, message: 'Invalid action data.' };
  }

  if (result?.error) return { success: false, message: result.error.message };

  // Mark as approved
  await supabaseAdmin.from('pending_changes').update({ 
    status: 'approved', 
    reviewed_by: profile?.id,
    reviewed_at: new Date().toISOString()
  }).eq('id', id);

  await logAuditAction('approve_request', 'pending_changes', id, null, { applied_to: pending.target_table, action: pending.action }, user);
  revalidatePath('/admin');
  return { success: true };
}

export async function rejectPendingChange(id: string) {
  const user = await requireAdmin();
  
  const { data: profile } = await supabaseAdmin.from('admins').select('role, id').eq('email', user.email).single();
  if (profile?.role !== 'core') return { success: false, message: 'Only core admins can reject changes.' };

  const { error } = await supabaseAdmin.from('pending_changes').update({ 
    status: 'rejected',
    reviewed_by: profile?.id,
    reviewed_at: new Date().toISOString()
  }).eq('id', id);

  if (error) return { success: false, message: error.message };
  
  await logAuditAction('reject_request', 'pending_changes', id, null, null, user);
  revalidatePath('/admin');
  return { success: true };
}

// ─── INPUT VALIDATION ──────────────────────────────────────────────────────

function validateCommitteeInput(data: Record<string, any>): { valid: boolean; error?: string } {
  if (!data.member_name || typeof data.member_name !== 'string' || data.member_name.trim().length < 2) {
    return { valid: false, error: 'Member name must be at least 2 characters' };
  }
  if (!data.designation || typeof data.designation !== 'string') {
    return { valid: false, error: 'Designation is required' };
  }
  if (!data.year || typeof data.year !== 'string') {
    return { valid: false, error: 'Committee session/year is required' };
  }
  if (data.email && typeof data.email === 'string' && !data.email.includes('@')) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (data.blood_group && !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(data.blood_group)) {
    return { valid: false, error: 'Invalid blood group' };
  }
  if (data.order_index !== undefined && (typeof data.order_index !== 'number' || data.order_index < 0)) {
    return { valid: false, error: 'Rank must be a non-negative number' };
  }
  // Sanitize string fields
  const maxLen = 500;
  for (const key of ['member_name', 'designation', 'department', 'club_department', 'email', 'phone', 'student_id', 'year']) {
    if (data[key] && typeof data[key] === 'string' && data[key].length > maxLen) {
      return { valid: false, error: `${key} exceeds maximum length` };
    }
  }
  return { valid: true };
}

// ─── MEMBERS ───────────────────────────────────────────────────────────────

export async function approveMember(id: string) {
  await requireAdmin();
  const { error } = await supabase
    .from('members')
    .update({ status: 'approved' })
    .eq('id', id);

  if (error) throw new Error(error.message);
  await logAuditAction('update_status', 'members', id, null, { status: 'approved' });
  revalidatePath('/admin');
  return { success: true };
}

export async function rejectMember(id: string) {
  await requireAdmin();
  const { error } = await supabase
    .from('members')
    .update({ status: 'rejected' })
    .eq('id', id);

  if (error) throw new Error(error.message);
  await logAuditAction('update_status', 'members', id, null, { status: 'rejected' });
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteMember(id: string) {
  await requireAdmin();
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  await logAuditAction('delete', 'members', id);
  revalidatePath('/admin');
  return { success: true };
}

// ─── COMMITTEE ────────────────────────────────────────────────────────────

export async function upsertCommitteeMember(data: Partial<CommitteeMember>) {
  await requireAdmin();
  // Validate input before database operation
  const validation = validateCommitteeInput(data as Record<string, any>);
  if (!validation.valid) {
    return { success: false, message: validation.error };
  }

  // Sanitize: only allow known columns
  const sanitized = {
    ...(data.id ? { id: data.id } : {}),
    member_name: data.member_name?.trim(),
    designation: data.designation?.trim(),
    club_department: data.club_department?.trim() || null,
    department: data.department?.trim(),
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    blood_group: data.blood_group || null,
    year: data.year?.trim(),
    image_url: data.image_url || null,
    order_index: data.order_index ?? 0,
    student_id: data.student_id?.trim() || null,
    social_links: data.social_links || null,
  };

  if (!supabaseAdmin) return { success: false, message: 'Server configuration error: missing Service Role Key' };

  const { error } = await supabaseAdmin
    .from('committees')
    .upsert(sanitized);

  if (error) return { success: false, message: error.message };
  await logAuditAction(sanitized.id ? 'update' : 'create', 'committees', sanitized.id || 'new', null, sanitized);
  revalidatePath('/admin');
  return { success: true };
}

/**
 * Delete a committee member with password verification.
 * Password is validated server-side against the encrypted hash in the database.
 */
export async function deleteCommitteeMemberSecure(id: string, password: string) {
  await requireAdmin();
  // Validate password server-side
  const pwResult = await validateAdminPassword(password);
  if (!pwResult.valid) {
    return { success: false, message: pwResult.error || 'Invalid password' };
  }

  if (!supabaseAdmin) return { success: false, message: 'Server configuration error: missing Service Role Key' };

  const { error } = await supabaseAdmin
    .from('committees')
    .delete()
    .eq('id', id);

  if (error) return { success: false, message: error.message };
  await logAuditAction('delete_secure', 'committees', id);
  revalidatePath('/admin');
  return { success: true };
}

/**
 * Bulk delete committee members with password verification.
 * Uses Promise.allSettled for partial success reporting.
 */
export async function bulkDeleteCommitteeMembersSecure(ids: string[], password: string) {
  await requireAdmin();
  // Validate password once
  const pwResult = await validateAdminPassword(password);
  if (!pwResult.valid) {
    return { success: false, message: pwResult.error || 'Invalid password', deleted: 0, failed: 0 };
  }

  if (!supabaseAdmin) return { success: false, message: 'Server configuration error: missing Service Role Key', deleted: 0, failed: 0 };

  const results = await Promise.allSettled(
    ids.map(id => supabaseAdmin.from('committees').delete().eq('id', id))
  );

  const deleted = results.filter(r => r.status === 'fulfilled' && !(r.value as any).error).length;
  const failed = results.length - deleted;

  if (deleted > 0) {
    await logAuditAction('bulk_delete_secure', 'committees', 'multiple', null, { deleted_count: deleted, total_attempted: ids.length });
  }

  revalidatePath('/admin');
  return {
    success: failed === 0,
    message: failed > 0 ? `${deleted}/${results.length} deleted, ${failed} failed` : `${deleted} members deleted`,
    deleted,
    failed
  };
}

// Keep backward-compatible version (used by other modules)
export async function deleteCommitteeMember(id: string) {
  await requireAdmin();
  const { error } = await supabase
    .from('committees')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  await logAuditAction('delete', 'committees', id);
  revalidatePath('/admin');
  return { success: true };
}

// ─── SUBMISSIONS ──────────────────────────────────────────────────────────

export async function updateSubmissionStatus(id: string, status: 'selected' | 'rejected' | 'pending') {
  await requireAdmin();
  const { error } = await supabase
    .from('exhibition_submissions')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);
  await logAuditAction('update_status', 'exhibition_submissions', id, null, { status });
  revalidatePath('/admin');
  return { success: true };
}
