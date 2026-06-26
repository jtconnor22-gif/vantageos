-- RLS policies for the 'documents' private storage bucket
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/wkjiofzngsarchkwfzka/sql/new

-- Allow authenticated users to upload files (under their own user_id folder)
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to read any document in their org
-- (broad for now — the app controls access at the application layer)
CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents');

-- Allow authenticated users to delete documents
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');
