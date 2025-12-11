# Supabase RPC Functions Guide

This guide explains how to create Supabase RPC (Remote Procedure Call) functions to fetch articles, videos, and audios for both Next.js websites and Expo mobile apps.

## Table of Contents

1. [Group ID Normalization](#group-id-normalization)
2. [Article RPC Functions](#article-rpc-functions)
3. [Video RPC Functions](#video-rpc-functions)
4. [Audio RPC Functions](#audio-rpc-functions)
5. [Implementing Article UI](#implementing-article-ui)
6. [Using in Next.js](#using-in-nextjs)
7. [Using in Expo](#using-in-expo)

---

## Group ID Normalization

Group IDs must be normalized to stay between 1 and 1600. The normalization logic works as follows:

- If `group_id = 1608`, it becomes `8` (1608 % 1600 = 8)
- If `group_id = 3200`, it becomes `1600` (3200 % 1600 = 0, so use 1600)
- If `group_id = 1`, it stays `1`
- If `group_id = 1600`, it stays `1600`

**Normalization Formula:**
```sql
CASE 
  WHEN (group_id % 1600) = 0 THEN 1600
  ELSE (group_id % 1600)
END
```

---

## Article RPC Functions

### 1. Fetch Article Preview by Group ID

This function returns article preview data (title, primary reference, read time, image, language) for a given normalized group ID.

**Function Name:** `get_article_preview_by_group`

**SQL Code:**
```sql
CREATE OR REPLACE FUNCTION get_article_preview_by_group(
  p_group_id INTEGER
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  primary_reference TEXT,
  read_time_minutes INTEGER,
  image_path TEXT,
  language_id INTEGER,
  normalized_group_id INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  normalized_id INTEGER;
BEGIN
  -- Normalize group_id to 1-1600 range
  normalized_id := CASE 
    WHEN (p_group_id % 1600) = 0 THEN 1600
    ELSE (p_group_id % 1600)
  END;

  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.primary_reference,
    a.read_time_minutes,
    a.image_path,
    a.language_id,
    normalized_id AS normalized_group_id
  FROM articles a
  INNER JOIN article_group_links agl ON a.id = agl.article_id
  WHERE agl.group_id = normalized_id
  ORDER BY a.created_at DESC
  LIMIT 1;
END;
$$;
```

**Usage in Next.js/Expo:**
```typescript
const { data, error } = await supabase
  .rpc('get_article_preview_by_group', { p_group_id: 1608 });

// Result: Returns article with normalized_group_id = 8
```

### 2. Fetch Full Article by ID

This function returns complete article data including all content blocks when clicking on a preview.

**Function Name:** `get_article_full_by_id`

**SQL Code:**
```sql
CREATE OR REPLACE FUNCTION get_article_full_by_id(
  p_article_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'article', json_build_object(
      'id', a.id,
      'title', a.title,
      'excerpt', a.excerpt,
      'primary_reference', a.primary_reference,
      'read_time_minutes', a.read_time_minutes,
      'image_path', a.image_path,
      'language_id', a.language_id,
      'is_short', a.is_short,
      'source', a.source,
      'hadith_reference', a.hadith_reference,
      'prophetic_wisdom_term', a.prophetic_wisdom_term,
      'quran_term', a.quran_term,
      'created_at', a.created_at
    ),
    'blocks', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'type', acb.type,
            'text_content', acb.text_content,
            'block_order', acb.block_order
          )
          ORDER BY acb.block_order
        )
        FROM article_content_blocks acb
        WHERE acb.article_id = a.id
      ),
      '[]'::json
    ),
    'tags', COALESCE(
      (
        SELECT json_agg(t.name)
        FROM article_tags at
        INNER JOIN tags t ON at.tag_id = t.id
        WHERE at.article_id = a.id
      ),
      '[]'::json
    ),
    'topics', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'name', t.name,
            'relevancy_score', at.relevancy_score
          )
        )
        FROM article_topics at
        INNER JOIN topics t ON at.topic_id = t.id
        WHERE at.article_id = a.id
      ),
      '[]'::json
    ),
    'secondary_references', COALESCE(
      (
        SELECT json_agg(asr.reference ORDER BY asr.id)
        FROM article_secondary_references asr
        WHERE asr.article_id = a.id
      ),
      '[]'::json
    )
  ) INTO result
  FROM articles a
  WHERE a.id = p_article_id;

  RETURN result;
END;
$$;
```

**Usage in Next.js/Expo:**
```typescript
const { data, error } = await supabase
  .rpc('get_article_full_by_id', { p_article_id: 'article-uuid-here' });

// Result structure:
// {
//   article: { id, title, excerpt, ... },
//   blocks: [{ type, text_content, block_order }, ...],
//   tags: ["tag1", "tag2"],
//   topics: [{ name, relevancy_score }, ...],
//   secondary_references: ["ref1", "ref2"]
// }
```

---

## Video RPC Functions

### 1. Fetch Video Preview by Group ID

This function returns video preview data (title, language, duration in minutes, image) for a given normalized group ID.

**Function Name:** `get_video_preview_by_group`

**SQL Code:**
```sql
CREATE OR REPLACE FUNCTION get_video_preview_by_group(
  p_group_id INTEGER
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  language_id INTEGER,
  duration_minutes INTEGER,
  image_path TEXT,
  normalized_group_id INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  normalized_id INTEGER;
BEGIN
  -- Normalize group_id to 1-1600 range
  normalized_id := CASE 
    WHEN (p_group_id % 1600) = 0 THEN 1600
    ELSE (p_group_id % 1600)
  END;

  RETURN QUERY
  SELECT 
    mi.id,
    mi.title,
    mi.language_id,
    -- Assuming duration_minutes exists in media_items or calculate from duration_seconds
    COALESCE(mi.duration_minutes, FLOOR(mi.duration_seconds / 60.0))::INTEGER AS duration_minutes,
    mi.image_path,
    normalized_id AS normalized_group_id
  FROM media_items mi
  INNER JOIN media_group_links mgl ON mi.id = mgl.media_item_id
  WHERE mi.type = 'video'
    AND mgl.group_id = normalized_id
  ORDER BY mi.created_at DESC
  LIMIT 1;
END;
$$;
```

**Note:** If your `media_items` table doesn't have `duration_minutes` or `duration_seconds`, you may need to:
1. Add a `duration_minutes` column to `media_items`
2. Or calculate it from external sources (YouTube API, etc.)
3. Or store it separately in a metadata JSON field

### 2. Fetch Full Video by ID

This function returns complete video data including sources (YouTube, etc.) when clicking on a preview.

**Function Name:** `get_video_full_by_id`

**SQL Code:**
```sql
CREATE OR REPLACE FUNCTION get_video_full_by_id(
  p_video_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'video', json_build_object(
      'id', mi.id,
      'title', mi.title,
      'description', mi.description,
      'image_path', mi.image_path,
      'language_id', mi.language_id,
      'duration_minutes', COALESCE(mi.duration_minutes, FLOOR(mi.duration_seconds / 60.0)),
      'sources', mi.sources,
      'created_at', mi.created_at
    ),
    'groups', COALESCE(
      (
        SELECT json_agg(mgl.group_id)
        FROM media_group_links mgl
        WHERE mgl.media_item_id = mi.id
      ),
      '[]'::json
    )
  ) INTO result
  FROM media_items mi
  WHERE mi.id = p_video_id
    AND mi.type = 'video';

  RETURN result;
END;
$$;
```

**Usage:**
```typescript
const { data, error } = await supabase
  .rpc('get_video_full_by_id', { p_video_id: 'video-uuid-here' });

// Result structure:
// {
//   video: { id, title, description, image_path, language_id, duration_minutes, sources: { youtube: "..." } },
//   groups: [1, 2, 3]
// }
```

---

## Audio RPC Functions

### 1. Fetch Audio Preview by Group ID

This function returns audio preview data (title, language, duration in minutes, image) for a given normalized group ID.

**Function Name:** `get_audio_preview_by_group`

**SQL Code:**
```sql
CREATE OR REPLACE FUNCTION get_audio_preview_by_group(
  p_group_id INTEGER
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  language_id INTEGER,
  duration_minutes INTEGER,
  image_path TEXT,
  normalized_group_id INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  normalized_id INTEGER;
BEGIN
  -- Normalize group_id to 1-1600 range
  normalized_id := CASE 
    WHEN (p_group_id % 1600) = 0 THEN 1600
    ELSE (p_group_id % 1600)
  END;

  RETURN QUERY
  SELECT 
    mi.id,
    mi.title,
    mi.language_id,
    COALESCE(mi.duration_minutes, FLOOR(mi.duration_seconds / 60.0))::INTEGER AS duration_minutes,
    mi.image_path,
    normalized_id AS normalized_group_id
  FROM media_items mi
  INNER JOIN media_group_links mgl ON mi.id = mgl.media_item_id
  WHERE mi.type = 'audio'
    AND mgl.group_id = normalized_id
  ORDER BY mi.created_at DESC
  LIMIT 1;
END;
$$;
```

### 2. Fetch Full Audio by ID

This function returns complete audio data including sources (Spotify, SoundCloud, etc.) when clicking on a preview.

**Function Name:** `get_audio_full_by_id`

**SQL Code:**
```sql
CREATE OR REPLACE FUNCTION get_audio_full_by_id(
  p_audio_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'audio', json_build_object(
      'id', mi.id,
      'title', mi.title,
      'description', mi.description,
      'image_path', mi.image_path,
      'language_id', mi.language_id,
      'duration_minutes', COALESCE(mi.duration_minutes, FLOOR(mi.duration_seconds / 60.0)),
      'sources', mi.sources,
      'created_at', mi.created_at
    ),
    'groups', COALESCE(
      (
        SELECT json_agg(mgl.group_id)
        FROM media_group_links mgl
        WHERE mgl.media_item_id = mi.id
      ),
      '[]'::json
    )
  ) INTO result
  FROM media_items mi
  WHERE mi.id = p_audio_id
    AND mi.type = 'audio';

  RETURN result;
END;
$$;
```

**Usage:**
```typescript
const { data, error } = await supabase
  .rpc('get_audio_full_by_id', { p_audio_id: 'audio-uuid-here' });

// Result structure:
// {
//   audio: { id, title, description, image_path, language_id, duration_minutes, sources: { spotify: "...", soundcloud: "..." } },
//   groups: [1, 2, 3]
// }
```

---

## Implementing Article UI

### How ArticlePreview Uses BlockRenderer

The `ArticlePreview` component renders articles using a `BlockRenderer` component that handles different block types. Here's how it works:

#### Block Types

Articles are composed of content blocks with the following types:

1. **`subheading`** - Section headings
2. **`normalText`** - Regular paragraph text
3. **`boldText`** - Centered bold text
4. **`verse`** - Quranic verses (styled with color #70A2B7, serif font)
5. **`quote`** - Quoted text with special formatting

#### BlockRenderer Implementation (React/Next.js)

```typescript
// BlockRenderer.tsx
interface Block {
  type: "subheading" | "normalText" | "boldText" | "verse" | "quote";
  text_content: string;
}

export default function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "subheading":
      return (
        <h2 className="mt-8 mb-3 text-[20px] font-bold text-slate-900 font-sans leading-tight">
          {block.text_content}
        </h2>
      );
    
    case "normalText":
      return (
        <p className="text-[17px] leading-[1.7] text-slate-800 font-sans mb-5">
          {block.text_content}
        </p>
      );
    
    case "boldText":
      return (
        <p className="text-[17px] leading-[1.7] text-center text-slate-900 font-sans font-bold mb-5">
          {block.text_content}
        </p>
      );
    
    case "verse":
      return (
        <div className="my-6">
          <p className="text-[18px] leading-[1.9] text-[#70A2B7] font-serif">
            {block.text_content}
          </p>
        </div>
      );
    
    case "quote":
      return (
        <figure className="my-8">
          <div className="flex gap-2 mb-2">
            <Quote className="w-5 h-5 text-slate-300 rotate-180" />
          </div>
          <blockquote className="text-[19px] font-medium leading-relaxed text-slate-900 font-sans italic pl-4 border-l-2 border-slate-200">
            {block.text_content}
          </blockquote>
        </figure>
      );
    
    default:
      return null;
  }
}
```

#### ArticlePreview Usage

```typescript
// ArticlePreview.tsx
import BlockRenderer from "./BlockRenderer";

export default function ArticlePreview({ blocks, ... }) {
  return (
    <div className="bg-white px-6 pt-8 pb-32 space-y-6">
      {blocks.map((block, index) => (
        <div key={index}>
          <BlockRenderer block={block} />
        </div>
      ))}
    </div>
  );
}
```

---

## Implementing in React Native WebView

For Expo/React Native apps, you'll need to render article content in a WebView since React Native doesn't support HTML/CSS directly. Here's how to implement it:

### Step 1: Create HTML Template

Create a function that generates HTML from article blocks:

```typescript
// utils/articleRenderer.ts
interface Block {
  type: "subheading" | "normalText" | "boldText" | "verse" | "quote";
  text_content: string;
}

export function generateArticleHTML(
  title: string,
  excerpt: string,
  blocks: Block[],
  imageUrl?: string
): string {
  const blockHTML = blocks.map(block => {
    switch (block.type) {
      case "subheading":
        return `<h2 style="margin-top: 32px; margin-bottom: 12px; font-size: 20px; font-weight: bold; color: #0f172a; font-family: sans-serif; line-height: 1.5;">
          ${escapeHtml(block.text_content)}
        </h2>`;
      
      case "normalText":
        return `<p style="font-size: 17px; line-height: 1.7; color: #1e293b; font-family: sans-serif; margin-bottom: 20px;">
          ${escapeHtml(block.text_content)}
        </p>`;
      
      case "boldText":
        return `<p style="font-size: 17px; line-height: 1.7; text-align: center; color: #0f172a; font-family: sans-serif; font-weight: bold; margin-bottom: 20px;">
          ${escapeHtml(block.text_content)}
        </p>`;
      
      case "verse":
        return `<div style="margin: 24px 0;">
          <p style="font-size: 18px; line-height: 1.9; color: #70A2B7; font-family: serif;">
            ${escapeHtml(block.text_content)}
          </p>
        </div>`;
      
      case "quote":
        return `<figure style="margin: 32px 0;">
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" style="transform: rotate(180deg);">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <blockquote style="font-size: 19px; font-weight: 500; line-height: 1.6; color: #0f172a; font-family: sans-serif; font-style: italic; padding-left: 16px; border-left: 2px solid #e2e8f0;">
            ${escapeHtml(block.text_content)}
          </blockquote>
        </figure>`;
      
      default:
        return '';
    }
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 24px;
            background: white;
            color: #1e293b;
            line-height: 1.6;
          }
          .article-header {
            margin-bottom: 32px;
          }
          .article-image {
            width: 100%;
            height: auto;
            border-radius: 12px;
            margin-bottom: 24px;
          }
          .article-title {
            font-size: 28px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 12px;
            line-height: 1.2;
          }
          .article-excerpt {
            font-size: 18px;
            line-height: 1.8;
            color: #1e293b;
            font-family: serif;
            margin-bottom: 32px;
          }
        </style>
      </head>
      <body>
        <div class="article-header">
          ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(title)}" class="article-image" />` : ''}
          <h1 class="article-title">${escapeHtml(title)}</h1>
          ${excerpt ? `<div class="article-excerpt">${escapeHtml(excerpt)}</div>` : ''}
        </div>
        <div class="article-content">
          ${blockHTML}
        </div>
      </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  const div = document?.createElement('div') || { textContent: text };
  if (div.textContent !== undefined) {
    div.textContent = text;
    return div.innerHTML;
  }
  // Fallback for React Native
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

### Step 2: Use WebView in React Native

```typescript
// components/ArticleView.tsx
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { getSupabaseClient } from '../lib/supabase/client';
import { generateArticleHTML } from '../utils/articleRenderer';

interface ArticleViewProps {
  articleId: string;
}

export default function ArticleView({ articleId }: ArticleViewProps) {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      const supabase = getSupabaseClient();
      
      // Fetch full article
      const { data, error } = await supabase
        .rpc('get_article_full_by_id', { p_article_id: articleId });

      if (error) throw error;

      // Get image URL if available
      if (data.article.image_path) {
        const { data: imageData } = supabase.storage
          .from('Images')
          .getPublicUrl(data.article.image_path);
        setImageUrl(imageData.publicUrl);
      }

      // Generate HTML
      const articleHTML = generateArticleHTML(
        data.article.title,
        data.article.excerpt || '',
        data.blocks,
        imageUrl || undefined
      );

      setHtml(articleHTML);
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <WebView
      source={{ html }}
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );
}
```

### Step 3: Handle Image URLs in React Native

For React Native, you'll need to handle Supabase storage URLs differently:

```typescript
// utils/imageUtils.ts
export async function getSupabaseImageUrl(imagePath: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) return null;

  try {
    // Try to get signed URL (valid for 1 hour)
    const { data: signedData, error } = await supabase.storage
      .from('Images')
      .createSignedUrl(imagePath, 3600);

    if (!error && signedData?.signedUrl) {
      return signedData.signedUrl;
    }

    // Fallback to public URL
    const { data: publicData } = supabase.storage
      .from('Images')
      .getPublicUrl(imagePath);

    return publicData?.publicUrl || null;
  } catch (error) {
    console.error('Error getting image URL:', error);
    return null;
  }
}
```

---

## Using in Next.js

### Example: Fetching Article Preview

```typescript
// app/articles/[groupId]/page.tsx
import { getSupabaseClient } from '@/lib/supabase/client';

export default async function ArticlePreviewPage({ params }: { params: { groupId: string } }) {
  const supabase = getSupabaseClient();
  const groupId = parseInt(params.groupId);

  const { data, error } = await supabase
    .rpc('get_article_preview_by_group', { p_group_id: groupId });

  if (error || !data || data.length === 0) {
    return <div>Article not found</div>;
  }

  const article = data[0];

  return (
    <div>
      <h1>{article.title}</h1>
      <p>Read time: {article.read_time_minutes} min</p>
      <p>Language: {article.language_id}</p>
      {/* Render preview card */}
    </div>
  );
}
```

### Example: Fetching Full Article

```typescript
// app/articles/view/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import ArticlePreview from '@/components/ArticlePreview';

export default function ArticleViewPage({ params }: { params: { id: string } }) {
  const [articleData, setArticleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [params.id]);

  const loadArticle = async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .rpc('get_article_full_by_id', { p_article_id: params.id });

    if (error) {
      console.error('Error:', error);
      return;
    }

    setArticleData(data);
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;
  if (!articleData) return <div>Article not found</div>;

  return (
    <ArticlePreview
      title={articleData.article.title}
      excerpt={articleData.article.excerpt}
      blocks={articleData.blocks}
      readTime={articleData.article.read_time_minutes}
      imagePath={articleData.article.image_path}
      isShort={articleData.article.is_short}
    />
  );
}
```

---

## Using in Expo

### Example: Fetching Article Preview

```typescript
// screens/ArticlePreviewScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getSupabaseClient } from '../lib/supabase/client';

export default function ArticlePreviewScreen({ route, navigation }: any) {
  const { groupId } = route.params;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [groupId]);

  const loadArticle = async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .rpc('get_article_preview_by_group', { p_group_id: groupId });

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (data && data.length > 0) {
      setArticle(data[0]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Article not found</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ArticleView', { articleId: article.id })}
      style={{ padding: 16, backgroundColor: 'white', margin: 8, borderRadius: 8 }}
    >
      {article.image_path && (
        <Image
          source={{ uri: article.image_path }}
          style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 12 }}
        />
      )}
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        {article.title}
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
        {article.read_time_minutes} min read
      </Text>
      <Text style={{ fontSize: 12, color: '#999' }}>
        Language: {article.language_id}
      </Text>
    </TouchableOpacity>
  );
}
```

### Example: Viewing Full Article in WebView

```typescript
// screens/ArticleViewScreen.tsx
import React from 'react';
import ArticleView from '../components/ArticleView';

export default function ArticleViewScreen({ route }: any) {
  const { articleId } = route.params;

  return <ArticleView articleId={articleId} />;
}
```

---

## Security Considerations

1. **RLS Policies**: Ensure Row Level Security (RLS) is enabled on all tables and RPC functions use `SECURITY DEFINER` appropriately.

2. **Input Validation**: Always validate and sanitize `group_id` and `article_id` inputs before calling RPC functions.

3. **Error Handling**: Implement proper error handling in both Next.js and Expo apps.

4. **Image URLs**: Use signed URLs for private images or ensure public bucket policies are correctly configured.

---

## Testing RPC Functions

You can test RPC functions directly in Supabase SQL Editor:

```sql
-- Test article preview
SELECT * FROM get_article_preview_by_group(1608);

-- Test full article
SELECT * FROM get_article_full_by_id('your-article-uuid-here');

-- Test video preview
SELECT * FROM get_video_preview_by_group(1608);

-- Test audio preview
SELECT * FROM get_audio_preview_by_group(1608);
```

---

## Notes

- All RPC functions use `SECURITY DEFINER` which means they run with the privileges of the function creator. Ensure proper RLS policies are in place.
- The normalization logic ensures group IDs always fall within the 1-1600 range.
- For media items, you may need to add `duration_minutes` or `duration_seconds` columns if they don't exist.
- The HTML generation for WebView should be optimized for mobile viewing with proper viewport settings.
- Consider caching article data on the client side to reduce API calls.

