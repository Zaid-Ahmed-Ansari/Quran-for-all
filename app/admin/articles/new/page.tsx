"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArticleEditor from "../../../components/ArticleEditor";
import ArticlePreview from "../../../components/ArticlePreview";
import { getSupabaseClient } from "../../../lib/supabase/client";

interface Block {
  type: "subheading" | "normalText" | "boldText" | "verse" | "quote";
  text_content: string;
}

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [languageId, setLanguageId] = useState(1);
  const [imagePath, setImagePath] = useState("");
  const [readTimeMinutes, setReadTimeMinutes] = useState(0);
  const [source, setSource] = useState("");
  const [primaryReference, setPrimaryReference] = useState("");
  const [secondaryReference, setSecondaryReference] = useState("");
  const [hadithReference, setHadithReference] = useState("");
  const [propheticWisdomTerm, setPropheticWisdomTerm] = useState("");
  const [quranTerm, setQuranTerm] = useState("");
  const [isShort, setIsShort] = useState(false);

  const handleSave = async (articleData: any) => {
    try {
      const client = getSupabaseClient();

      // Insert article
      const { data: article, error: articleError } = await client
        .from("articles")
        .insert([
          {
            title: articleData.title,
            excerpt: articleData.excerpt,
            language_id: articleData.language_id,
            image_path: articleData.image_path,
            read_time_minutes: articleData.read_time_minutes,
            is_short: articleData.is_short,
            relevance: articleData.relevance,
            primary_reference: articleData.primary_reference,
            hadith_reference: articleData.hadith_reference,
            prophetic_wisdom_term: articleData.prophetic_wisdom_term,
            quran_term: articleData.quran_term,
            source: articleData.source,
          },
        ])
        .select()
        .single();

      if (articleError) throw articleError;

      if (!article) {
        throw new Error("Failed to create article");
      }

      // Insert content blocks
      if (articleData.blocks && articleData.blocks.length > 0) {
        const blocksToInsert = articleData.blocks.map((block: any) => ({
          article_id: article.id,
          type: block.type,
          text_content: block.text_content,
          block_order: block.block_order,
        }));

        const { error: blocksError } = await client
          .from("article_content_blocks")
          .insert(blocksToInsert);

        if (blocksError) throw blocksError;
      }

      // Insert tags (find or create by name)
      if (articleData.tags && articleData.tags.length > 0) {
        const tagLinks = [];
        for (const tagName of articleData.tags) {
          // Find existing tag or create new one
          let { data: existingTag } = await client
            .from("tags")
            .select("id")
            .eq("name", tagName.trim())
            .maybeSingle();

          let tagId;
          if (existingTag) {
            tagId = existingTag.id;
          } else {
            // Create new tag
            const { data: newTag, error: createError } = await client
              .from("tags")
              .insert([{ name: tagName.trim() }])
              .select("id")
              .single();
            
            if (createError) throw createError;
            tagId = newTag.id;
          }

          tagLinks.push({
            article_id: article.id,
            tag_id: tagId,
          });
        }

        if (tagLinks.length > 0) {
          const { error: tagsError } = await client
            .from("article_tags")
            .insert(tagLinks);

          if (tagsError) throw tagsError;
        }
      }

      // Insert topics (find or create by name)
      if (articleData.topics && articleData.topics.length > 0) {
        const topicLinks = [];
        for (const topic of articleData.topics) {
          const topicName = topic.topic_name || topic;
          const relevancyScore = topic.relevancy_score || 5;

          // Find existing topic or create new one
          let { data: existingTopic } = await client
            .from("topics")
            .select("id")
            .eq("name", topicName.trim())
            .maybeSingle();

          let topicId;
          if (existingTopic) {
            topicId = existingTopic.id;
          } else {
            // Create new topic
            const { data: newTopic, error: createError } = await client
              .from("topics")
              .insert([{ name: topicName.trim() }])
              .select("id")
              .single();
            
            if (createError) throw createError;
            topicId = newTopic.id;
          }

          topicLinks.push({
            article_id: article.id,
            topic_id: topicId,
            relevancy_score: relevancyScore,
          });
        }

        if (topicLinks.length > 0) {
          const { error: topicsError } = await client
            .from("article_topics")
            .insert(topicLinks);

          if (topicsError) throw topicsError;
        }
      }

      // Insert group link
      if (articleData.group_id) {
        const { error: groupLinkError } = await client
          .from("article_group_links")
          .insert([{
            article_id: article.id,
            group_id: articleData.group_id,
          }]);

        if (groupLinkError) throw groupLinkError;
      }

      // Insert secondary references
      if (articleData.secondary_references && articleData.secondary_references.length > 0) {
        const secondaryRefsToInsert = articleData.secondary_references.map((ref: string) => ({
          article_id: article.id,
          reference: ref,
        }));

        const { error: secondaryRefsError } = await client
          .from("article_secondary_references")
          .insert(secondaryRefsToInsert);

        if (secondaryRefsError) throw secondaryRefsError;
      }

      // Redirect to articles list
      router.push("/admin/articles");
    } catch (error: any) {
      console.error("Error saving article:", error);
      throw error;
    }
  };

  return (
    <div>
     
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Editor */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <ArticleEditor
            title={title}
            excerpt={excerpt}
            blocks={blocks}
            languageId={languageId}
            imagePath={imagePath}
            readTimeMinutes={readTimeMinutes}
            isShort={isShort}
            source={source}
            primaryReference={primaryReference}
            secondaryReference={secondaryReference}
            hadithReference={hadithReference}
            propheticWisdomTerm={propheticWisdomTerm}
            quranTerm={quranTerm}
            onTitleChange={setTitle}
            onExcerptChange={setExcerpt}
            onBlocksChange={setBlocks}
            onImagePathChange={setImagePath}
            onReadTimeChange={setReadTimeMinutes}
            onLanguageIdChange={setLanguageId}
            onSourceChange={setSource}
            onPrimaryReferenceChange={setPrimaryReference}
            onSecondaryReferenceChange={setSecondaryReference}
            onHadithReferenceChange={setHadithReference}
            onPropheticWisdomTermChange={setPropheticWisdomTerm}
            onQuranTermChange={setQuranTerm}
            onIsShortChange={setIsShort}
            onSave={handleSave}
          />
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:sticky lg:top-8 lg:h-fit" style={{ zIndex: 0 }}>
          
          <ArticlePreview
            title={title || "Article Title"}
            excerpt={excerpt}
            blocks={blocks}
            readTime={readTimeMinutes}
            imagePath={imagePath ? (imagePath.includes('/') ? imagePath.split('/').pop() : imagePath) : undefined}
            isShort={isShort}
          />
        </div>
      </div>
    </div>
  );
}

