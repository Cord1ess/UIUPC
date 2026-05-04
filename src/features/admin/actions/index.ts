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
  revalidatePath('/admin');
  return { success: true };
}
