// Creates the 'documents' private storage bucket in Supabase.
// Run once: node scripts/create-storage-bucket.mjs
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const vars = {}
env.split('\n').forEach(l => {
  const [k, ...v] = l.split('=')
  if (k) vars[k.trim()] = v.join('=').trim()
})

const SUPABASE_URL = vars.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = vars.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SERVICE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY)

// Check if bucket exists
const { data: buckets, error: listErr } = await admin.storage.listBuckets()
if (listErr) { console.error('Error listing buckets:', listErr.message); process.exit(1) }

const exists = buckets.some(b => b.name === 'documents')
if (exists) {
  console.log('✓ Bucket "documents" already exists.')
  process.exit(0)
}

// Create private bucket
const { error: createErr } = await admin.storage.createBucket('documents', {
  public: false,
  allowedMimeTypes: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  fileSizeLimit: 10485760, // 10 MB
})

if (createErr) {
  console.error('Error creating bucket:', createErr.message)
  process.exit(1)
}

console.log('✓ Created private storage bucket "documents" (10 MB limit, PDF/image/doc types)')
console.log('\nNext: set bucket RLS policies in the Supabase dashboard so authenticated users')
console.log('can upload to their own folder (user_id/ prefix).')
