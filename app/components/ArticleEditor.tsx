"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Plus, GripVertical, Trash2, ChevronUp, ChevronDown, Save, Eye, 
  Type, Heading, FileText, Quote, BookOpen, Tag, Settings, 
  Layout, Globe, Hash, Link as LinkIcon, AlertCircle, CheckCircle2,
  MoreVertical, X, Image as ImageIcon, Upload, Loader2, Menu
} from "lucide-react";
import { getSupabaseClient } from "../lib/supabase/client";

// --- Language Mapping ---
const LANGUAGE_MAP: Record<number, string> = {
  1: "English",
  2: "Arabic",
  3: "Urdu",
};

// --- Interfaces (Kept identical to ensure data compatibility) ---
interface ContentBlock {
  type: "subheading" | "normalText" | "boldText" | "verse" | "quote";
  text_content: string;
  block_order: number;
}

interface Block {
  type: "subheading" | "normalText" | "boldText" | "verse" | "quote";
  text_content: string;
}

interface ArticleEditorProps {
  title?: string;
  excerpt?: string;
  blocks?: Block[];
  languageId?: number;
  imagePath?: string;
  readTimeMinutes?: number;
  isShort?: boolean;
  source?: string;
  primaryReference?: string;
  secondaryReference?: string; 
  initialSecondaryReferences?: string[];
  hadithReference?: string;
  propheticWisdomTerm?: string;
  quranTerm?: string;
  initialTags?: string[];
  initialTopics?: string[];
  initialTopicRelevancyScores?: Record<string, number>;
  initialGroupId?: number | null;
  onIsShortChange?: (value: boolean) => void;
  onTitleChange?: (title: string) => void;
  onExcerptChange?: (excerpt: string) => void;
  onBlocksChange?: (blocks: Block[]) => void;
  onImagePathChange?: (imagePath: string) => void;
  onReadTimeChange?: (readTime: number) => void;
  onLanguageIdChange?: (languageId: number) => void;
  onSourceChange?: (source: string) => void;
  onPrimaryReferenceChange?: (primaryReference: string) => void;
  onSecondaryReferenceChange?: (secondaryReference: string) => void;
  onHadithReferenceChange?: (hadithReference: string) => void;
  onPropheticWisdomTermChange?: (propheticWisdomTerm: string) => void;
  onQuranTermChange?: (quranTerm: string) => void;
  onSave?: (articleData: any) => Promise<void>;
  articleId?: number;
}

export default function ArticleEditor({
  title: propTitle,
  excerpt: propExcerpt,
  blocks: propBlocks,
  languageId: propLanguageId,
  imagePath: propImagePath,
  readTimeMinutes: propReadTimeMinutes,
  isShort: propIsShort,
  source: propSource,
  primaryReference: propPrimaryReference,
  secondaryReference: propSecondaryReference,
  hadithReference: propHadithReference,
  propheticWisdomTerm: propPropheticWisdomTerm,
  quranTerm: propQuranTerm,
  onTitleChange,
  onExcerptChange,
  onBlocksChange,
  onImagePathChange,
  onReadTimeChange,
  onIsShortChange,
  onLanguageIdChange,
  onSourceChange,
  onPrimaryReferenceChange,
  onSecondaryReferenceChange,
  onHadithReferenceChange,
  onPropheticWisdomTermChange,
  onQuranTermChange,
  initialTags,
  initialTopics,
  initialTopicRelevancyScores,
  initialGroupId,
  initialSecondaryReferences,
  onSave,
  articleId,
}: ArticleEditorProps = {}) {
  // Fetch existing tags and topics on mount
  useEffect(() => {
    const fetchTagsAndTopics = async () => {
      try {
        const client = getSupabaseClient();
        
        // Fetch tags
        const { data: tags, error: tagsError } = await client
          .from("tags")
          .select("id, name")
          .order("name");
        
        if (!tagsError && tags) {
          setAvailableTags(tags);
        }
        
        // Fetch topics
        const { data: topics, error: topicsError } = await client
          .from("topics")
          .select("id, name")
          .order("name");
        
        if (!topicsError && topics) {
          setAvailableTopics(topics);
        }
      } catch (error) {
        console.error("Error fetching tags/topics:", error);
      }
    };
    
    fetchTagsAndTopics();
  }, []);
  // --- State Management ---
  const blockRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [internalTitle, setInternalTitle] = useState(propTitle ?? "");
  const [internalExcerpt, setInternalExcerpt] = useState(propExcerpt ?? "");
  const [internalBlocks, setInternalBlocks] = useState<ContentBlock[]>(
    propBlocks ? propBlocks.map((b, i) => ({ ...b, block_order: i } as ContentBlock)) : []
  );
  
  // Derived state for controlled vs uncontrolled
  const title = propTitle !== undefined ? propTitle : internalTitle;
  const excerpt = propExcerpt !== undefined ? propExcerpt : internalExcerpt;
  const blocks = propBlocks !== undefined 
    ? propBlocks.map((b, i) => ({ ...b, block_order: i } as ContentBlock))
    : internalBlocks;

  // Handlers
  const setTitle = (value: string) => onTitleChange ? onTitleChange(value) : setInternalTitle(value);
  const setExcerpt = (value: string) => onExcerptChange ? onExcerptChange(value) : setInternalExcerpt(value);
  
  const setBlocks = (value: ContentBlock[]) => {
    if (onBlocksChange) {
      onBlocksChange(value.map(b => ({
        type: b.type,
        text_content: b.text_content,
      })));
    } else {
      setInternalBlocks(value);
    }
  };

  // Metadata State
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags || []);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialTopics || []);
  const [topicRelevancyScores, setTopicRelevancyScores] = useState<Record<string, number>>(
    initialTopicRelevancyScores || {}
  );
  const [availableTags, setAvailableTags] = useState<{ id: number; name: string }[]>([]);
  const [availableTopics, setAvailableTopics] = useState<{ id: number; name: string }[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showTopicSuggestions, setShowTopicSuggestions] = useState(false);
  
  const [internalLanguageId, setInternalLanguageId] = useState(propLanguageId ?? 1);
  const [internalReadTime, setInternalReadTime] = useState(propReadTimeMinutes ?? 5);
  const [internalIsShort, setInternalIsShort] = useState(propIsShort ?? false);
  const [internalSource, setInternalSource] = useState(propSource ?? "");
  const [internalPrimaryReference, setInternalPrimaryReference] = useState(propPrimaryReference ?? "");
  const [internalSecondaryReferences, setInternalSecondaryReferences] = useState<string[]>(
    initialSecondaryReferences || (propSecondaryReference ? [propSecondaryReference] : [])
  );
  const [internalHadithReference, setInternalHadithReference] = useState(propHadithReference ?? "");
  const [internalPropheticWisdomTerm, setInternalPropheticWisdomTerm] = useState(propPropheticWisdomTerm ?? "");
  const [internalQuranTerm, setInternalQuranTerm] = useState(propQuranTerm ?? "");
  const [internalImagePath, setInternalImagePath] = useState(propImagePath ?? "");

  // Derived Metadata
  const languageId = propLanguageId !== undefined ? propLanguageId : internalLanguageId;
  const readTime = propReadTimeMinutes !== undefined ? propReadTimeMinutes : internalReadTime;
  const isShort = propIsShort !== undefined ? propIsShort : internalIsShort;
  const imagePath = propImagePath !== undefined ? propImagePath : internalImagePath;
  const source = propSource !== undefined ? propSource : internalSource;
  const primaryReference = propPrimaryReference !== undefined ? propPrimaryReference : internalPrimaryReference;
  const secondaryReferences = internalSecondaryReferences;
  const hadithReference = propHadithReference !== undefined ? propHadithReference : internalHadithReference;
  const propheticWisdomTerm = propPropheticWisdomTerm !== undefined ? propPropheticWisdomTerm : internalPropheticWisdomTerm;
  const quranTerm = propQuranTerm !== undefined ? propQuranTerm : internalQuranTerm;

  // Get Supabase URL for image display (supports both public and private buckets)
  const getImageUrl = async (path: string | null | undefined): Promise<string | null> => {
    if (!path) return null;
    
    // If it's already a full URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    try {
      const client = getSupabaseClient();
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      
      if (!supabaseUrl) {
        console.error("NEXT_PUBLIC_SUPABASE_URL is not defined");
        return null;
      }
      
      // Try to get signed URL first (for private buckets)
      // Signed URLs expire after the specified time (3600 seconds = 1 hour)
      try {
        const { data: signedData, error: signedError } = await client.storage
          .from('Images')
          .createSignedUrl(path, 3600); // Valid for 1 hour
        
        if (!signedError && signedData?.signedUrl) {
          return signedData.signedUrl;
        }
      } catch (signedErr) {
        // If signed URL fails, try public URL (for public buckets)
        console.warn("Signed URL generation failed, trying public URL:", signedErr);
      }
      
      // Fallback to public URL (for public buckets)
      try {
        const { data } = client.storage.from('Images').getPublicUrl(path);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      } catch (publicError) {
        console.warn("Public URL also failed:", publicError);
      }
      
      // Last resort: construct public URL manually
      return `${supabaseUrl}/storage/v1/object/public/Images/${path}`;
    } catch (error) {
      console.error("Error getting image URL:", error);
      return null;
    }
  };

  // Load existing images from Supabase storage
  const loadExistingImages = async () => {
    setLoadingImages(true);
    setSaveStatus({ type: null, message: "" });
    
    try {
      const client = getSupabaseClient();
      
      // First, verify bucket exists and is accessible
      const { data: buckets, error: bucketError } = await client.storage.listBuckets();
      
      if (bucketError) {
        throw new Error(`Failed to access storage: ${bucketError.message}`);
      }
      
      // Check if bucket exists, but don't block if it doesn't - let the list operation handle it
      const imagesBucket = buckets?.find(b => b.name === 'Images');
      if (!imagesBucket) {
        // Don't throw error here - let the list operation fail gracefully
        // This allows users to still try uploading which might create the bucket
        console.warn("Storage bucket 'Images' not found. It may be created on first upload.");
      }
      
      // List files in the Article_Images folder
      const { data, error } = await client.storage
        .from('Images')
        .list('Article_Images', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        // Check if it's a bucket not found error
        if (error.message?.includes('Bucket not found') || error.message?.includes('does not exist') || error.message?.includes('not found')) {
          const errorMsg = `Storage bucket 'Images' not found. 

To fix this:
1. Go to your Supabase Dashboard → Storage
2. Click "New bucket"
3. Name it exactly: "Images" (case-sensitive)
4. Make it Public or set policies to allow reads
5. Refresh this page`;
          setExistingImages([]);
          setSaveStatus({ type: "error", message: errorMsg });
          return;
        }
        // Check if it's just a folder not found error (bucket exists but folder doesn't)
        if (error.message?.includes('folder') || error.message?.includes('path')) {
          console.warn("Article_Images folder not found, it will be created when you upload your first image");
          setExistingImages([]);
          setSaveStatus({ type: null, message: "" });
          return;
        }
        throw new Error(`Failed to list images: ${error.message}`);
      }

      if (!data || data.length === 0) {
        setExistingImages([]);
        setSaveStatus({ type: null, message: "No images found in Article_Images folder" });
        return;
      }

      const imageFiles = data.filter(file => {
        // Filter out folders and only include image files
        if (!file.name || file.id === null) return false;
        return file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
      });

      if (imageFiles.length === 0) {
        setExistingImages([]);
        setSaveStatus({ type: null, message: "No image files found (only folders or non-image files)" });
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
      }

      // Generate signed URLs for all images (supports private buckets)
      const imagesWithUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const path = `Article_Images/${file.name}`;
          const url = await getImageUrl(path);
          
          if (!url) {
            console.warn(`Failed to generate URL for image: ${file.name}`);
          }
          
          return {
            name: file.name,
            url: url || `${supabaseUrl}/storage/v1/object/public/Images/${path}`,
            path: path
          };
        })
      );

      setExistingImages(imagesWithUrls);
      
      if (imagesWithUrls.length > 0) {
        setSaveStatus({ type: null, message: `Loaded ${imagesWithUrls.length} image(s)` });
      }
    } catch (error: any) {
      console.error("Error loading images:", error);
      const errorMessage = error?.message || error?.toString() || "Failed to load images. Please check your Supabase configuration.";
      setSaveStatus({ type: "error", message: errorMessage });
      setExistingImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!file) {
      setSaveStatus({ type: "error", message: "No file selected" });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!file.type || !validTypes.includes(file.type.toLowerCase())) {
      setSaveStatus({ type: "error", message: `Invalid file type: ${file.type || 'unknown'}. Please upload: JPEG, PNG, GIF, WEBP, or SVG` });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setSaveStatus({ type: "error", message: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` });
      return;
    }

    setIsUploadingImage(true);
    setSaveStatus({ type: null, message: "" });
    
    try {
      const client = getSupabaseClient();
      
      // Verify bucket exists
      const { data: buckets, error: bucketError } = await client.storage.listBuckets();
      if (bucketError) {
        throw new Error(`Failed to access storage: ${bucketError.message}`);
      }
      
      // Try to upload directly - if bucket doesn't exist, the error will be more specific
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `Article_Images/${fileName}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await client.storage
        .from('Images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Provide more specific error messages
        if (uploadError.message?.includes('already exists')) {
          throw new Error(`File with name "${fileName}" already exists. Please try again.`);
        } else if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('does not exist')) {
          const errorMsg = `Storage bucket 'Images' not found. 

To fix this:
1. Go to your Supabase Dashboard → Storage
2. Click "New bucket"
3. Name it exactly: "Images" (case-sensitive)
4. Make it Public or set policies to allow uploads
5. Try uploading again`;
          throw new Error(errorMsg);
        } else if (uploadError.message?.includes('permission') || uploadError.message?.includes('policy')) {
          throw new Error("Permission denied. Please check your Supabase storage policies. The bucket needs policies that allow INSERT operations.");
        } else if (uploadError.message?.includes('size') || uploadError.message?.includes('limit')) {
          throw new Error("File size limit exceeded. Please use a smaller image.");
        }
        throw new Error(`Upload failed: ${uploadError.message || 'Unknown error'}`);
      }

      if (!uploadData?.path) {
        throw new Error("Upload completed but no file path returned");
      }

      // Update image path
      if (onImagePathChange) {
        onImagePathChange(filePath);
      } else {
        setInternalImagePath(filePath);
      }

      // Set preview
      const imageUrl = await getImageUrl(filePath);
      if (!imageUrl) {
        console.warn("Failed to generate preview URL, but upload succeeded");
      }
      setImagePreview(imageUrl);

      // Close modal
      setShowImageModal(false);
      setImageModalMode(null);
      setExistingImages([]); // Clear existing images list

      setSaveStatus({ type: "success", message: `Image "${file.name}" uploaded successfully` });
      setTimeout(() => setSaveStatus({ type: null, message: "" }), 5000);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      const errorMessage = error?.message || error?.toString() || "Failed to upload image. Please try again.";
      setSaveStatus({ type: "error", message: errorMessage });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle selecting existing image
  const handleSelectExistingImage = async (imagePath: string) => {
    try {
      if (!imagePath) {
        setSaveStatus({ type: "error", message: "No image path provided" });
        return;
      }

      if (onImagePathChange) {
        onImagePathChange(imagePath);
      } else {
        setInternalImagePath(imagePath);
      }
      
      const imageUrl = await getImageUrl(imagePath);
      if (!imageUrl) {
        console.warn("Failed to generate preview URL for selected image");
        setSaveStatus({ type: "error", message: "Failed to load image preview. The image may have been deleted." });
        return;
      }
      
      setImagePreview(imageUrl);
      setShowImageModal(false);
      setImageModalMode(null);
      setExistingImages([]);
      
      setSaveStatus({ type: "success", message: "Image selected successfully" });
      setTimeout(() => setSaveStatus({ type: null, message: "" }), 3000);
    } catch (error: any) {
      console.error("Error selecting image:", error);
      setSaveStatus({ type: "error", message: error?.message || "Failed to select image" });
    }
  };

  // Handle image removal
  const handleImageRemove = async () => {
    if (!imagePath) return;

    try {
      const client = getSupabaseClient();
      
      // Delete from storage (only if it's in our bucket)
      if (imagePath.startsWith('Article_Images/')) {
        const { error: deleteError } = await client.storage
          .from('Images')
          .remove([imagePath]);

        if (deleteError) {
          console.error("Error deleting image:", deleteError);
          // Continue anyway to remove from form
        }
      }

      // Clear image path
      if (onImagePathChange) {
        onImagePathChange("");
      } else {
        setInternalImagePath("");
      }
      setImagePreview(null);
    } catch (error: any) {
      console.error("Error removing image:", error);
    }
  };

  // Load image preview on mount or when imagePath changes
  useEffect(() => {
    const loadPreview = async () => {
      if (imagePath) {
        const url = await getImageUrl(imagePath);
        setImagePreview(url);
      } else {
        setImagePreview(null);
      }
    };
    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePath]);

  // Metadata Handlers
  const handleLanguageIdChange = (v: number) => onLanguageIdChange ? onLanguageIdChange(v) : setInternalLanguageId(v);
  const handleReadTimeChange = (v: number) => onReadTimeChange ? onReadTimeChange(v) : setInternalReadTime(v);
  const handleIsShortChange = (v: boolean) => {
    if (v && activeTab === "taxonomy") {
      // Switch to general tab if taxonomy is hidden for short articles
      setActiveTab("general");
    }
    onIsShortChange ? onIsShortChange(v) : setInternalIsShort(v);
  };
  const handleSourceChange = (v: string) => onSourceChange ? onSourceChange(v) : setInternalSource(v);
  const handlePrimaryReferenceChange = (v: string) => onPrimaryReferenceChange ? onPrimaryReferenceChange(v) : setInternalPrimaryReference(v);
  const handleHadithReferenceChange = (v: string) => onHadithReferenceChange ? onHadithReferenceChange(v) : setInternalHadithReference(v);
  const handlePropheticWisdomTermChange = (v: string) => onPropheticWisdomTermChange ? onPropheticWisdomTermChange(v) : setInternalPropheticWisdomTerm(v);
  const handleQuranTermChange = (v: string) => onQuranTermChange ? onQuranTermChange(v) : setInternalQuranTerm(v);

  // Secondary References Array Logic
  const addSecondaryReference = () => setInternalSecondaryReferences([...internalSecondaryReferences, ""]);
  const updateSecondaryReference = (index: number, value: string) => {
    const updated = [...internalSecondaryReferences];
    updated[index] = value;
    setInternalSecondaryReferences(updated);
  };
  const removeSecondaryReference = (index: number) => setInternalSecondaryReferences(internalSecondaryReferences.filter((_, i) => i !== index));

  // --- UI State ---
  const [activeTab, setActiveTab] = useState<"general" | "taxonomy" | "refs">("general");
  const [showSidebar, setShowSidebar] = useState(false);
  const [relevance, setRelevance] = useState(5);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(initialGroupId || null);
  const [groupSearchId, setGroupSearchId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalMode, setImageModalMode] = useState<"select" | "upload" | null>(null);
  const [existingImages, setExistingImages] = useState<{ name: string; url: string; path: string }[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // --- Validation & Save ---
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Title is always required
    if (!title?.trim()) newErrors.title = "Title is required";
    
    // Read time is always required
    if (!readTime || readTime < 1) newErrors.readTime = "Read time is required (minimum 1 minute)";
    
    // Group ID is always required
    if (!selectedGroupId || selectedGroupId < 1) newErrors.groupId = "Group ID is required";
    
    // For short articles: only require title, source, and at least one block
    if (isShort) {
      if (!source?.trim()) newErrors.source = "Source is required for short articles";
      if (blocks.length === 0) newErrors.blocks = "At least one content block is required";
      // Validate that at least one block has content
      const hasContent = blocks.some(block => block.text_content?.trim());
      if (!hasContent) newErrors.blocks = "At least one content block with text is required";
    } else {
      // For regular articles: require title, excerpt, and blocks
      if (!excerpt?.trim()) newErrors.excerpt = "Excerpt is required";
      if (blocks.length === 0) newErrors.blocks = "Content is required";
    }
    
    // Validate all blocks have content (only show error for empty blocks)
    blocks.forEach((block, index) => {
      if (!block.text_content?.trim()) newErrors[`block_${index}`] = "Empty block";
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setErrors({});
    setSaveStatus({ type: null, message: "" });
    if (!validateForm()) {
      setSaveStatus({ type: "error", message: "Check required fields" });
      return;
    }

    setIsSaving(true);
    try {
      const articleData = {
        title: title.trim(),
        excerpt: isShort ? null : (excerpt.trim() || null),
        language_id: languageId,
        image_path: imagePath || null,
        read_time_minutes: readTime,
        is_short: isShort,
        relevance: relevance,
        primary_reference: primaryReference.trim().substring(0, 255) || null,
        secondary_references: secondaryReferences.map(r => r.trim()).filter(r => r).map(r => r.substring(0, 255)),
        hadith_reference: hadithReference.trim() || null,
        prophetic_wisdom_term: propheticWisdomTerm.trim().substring(0, 255) || null,
        quran_term: quranTerm.trim().substring(0, 255) || null,
        source: source.trim() || null,
        tags: isShort ? [] : selectedTags, // No tags for short articles
        topics: isShort ? [] : selectedTopics.map(name => ({ topic_name: name, relevancy_score: topicRelevancyScores[name] || 5 })), // No topics for short articles
        group_id: selectedGroupId,
        blocks: blocks.map((b, i) => ({ type: b.type, text_content: b.text_content.trim(), block_order: i })),
        articleId,
      };
      if (onSave) {
        await onSave(articleData);
        setSaveStatus({ type: "success", message: "Saved successfully" });
        setTimeout(() => setSaveStatus({ type: null, message: "" }), 3000);
      }
    } catch (error: any) {
      setSaveStatus({ type: "error", message: error.message || "Save failed" });
    } finally {
      setIsSaving(false);
    }
  };

  // --- Block Manipulation ---
  const addBlock = (type: ContentBlock["type"]) => {
    const newIndex = blocks.length;
    const newBlock: ContentBlock = { type, text_content: "", block_order: newIndex };
    setBlocks([...blocks, newBlock]);
    setActiveBlockIndex(newIndex);

    // Focus and scroll the newly added block into view
    requestAnimationFrame(() => {
      const el = blockRefs.current[newIndex];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
    });
  };
  const updateBlock = (index: number, text: string) => {
    const updated = [...blocks];
    updated[index].text_content = text;
    setBlocks(updated);
  };
  const removeBlock = (index: number) => setBlocks(blocks.filter((_, i) => i !== index).map((b, i) => ({ ...b, block_order: i })));
  const moveBlock = (index: number, dir: "up" | "down") => {
    if ((dir === "up" && index === 0) || (dir === "down" && index === blocks.length - 1)) return;
    const updated = [...blocks];
    const target = dir === "up" ? index - 1 : index + 1;
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setBlocks(updated.map((b, i) => ({ ...b, block_order: i })));
  };

  // --- Render Helpers ---
  const blockConfig = {
    subheading: { label: "Heading", icon: Heading, style: "bg-white", textStyle: "font-sans text-2xl font-bold text-slate-800 mt-6" },
    normalText: { label: "Text", icon: Type, style: "bg-white", textStyle: "font-serif text-lg leading-relaxed text-slate-700" },
    boldText: { label: "Bold Text", icon: Type, style: "bg-white", textStyle: "font-serif text-lg leading-relaxed text-slate-900 text-center font-bold" },
    verse: { label: "Verse", icon: BookOpen, style: "bg-purple-50/30 border-purple-100 my-4", textStyle: "font-serif text-xl italic  text-purple-900 leading-loose" },
    quote: { label: "Quote", icon: Quote, style: "bg-amber-50/30 border-l-4 border-amber-400 pl-4", textStyle: "font-serif text-lg italic text-slate-600" },
  };

  // --- Sync Effects ---
  useEffect(() => { if (initialTags) setSelectedTags(initialTags); }, [initialTags]);
  useEffect(() => { if (initialTopics) setSelectedTopics(initialTopics); if (initialTopicRelevancyScores) setTopicRelevancyScores(initialTopicRelevancyScores); }, [initialTopics]);

  return (
    <div className="flex min-h-screen w-full bg-white overflow-hidden font-sans text-slate-900">
      
      {/* --- LEFT: Main Editor Canvas --- */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-slate-50/30">
        
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur px-4 sm:px-6 lg:px-8 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowSidebar(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={20} className="text-slate-700" />
            </button>
            <div className="h-8 w-8 rounded bg-slate-900 text-white flex items-center justify-center">
              <FileText size={16} />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 leading-tight">Editor</h1>
              <div className="text-xs text-slate-500 flex items-center gap-1 hidden sm:flex">
                {isSaving ? "Saving..." : saveStatus.message || (articleId ? `ID: ${articleId}` : "New Draft")}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
             {saveStatus.type === 'error' && (
                <span className="text-xs text-red-600 font-medium flex items-center gap-1 bg-red-50 px-2 py-1 rounded hidden sm:flex">
                   <AlertCircle size={12} /> <span className="hidden md:inline">{saveStatus.message}</span>
                </span>
             )}
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
            >
              {isSaving ? <span className="animate-pulse hidden sm:inline">Saving...</span> : <><Save size={14} /> <span className="hidden sm:inline">Publish</span></>}
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pb-32 scroll-smooth">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pl-4 sm:pl-8 lg:pl-16">
            
            {/* Meta Header Inputs */}
            <div className="group mb-8">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Untitled Article"
                className="w-full text-4xl font-extrabold tracking-tight text-slate-900 placeholder:text-slate-300 border-none outline-none bg-transparent p-0"
              />
               {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            {!isShort && (
              <div className="group mb-12 relative">
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <textarea
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  placeholder="Add a short excerpt or summary..."
                  className="w-full text-xl text-slate-500 placeholder:text-slate-300 border-none outline-none bg-transparent p-0 pl-4 resize-none font-serif"
                  rows={2}
                />
                {errors.excerpt && <p className="text-xs text-red-500 mt-1 pl-4">{errors.excerpt}</p>}
              </div>
            )}

            {/* Dynamic Blocks */}
            <div className="space-y-4 min-h-[200px]">
              {blocks.map((block, index) => {
                const config = blockConfig[block.type];
                const isActive = activeBlockIndex === index;
                
                return (
                  <div 
                    key={index} 
                    className={`relative group transition-all duration-200 ${isActive ? 'scale-[1.01]' : ''}`}
                    onFocus={() => setActiveBlockIndex(index)}
                    onBlur={() => setActiveBlockIndex(null)}
                  >
                    {/* Hover Controls (Left Gutter - positioned inside viewport) */}
                    <div className="absolute -left-12 sm:-left-14 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
                      <div className="flex flex-col bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
                        <button 
                          onClick={() => moveBlock(index, 'up')} 
                          disabled={index === 0}
                          className="p-2 sm:p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                          title="Move up"
                        >
                           <ChevronUp size={14} className="sm:w-3 sm:h-3" />
                        </button>
                        <button 
                          onClick={() => moveBlock(index, 'down')} 
                          disabled={index === blocks.length - 1}
                          className="p-2 sm:p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                          title="Move down"
                        >
                           <ChevronDown size={14} className="sm:w-3 sm:h-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeBlock(index)} 
                        className="p-2 sm:p-1.5 bg-white border border-slate-200 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 shadow-sm transition-colors min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                        title="Delete block"
                      >
                        <Trash2 size={14} className="sm:w-3 sm:h-3" />
                      </button>
                    </div>

                    {/* Block Content */}
                    <div className={`
                      relative rounded-lg p-1 transition-colors
                      ${config.style}
                      ${errors[`block_${index}`] ? 'ring-2 ring-red-100 bg-red-50/50' : 'hover:bg-slate-50/50'}
                    `}>
                        {block.type !== 'normalText' && (
                           <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-50 text-[10px] uppercase font-bold text-slate-400 pointer-events-none select-none">
                              {config.label}
                           </div>
                        )}
                      <textarea
                        value={block.text_content}
                        onChange={e => updateBlock(index, e.target.value)}
                        placeholder={`Type ${config.label.toLowerCase()}...`}
                        className={`w-full bg-transparent border-none outline-none resize-none p-2 ${config.textStyle}`}
                        rows={block.type === 'normalText' ? undefined : 2}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = target.scrollHeight + 'px';
                        }}
                        ref={r => { 
                          blockRefs.current[index] = r; 
                          if(r) { 
                            r.style.height = 'auto'; 
                            r.style.height = r.scrollHeight + 'px'; 
                          } 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {blocks.length === 0 && (
                 <div className="h-40 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
                    <p>Start writing by adding a block below</p>
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Floating Bar for Add Block (always in viewport) */}
        <div className="fixed bottom-6 left-0 right-4 xl:right-[22rem] flex justify-center z-30 pointer-events-none px-4">
           <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-xl rounded-full px-2 py-2 flex items-center gap-1 pointer-events-auto transform transition-transform hover:scale-105">
              {Object.entries(blockConfig).map(([key, conf]) => (
                 <button
                    key={key}
                    onClick={() => addBlock(key as any)}
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors gap-1 group relative"
                    title={`Add ${conf.label}`}
                 >
                    <conf.icon size={18} />
                    <span className="text-[9px] font-medium opacity-0 group-hover:opacity-100 absolute -bottom-4 bg-slate-800 text-white px-2 rounded whitespace-nowrap transition-all delay-75">
                        {conf.label}
                    </span>
                 </button>
              ))}
           </div>
        </div>
      </div>

      {/* --- RIGHT: Settings Sidebar --- */}
      {/* Mobile Overlay Backdrop */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 right-0 w-80 border-l border-slate-200 bg-white flex flex-col h-full z-50 lg:z-20 shadow-[0_0_20px_rgba(0,0,0,0.03)] transform transition-transform duration-300 ${
        showSidebar ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        {/* Sidebar Header with Close Button */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Settings</h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} className="text-slate-700" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab("general")} 
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'general' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            General
          </button>
          {!isShort && (
            <button 
              onClick={() => setActiveTab("taxonomy")} 
              className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'taxonomy' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Tags
            </button>
          )}
          <button 
            onClick={() => setActiveTab("refs")} 
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === 'refs' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Refs
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 sm:space-y-8 custom-scrollbar">
          
          {/* --- Tab: General --- */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <section className="space-y-3">
                <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                   <Layout size={12} /> Formatting
                </label>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-sm text-slate-600">Short Article</span>
                      <input type="checkbox" checked={isShort} onChange={e => handleIsShortChange(e.target.checked)} className="accent-slate-900 h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                       <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Relevance</span>
                          <span className="font-mono font-bold">{relevance}</span>
                       </div>
                       <input 
                        type="range" min="1" max="10" value={relevance} 
                        onChange={e => setRelevance(Number(e.target.value))} 
                        className="w-full accent-slate-900 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                      />
                    </div>
                </div>
              </section>

              <section className="space-y-3">
                 <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                    <ImageIcon size={12} /> Article Image
                 </label>
                 <div className="space-y-3">
                    {imagePreview ? (
                       <div className="relative group">
                          <img 
                             src={imagePreview} 
                             alt="Article preview" 
                             className="w-full h-48 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                             type="button"
                             onClick={handleImageRemove}
                             className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                             title="Remove image"
                          >
                             <X size={16} />
                          </button>
                          <button
                             type="button"
                             onClick={() => setShowImageModal(true)}
                             className="absolute top-2 left-2 px-3 py-1.5 bg-white/90 hover:bg-white text-slate-700 text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                             title="Change image"
                          >
                             Change
                          </button>
                          <div className="mt-2 text-xs text-slate-500 truncate">
                             {imagePath}
                          </div>
                       </div>
                    ) : (
                       <button
                          type="button"
                          onClick={() => setShowImageModal(true)}
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
                       >
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <p className="text-xs text-slate-600 font-medium">Add Article Image</p>
                          <p className="text-xs text-slate-400 mt-1">Click to select or upload</p>
                       </button>
                    )}
                 </div>
              </section>

              <section className="space-y-3">
                 <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                    <Settings size={12} /> Meta Data
                 </label>
                 <div className="space-y-3">
                    <div>
                       <span className="text-xs text-slate-500 mb-1 block">Language</span>
                       <select 
                          value={languageId} 
                          onChange={e => handleLanguageIdChange(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:border-slate-400 outline-none transition-all"
                        >
                          {Object.entries(LANGUAGE_MAP).map(([id, name]) => (
                            <option key={id} value={id}>
                              {name}
                            </option>
                          ))}
                        </select>
                    </div>
                    <div>
                       <span className="text-xs text-slate-500 mb-1 block">Read Time (min) <span className="text-red-500">*</span></span>
                       <input 
                          type="number" 
                          min="1"
                          required
                          value={readTime} 
                          onChange={e => handleReadTimeChange(Number(e.target.value))}
                          className={`w-full px-3 py-2 bg-slate-50 border rounded text-sm focus:border-slate-400 outline-none transition-all ${
                            errors.readTime ? 'border-red-300' : 'border-slate-200'
                          }`}
                        />
                       {errors.readTime && <p className="text-xs text-red-500 mt-1">{errors.readTime}</p>}
                    </div>
                 </div>
              </section>

              <section className="space-y-3 pt-4 border-t border-slate-100">
                 <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                    <Settings size={12} /> Group ID <span className="text-red-500 text-xs normal-case font-normal">*</span>
                 </label>
                 <input 
                    type="number"
                    min="1"
                    required
                    value={selectedGroupId || ''}
                    onChange={e => setSelectedGroupId(e.target.value ? Number(e.target.value) : null)}
                    placeholder="Group ID (required)"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded text-sm focus:border-slate-400 outline-none ${
                      errors.groupId ? 'border-red-300' : 'border-slate-200'
                    }`}
                 />
                 {errors.groupId && <p className="text-xs text-red-500 mt-1">{errors.groupId}</p>}
              </section>
            </div>
          )}

          {/* --- Tab: Taxonomy (Tags/Topics) --- */}
          {activeTab === "taxonomy" && !isShort && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <section className="space-y-3">
                  <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                     <Tag size={12} /> Tags
                  </label>
                  
                  {/* Tags Input Container with Chips */}
                  <div className="min-h-[44px] w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200/50 transition-all">
                     <div className="flex flex-wrap gap-2 items-center">
                        {/* Display Selected Tags as Chips */}
                        {selectedTags.map((tag, idx) => (
                           <span 
                              key={idx} 
                              className="px-3 py-1.5 rounded-full text-xs font-medium border bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 flex items-center gap-1.5 transition-colors"
                           >
                              {tag}
                              <button
                                 type="button"
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTags(selectedTags.filter((_, i) => i !== idx));
                                 }}
                                 className="hover:opacity-70 transition-opacity ml-0.5"
                                 aria-label={`Remove ${tag}`}
                              >
                                 <X size={14} strokeWidth={2.5} />
                              </button>
                           </span>
                        ))}
                        
                        {/* Input Field */}
                        <div className="relative flex-1 min-w-[120px]">
                           <input 
                              type="text" 
                              placeholder={selectedTags.length === 0 ? "Type tags and press Enter or comma..." : "Add more tags..."}
                              value={tagInput}
                              onChange={e => {
                                 const value = e.target.value;
                                 setTagInput(value);
                                 
                                 // Handle comma separation
                                 if (value.includes(',')) {
                                    const parts = value.split(',').map(s => s.trim()).filter(s => s);
                                    parts.forEach(part => {
                                       if (part && !selectedTags.includes(part)) {
                                          setSelectedTags(prev => [...prev, part]);
                                       }
                                    });
                                    setTagInput("");
                                    return;
                                 }
                                 
                                 setShowTagSuggestions(true);
                              }}
                              onFocus={() => setShowTagSuggestions(true)}
                              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                              onKeyDown={e => {
                                 // Enter key to add tag
                                 if (e.key === "Enter" && tagInput.trim()) {
                                    e.preventDefault();
                                    const trimmed = tagInput.trim();
                                    if (trimmed && !selectedTags.includes(trimmed)) {
                                       setSelectedTags([...selectedTags, trimmed]);
                                       setTagInput("");
                                    }
                                 }
                                 // Backspace on empty input removes last tag
                                 if (e.key === "Backspace" && tagInput === "" && selectedTags.length > 0) {
                                    setSelectedTags(selectedTags.slice(0, -1));
                                 }
                              }}
                              className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
                           />
                           
                           {/* Suggestions Dropdown */}
                           {showTagSuggestions && tagInput && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                 {availableTags
                                    .filter(tag => 
                                       tag.name.toLowerCase().includes(tagInput.toLowerCase()) && 
                                       !selectedTags.includes(tag.name)
                                    )
                                    .slice(0, 8)
                                    .map(tag => (
                                       <button
                                          key={tag.id}
                                          type="button"
                                          onClick={() => {
                                             if (!selectedTags.includes(tag.name)) {
                                                setSelectedTags([...selectedTags, tag.name]);
                                                setTagInput("");
                                             }
                                          }}
                                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700 transition-colors border-b border-slate-100 last:border-b-0"
                                       >
                                          {tag.name}
                                       </button>
                                    ))}
                                 {availableTags.filter(tag => 
                                    tag.name.toLowerCase().includes(tagInput.toLowerCase()) && 
                                    !selectedTags.includes(tag.name)
                                 ).length === 0 && tagInput.trim() && (
                                    <div className="px-4 py-2.5 text-sm text-slate-500">
                                       Press Enter to add "{tagInput.trim()}"
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
                  
                  {/* Existing Tags Quick Add */}
                  {availableTags.length > 0 && (
                     <div className="text-xs">
                        <p className="text-slate-500 font-medium mb-2">Quick add:</p>
                        <div className="flex flex-wrap gap-1.5">
                           {availableTags
                              .filter(tag => !selectedTags.includes(tag.name))
                              .slice(0, 12)
                              .map(tag => (
                                 <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => {
                                       if (!selectedTags.includes(tag.name)) {
                                          setSelectedTags([...selectedTags, tag.name]);
                                       }
                                    }}
                                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs rounded-md border border-slate-200 hover:border-slate-300 transition-colors"
                                 >
                                    + {tag.name}
                                 </button>
                              ))}
                        </div>
                     </div>
                  )}
               </section>

               <section className="space-y-3">
                  <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                     <Hash size={12} /> Topics & Scores
                  </label>
                  <div className="relative">
                     <input 
                        type="text" 
                        placeholder="Type topic name or select from existing..."
                        value={topicInput}
                        onChange={e => {
                           setTopicInput(e.target.value);
                           setShowTopicSuggestions(true);
                        }}
                        onFocus={() => setShowTopicSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowTopicSuggestions(false), 200)}
                        onKeyDown={e => {
                           if (e.key === "Enter" && topicInput.trim() && !selectedTopics.includes(topicInput.trim())) {
                              e.preventDefault();
                              setSelectedTopics([...selectedTopics, topicInput.trim()]);
                              setTopicRelevancyScores({...topicRelevancyScores, [topicInput.trim()]: 5});
                              setTopicInput("");
                           }
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:border-slate-400 outline-none"
                     />
                     {showTopicSuggestions && topicInput && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded shadow-lg max-h-40 overflow-y-auto">
                           {availableTopics
                              .filter(topic => topic.name.toLowerCase().includes(topicInput.toLowerCase()) && !selectedTopics.includes(topic.name))
                              .map(topic => (
                                 <button
                                    key={topic.id}
                                    type="button"
                                    onClick={() => {
                                       if (!selectedTopics.includes(topic.name)) {
                                          setSelectedTopics([...selectedTopics, topic.name]);
                                          setTopicRelevancyScores({...topicRelevancyScores, [topic.name]: 5});
                                          setTopicInput("");
                                       }
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                                 >
                                    {topic.name}
                                 </button>
                              ))}
                        </div>
                     )}
                  </div>
                  <div className="space-y-2 mt-2">
                     {selectedTopics.map((topicName, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-slate-50 rounded border border-slate-100">
                           <span className="font-semibold text-slate-600 flex-1">{topicName}</span>
                           <input 
                              type="range" min="1" max="10" 
                              value={topicRelevancyScores[topicName] || 5} 
                              onChange={e => setTopicRelevancyScores({...topicRelevancyScores, [topicName]: Number(e.target.value)})}
                              className="flex-1 accent-slate-600 h-1 bg-slate-200 rounded" 
                           />
                           <span className="font-mono text-slate-900 w-6 text-right">{topicRelevancyScores[topicName] || 5}</span>
                           <button
                              type="button"
                              onClick={() => {
                                 setSelectedTopics(selectedTopics.filter((_, i) => i !== idx));
                                 const newScores = {...topicRelevancyScores};
                                 delete newScores[topicName];
                                 setTopicRelevancyScores(newScores);
                              }}
                              className="text-slate-400 hover:text-red-500"
                           >
                              <X size={12} />
                           </button>
                        </div>
                     ))}
                  </div>
                  {availableTopics.length > 0 && (
                     <div className="text-xs text-slate-500">
                        <p className="font-medium mb-1">Existing topics:</p>
                        <div className="flex flex-wrap gap-1">
                           {availableTopics
                              .filter(topic => !selectedTopics.includes(topic.name))
                              .slice(0, 10)
                              .map(topic => (
                                 <button
                                    key={topic.id}
                                    type="button"
                                    onClick={() => {
                                       if (!selectedTopics.includes(topic.name)) {
                                          setSelectedTopics([...selectedTopics, topic.name]);
                                          setTopicRelevancyScores({...topicRelevancyScores, [topic.name]: 5});
                                       }
                                    }}
                                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded border border-slate-200"
                                 >
                                    {topic.name}
                                 </button>
                              ))}
                        </div>
                     </div>
                  )}
               </section>
            </div>
          )}

          {/* --- Tab: References --- */}
          {activeTab === "refs" && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <section className="space-y-3">
                  <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                     <Globe size={12} /> Sources
                     {isShort && <span className="text-red-500 text-xs normal-case font-normal">*</span>}
                  </label>
                  <div className="space-y-3">
                     <input 
                        type="text" placeholder={isShort ? "Source Name (required)" : "Source Name"}
                        value={source} onChange={e => handleSourceChange(e.target.value)}
                        className={`w-full px-3 py-2 bg-slate-50 border rounded text-sm focus:border-slate-400 outline-none ${
                          errors.source ? 'border-red-300' : 'border-slate-200'
                        }`}
                     />
                     {errors.source && <p className="text-xs text-red-500 mt-1">{errors.source}</p>}
                     <input 
                        type="text" placeholder="Primary Reference"
                        value={primaryReference} onChange={e => handlePrimaryReferenceChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:border-slate-400 outline-none"
                     />
                  </div>
               </section>

               <section className="space-y-3">
                  <div className="flex items-center justify-between">
                     <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                        <LinkIcon size={12} /> Secondary Refs
                     </label>
                     <button onClick={addSecondaryReference} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors">
                        + Add
                     </button>
                  </div>
                  <div className="space-y-2">
                     {secondaryReferences.map((ref, i) => (
                        <div key={i} className="flex gap-1">
                           <input 
                              value={ref}
                              onChange={e => updateSecondaryReference(i, e.target.value)}
                              placeholder="Ref..."
                              className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:border-slate-400 outline-none"
                           />
                           <button onClick={() => removeSecondaryReference(i)} className="px-2 text-slate-400 hover:text-red-500">
                              <X size={12} />
                           </button>
                        </div>
                     ))}
                     {secondaryReferences.length === 0 && <p className="text-xs text-slate-400 italic">No secondary references</p>}
                  </div>
               </section>

               <section className="space-y-3 pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
                     <BookOpen size={12} /> Islamic Terms
                  </label>
                  <div className="space-y-3">
                     <input 
                        type="text" placeholder="Prophetic Wisdom Term"
                        value={propheticWisdomTerm} onChange={e => handlePropheticWisdomTermChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:border-slate-400 outline-none"
                     />
                     <input 
                        type="text" placeholder="Quran Term"
                        value={quranTerm} onChange={e => handleQuranTermChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:border-slate-400 outline-none"
                     />
                      <textarea 
                        placeholder="Hadith Reference"
                        value={hadithReference} onChange={e => handleHadithReferenceChange(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:border-slate-400 outline-none resize-none"
                        rows={3}
                     />
                  </div>
               </section>
             </div>
          )}

        </div>
      </div>

      {/* Image Selection/Upload Modal - Rendered via Portal to ensure it's above everything */}
      {showImageModal && typeof window !== 'undefined' && createPortal(
        <>
          {/* Backdrop with very high z-index */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" onClick={() => {
            setShowImageModal(false);
            setImageModalMode(null);
            setExistingImages([]);
          }} />
          {/* Modal content with even higher z-index */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Select Article Image</h2>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setImageModalMode(null);
                  setExistingImages([]);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Error/Success Status Display */}
              {saveStatus.type && saveStatus.message && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                  saveStatus.type === "error" 
                    ? "bg-red-50 border border-red-200 text-red-800" 
                    : "bg-green-50 border border-green-200 text-green-800"
                }`}>
                  {saveStatus.type === "error" ? (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  )}
                  <p className="text-sm font-medium">{saveStatus.message}</p>
                </div>
              )}
              
              {!imageModalMode ? (
                // Initial choice screen
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={async () => {
                      setImageModalMode("select");
                      await loadExistingImages();
                    }}
                    className="flex flex-col items-center justify-center p-8 border-2 border-slate-200 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all group"
                  >
                    <ImageIcon className="w-12 h-12 text-slate-400 group-hover:text-slate-600 mb-3" />
                    <h3 className="text-base font-semibold text-slate-900 mb-1">Use from existing ones</h3>
                    <p className="text-xs text-slate-500 text-center">Browse and select from previously uploaded images</p>
                  </button>
                  <button
                    onClick={() => setImageModalMode("upload")}
                    className="flex flex-col items-center justify-center p-8 border-2 border-slate-200 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all group"
                  >
                    <Upload className="w-12 h-12 text-slate-400 group-hover:text-slate-600 mb-3" />
                    <h3 className="text-base font-semibold text-slate-900 mb-1">Upload from device</h3>
                    <p className="text-xs text-slate-500 text-center">Upload a new image from your computer</p>
                  </button>
                </div>
              ) : imageModalMode === "select" ? (
                // Existing images grid
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">Select an Image</h3>
                    <button
                      onClick={() => setImageModalMode(null)}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      ← Back
                    </button>
                  </div>
                  {loadingImages ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                    </div>
                  ) : existingImages.length === 0 ? (
                    <div className="text-center py-12">
                      {saveStatus.type === "error" ? (
                        <div className="space-y-3 max-w-md mx-auto">
                          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                          <p className="text-sm font-medium text-red-600">{saveStatus.message}</p>
                          {saveStatus.message?.includes("bucket") && (
                            <div className="text-left text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 mt-3">
                              <p className="font-semibold mb-2">Quick Setup:</p>
                              <ol className="list-decimal list-inside space-y-1">
                                <li>Go to Supabase Dashboard → Storage</li>
                                <li>Click "New bucket"</li>
                                <li>Name: <code className="bg-slate-200 px-1 rounded">Images</code></li>
                                <li>Set to Public or configure policies</li>
                                <li>Refresh and try again</li>
                              </ol>
                            </div>
                          )}
                          <button
                            onClick={() => setImageModalMode("upload")}
                            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Try uploading a new image
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-slate-400">No images found in Article_Images folder</p>
                          <p className="text-xs text-slate-400 mt-1">Upload your first image to get started</p>
                          <button
                            onClick={() => setImageModalMode("upload")}
                            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Upload a new image instead
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {existingImages.map((image, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectExistingImage(image.path)}
                          className="relative group aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-blue-500 transition-all"
                        >
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EFailed to load%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 bg-white px-3 py-1.5 rounded-md text-xs font-medium text-slate-900">
                              Select
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Upload mode
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">Upload New Image</h3>
                    <button
                      onClick={() => setImageModalMode(null)}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      ← Back
                    </button>
                  </div>
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-10 h-10 text-slate-400 animate-spin mb-3" />
                          <p className="text-sm text-slate-600 font-medium">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-slate-400 mb-3" />
                          <p className="text-sm text-slate-600 font-medium">Click to select image</p>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                      disabled={isUploadingImage}
                    />
                  </label>
                </div>
              )}
            </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}