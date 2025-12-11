-- =============================================
-- ROW-LEVEL SECURITY POLICIES FOR MEDIA TABLES
-- Allow authenticated users to manage media items
-- =============================================

-- Enable RLS on media_items table (if not already enabled)
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- 1) Allow authenticated users to SELECT (read) media items
CREATE POLICY "Authenticated users can read media items"
ON public.media_items
FOR SELECT
USING (auth.role() = 'authenticated');

-- 2) Allow authenticated users to INSERT (create) media items
CREATE POLICY "Authenticated users can create media items"
ON public.media_items
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 3) Allow authenticated users to UPDATE media items
CREATE POLICY "Authenticated users can update media items"
ON public.media_items
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4) Allow authenticated users to DELETE media items
CREATE POLICY "Authenticated users can delete media items"
ON public.media_items
FOR DELETE
USING (auth.role() = 'authenticated');

-- =============================================
-- RLS POLICIES FOR MEDIA ITEM GROUP LINKS
-- =============================================

-- Enable RLS on media_item_group_links table (if not already enabled)
ALTER TABLE public.media_item_group_links ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage media item group links
CREATE POLICY "Authenticated users can manage media item group links"
ON public.media_item_group_links
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
