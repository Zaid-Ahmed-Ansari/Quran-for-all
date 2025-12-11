-- =============================================
-- ROW-LEVEL SECURITY POLICIES FOR ARTICLES TABLE
-- Allow authenticated users to manage articles
-- =============================================

-- Enable RLS on articles table (if not already enabled)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 1) Allow authenticated users to SELECT (read) articles
CREATE POLICY "Authenticated users can read articles"
ON public.articles
FOR SELECT
USING (auth.role() = 'authenticated');

-- 2) Allow authenticated users to INSERT (create) articles
CREATE POLICY "Authenticated users can create articles"
ON public.articles
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 3) Allow authenticated users to UPDATE articles
CREATE POLICY "Authenticated users can update articles"
ON public.articles
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 4) Allow authenticated users to DELETE articles
CREATE POLICY "Authenticated users can delete articles"
ON public.articles
FOR DELETE
USING (auth.role() = 'authenticated');

-- =============================================
-- RLS POLICIES FOR RELATED TABLES
-- =============================================

-- Article Content Blocks
ALTER TABLE public.article_content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage content blocks"
ON public.article_content_blocks
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Article Tags
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage article tags"
ON public.article_tags
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Article Topics
ALTER TABLE public.article_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage article topics"
ON public.article_topics
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Article Group Links
ALTER TABLE public.article_group_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage group links"
ON public.article_group_links
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Article Secondary References
ALTER TABLE public.article_secondary_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage secondary references"
ON public.article_secondary_references
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Tags table (for creating new tags)
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage tags"
ON public.tags
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Topics table (for creating new topics)
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage topics"
ON public.topics
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

