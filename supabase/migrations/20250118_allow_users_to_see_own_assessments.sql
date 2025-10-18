-- Restrict assessment creation and editing to admins only
-- Regular users can only view live assessments

-- Drop the old policy that only shows active assessments
DROP POLICY IF EXISTS "Users can view active assessments" ON enhanced_assessments;

-- Create new policies for enhanced_assessments
-- 1. Anyone can view live/active assessments
CREATE POLICY "Anyone can view active assessments" ON enhanced_assessments
  FOR SELECT USING (is_active = true AND status = 'live');

-- 2. Admins can view all assessments (draft, live, archived)
CREATE POLICY "Admins can view all assessments" ON enhanced_assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

-- 3. Only admins can create assessments
DROP POLICY IF EXISTS "Authenticated users can create assessments" ON enhanced_assessments;
CREATE POLICY "Only admins can create assessments" ON enhanced_assessments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

-- 4. Only admins can update assessments
DROP POLICY IF EXISTS "Users can update their own assessments" ON enhanced_assessments;
CREATE POLICY "Only admins can update assessments" ON enhanced_assessments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

-- 5. Only admins can delete assessments
CREATE POLICY "Only admins can delete assessments" ON enhanced_assessments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );

