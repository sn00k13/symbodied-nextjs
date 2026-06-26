-- Run this migration once in your Supabase SQL editor
-- Adds currency and payment_method columns to donations table

ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS currency       text NOT NULL DEFAULT 'NGN',
  ADD COLUMN IF NOT EXISTS payment_method text;

-- Allow admins to update donation status (needed for webhook handlers)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'donations' AND policyname = 'Admins can update donations'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Admins can update donations"
        ON donations FOR UPDATE
        USING (
          EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        )
    $policy$;
  END IF;
END $$;
