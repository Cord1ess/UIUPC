'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { Member, CommitteeMember, ExhibitionSubmission } from '@/types/admin';

// ─── MEMBERS ───────────────────────────────────────────────────────────────

export async function approveMember(id: string) {
  const { error } = await supabase
    .from('members')
    .update({ status: 'approved' })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  return { success: true };
}

export async function rejectMember(id: string) {
  const { error } = await supabase
    .from('members')
    .update({ status: 'rejected' })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteMember(id: string) {
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
  const { error } = await supabase
    .from('committees')
    .upsert(data);

  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteCommitteeMember(id: string) {
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
  const { error } = await supabase
    .from('exhibition_submissions')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  return { success: true };
}
