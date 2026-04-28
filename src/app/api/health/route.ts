import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Health check endpoint to verify Supabase connection.
 * GET /api/health
 * 
 * Returns the count of admins seeded in the database.
 */
export async function GET() {
  try {
    // Test: Read the admins table
    const { data: admins, error } = await supabase
      .from('admins')
      .select('email, display_name, role')
      .order('role');

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        hint: error.hint,
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'connected',
      database: 'Supabase PostgreSQL',
      admins_found: admins?.length || 0,
      admins: admins,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message,
    }, { status: 500 });
  }
}
