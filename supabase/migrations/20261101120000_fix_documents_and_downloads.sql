-- Migration: Add missing relation, download increment RPC, and search indexes

-- 1. Ensure foreign key from documents.uploader_id to profiles.user_id if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_documents_profiles'
  ) THEN
    ALTER TABLE public.documents
    ADD CONSTRAINT fk_documents_profiles
    FOREIGN KEY (uploader_id) REFERENCES public.profiles(user_id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Create RPC function to safely increment download count by anyone with select access
CREATE OR REPLACE FUNCTION public.increment_document_download(doc_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.documents
  SET download_count = download_count + 1
  WHERE id = doc_id;
END;
$$;

-- Grant execution to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.increment_document_download(UUID) TO anon, authenticated;

-- 3. Add performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_documents_status_created_at ON public.documents(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_uploader ON public.documents(uploader_id);

