import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Audit Log Receiver
 * 
 * Receives audit logs from external sources like Google Sheets.
 * Uses a simple shared secret for basic security.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, target_table, target_id, old_data, new_data, secret } = body;

    // Basic security check
    if (secret !== process.env.SYNC_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!action || !target_table) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert into audit_logs
    const { error } = await supabase.from('audit_logs').insert({
      admin_id: '00000000-0000-0000-0000-000000000000', // System/External Admin ID
      action: action,
      target_table: target_table,
      target_id: target_id || 'manual_edit',
      old_data: old_data || {},
      new_data: new_data || {},
      source: 'sheets'
    });

    if (error) {
      console.error('Audit log insertion error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
