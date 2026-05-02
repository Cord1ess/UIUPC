import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Load .env manually
const envPath = path.join(process.cwd(), '.env');
const env = {};
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const gasResultsUrl = env.NEXT_PUBLIC_GAS_RESULTS;

if (!supabaseUrl || !supabaseKey || !gasResultsUrl) {
  console.error("Missing credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  console.log("🚀 Starting Data Migration: Google Sheets -> Supabase\n");

  const eventId = "shutter-stories"; // Default event

  // --- 1. MIGRATE RESULTS ---
  console.log("[1/2] Migrating Results...");
  try {
    const resultsResponse = await fetch(`${gasResultsUrl}?action=getAllResults&eventId=${eventId}`);
    const resultsJson = await resultsResponse.json();

    if (resultsJson.success && Array.isArray(resultsJson.data)) {
      const mappedResults = resultsJson.data.map(r => ({
        event_id: eventId,
        participant_name: r.name || r.participant_name || "Unknown",
        institute: r.institute || "",
        category: r.category || "single",
        photo_count: parseInt(r.photos || r.photo_count || "1"),
        status: r.status || "selected",
        selected: r.selected === false ? false : true,
        created_at: r.timestamp || new Date().toISOString()
      }));

      console.log(`   Fetched ${mappedResults.length} results. Inserting into Supabase...`);
      
      const { error } = await supabase.from('results').upsert(mappedResults);
      if (error) throw error;
      console.log("   ✅ Results migrated successfully.");
    } else {
      console.warn("   ⚠️ No results data found or fetch failed.");
    }
  } catch (err) {
    console.error("   ❌ Results migration failed:", err.message);
  }

  console.log("\n-----------------------------------\n");

  // --- 2. MIGRATE PAYMENTS ---
  console.log("[2/2] Migrating Payments...");
  try {
    const paymentsResponse = await fetch(`${gasResultsUrl}?action=getAllPayments&eventId=${eventId}`);
    const paymentsJson = await paymentsResponse.json();

    if (paymentsJson.success && Array.isArray(paymentsJson.data)) {
      const mappedPayments = paymentsJson.data.map(p => ({
        event_id: eventId,
        name: p.name || "Unknown",
        email: p.email || "",
        phone: p.phone || "",
        institute: p.institute || "",
        category: p.category || "single",
        photo_count: parseInt(p.photoCount || p.photo_count || "1"),
        tshirt_size: p.tshirtSize || p.tshirt_size || "",
        address: p.address || "",
        payment_method: p.paymentMethod || p.payment_method || "",
        transaction_id: p.transactionId || p.transaction_id || `MIG_${Date.now()}_${Math.random()}`,
        amount: parseInt(p.amount || "0"),
        status: p.status || "pending",
        timestamp: p.timestamp || new Date().toISOString(),
        created_at: p.created_at || new Date().toISOString()
      }));

      // Deduplicate by transaction_id within the batch to prevent "ON CONFLICT" errors
      const uniquePaymentsMap = new Map();
      mappedPayments.forEach(p => {
        uniquePaymentsMap.set(p.transaction_id, p);
      });
      const uniquePayments = Array.from(uniquePaymentsMap.values());

      console.log(`   Fetched ${mappedPayments.length} payments (${uniquePayments.length} unique). Inserting into Supabase...`);
      
      const { error } = await supabase.from('payments').upsert(uniquePayments, { onConflict: 'transaction_id' });
      if (error) throw error;
      console.log("   ✅ Payments migrated successfully.");
    } else {
      console.warn("   ⚠️ No payments data found or fetch failed.");
    }
  } catch (err) {
    console.error("   ❌ Payments migration failed:", err.message);
  }

  console.log("\n🎉 Migration Complete!");
}

migrateData().catch(console.error);
