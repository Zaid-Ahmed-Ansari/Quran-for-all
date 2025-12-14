"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getSupabaseClient } from "../../lib/supabase/client";
import gsap from "gsap";
import { X, Image as ImageIcon, Upload, Loader2, AlertCircle, CheckCircle2, Link as LinkIcon, Plus, ChevronDown, ChevronRight, Search, Trash2, Edit, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

// --- Language Mapping ---
const LANGUAGE_MAP: Record<number, string> = {
  1: "English",
  2: "Arabic",
  3: "Urdu",
};

// --- Types ---
interface MediaItem {
  id: string | number; // Can be UUID or number depending on DB
  type: "video" | "audio";
  title: string;
  description: string | null;
  image_path: string | null;
  sources: any;
  language_id: number;
  duration_minutes: number | null;
  media_item_group_links?: { group_id: number }[];
  groupIds?: number[];
}

interface GroupedMedia {
  groupId: number | null;
  items: MediaItem[];
}

interface Group {
  id: number;
  groupId: number;
  languageCode: string;
  surahId: number;
  startAyah: number;
  endAyah: number;
}

export default function MediaPage() {
  const router = useRouter();
  // --- State ---
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [groupedMedia, setGroupedMedia] = useState<GroupedMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<number | null>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"count" | "groupId">("groupId");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  
  // Linking State
  const [linkingItem, setLinkingItem] = useState<MediaItem | null>(null);
  const [groupSearchId, setGroupSearchId] = useState("");
  const [groupSearchLang, setGroupSearchLang] = useState("");
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video" as "video" | "audio",
    imagePath: "",
    languageId: 1,
    durationMinutes: "",
    youtubeLink: "",
    spotifyLink: "",
    soundcloudLink: "",
  });

  // Group IDs state
  const [groupIds, setGroupIds] = useState<string[]>([]);

  // Image upload state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalMode, setImageModalMode] = useState<"select" | "upload" | null>(null);
  const [existingImages, setExistingImages] = useState<{ name: string; url: string; path: string }[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  const gridRef = useRef<HTMLDivElement>(null);

  // --- Image Upload Functions ---
  const getImageUrl = async (path: string | null | undefined): Promise<string | null> => {
    if (!path) return null;
    
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
      
      try {
        const { data: signedData, error: signedError } = await client.storage
          .from('Images')
          .createSignedUrl(path, 3600);
        
        if (!signedError && signedData?.signedUrl) {
          return signedData.signedUrl;
        }
      } catch (signedErr) {
        console.warn("Signed URL generation failed, trying public URL:", signedErr);
      }
      
      try {
        const { data } = client.storage.from('Images').getPublicUrl(path);
        if (data?.publicUrl) {
          return data.publicUrl;
        }
      } catch (publicError) {
        console.warn("Public URL also failed:", publicError);
      }
      
      return `${supabaseUrl}/storage/v1/object/public/Images/${path}`;
    } catch (error) {
      console.error("Error getting image URL:", error);
      return null;
    }
  };

  const loadExistingImages = async () => {
    setLoadingImages(true);
    setSaveStatus({ type: null, message: "" });
    
    try {
      const client = getSupabaseClient();
      const { data: buckets, error: bucketError } = await client.storage.listBuckets();
      
      if (bucketError) {
        throw new Error(`Failed to access storage: ${bucketError.message}`);
      }
      
      const imagesBucket = buckets?.find(b => b.name === 'Images');
      if (!imagesBucket) {
        console.warn("Storage bucket 'Images' not found. It may be created on first upload.");
      }
      
      const { data, error } = await client.storage
        .from('Images')
        .list('Article_Images', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
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

  const handleImageUpload = async (file: File) => {
    if (!file) {
      setSaveStatus({ type: "error", message: "No file selected" });
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!file.type || !validTypes.some(type => file.type.toLowerCase().includes(type.split('/')[1]))) {
      setSaveStatus({ type: "error", message: `Invalid file type: ${file.type || 'unknown'}. Please upload: JPEG, PNG, GIF, WEBP, or SVG` });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setSaveStatus({ type: "error", message: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` });
      return;
    }

    setIsUploadingImage(true);
    setSaveStatus({ type: null, message: "" });
    
    try {
      const client = getSupabaseClient();
      
      const { data: buckets, error: bucketError } = await client.storage.listBuckets();
      if (bucketError) {
        throw new Error(`Failed to access storage: ${bucketError.message}`);
      }
      
      const imagesBucket = buckets?.find(b => b.name === 'Images');
      if (!imagesBucket) {
        throw new Error("Storage bucket 'Images' not found. Please create it in Supabase dashboard.");
      }
      
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `Article_Images/${fileName}`;

      const { data: uploadData, error: uploadError } = await client.storage
        .from('Images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message?.includes('already exists')) {
          throw new Error(`File with name "${fileName}" already exists. Please try again.`);
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

      setFormData({ ...formData, imagePath: filePath });
      const imageUrl = await getImageUrl(filePath);
      setImagePreview(imageUrl);
      setShowImageModal(false);
      setImageModalMode(null);
      setExistingImages([]);

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

  const handleSelectExistingImage = async (imagePath: string) => {
    try {
      if (!imagePath) {
        setSaveStatus({ type: "error", message: "No image path provided" });
        return;
      }

      setFormData({ ...formData, imagePath });
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

  const handleImageRemove = () => {
    setFormData({ ...formData, imagePath: "" });
    setImagePreview(null);
  };

  // Load image preview when imagePath changes
  useEffect(() => {
    const loadPreview = async () => {
      if (formData.imagePath) {
        const url = await getImageUrl(formData.imagePath);
        setImagePreview(url);
      } else {
        setImagePreview(null);
      }
    };
    loadPreview();
  }, [formData.imagePath]);

  // --- Effects ---
  useEffect(() => {
    fetchMediaItems();
  }, []);

  useEffect(() => {
    groupAndSortMedia();
  }, [mediaItems, sortBy, sortOrder, searchQuery]);

  useEffect(() => {
    if (!loading && viewMode === "list" && gridRef.current) {
      gsap.fromTo(
        ".media-card",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }
  }, [loading, viewMode, groupedMedia]);

  // --- Actions ---
  const fetchMediaItems = async () => {
    setLoading(true);
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from("media_items")
        .select(`
          *,
          media_item_group_links(group_id)
        `)
        .order("id", { ascending: false });

      if (error) throw error;
      
      const itemsWithGroups: MediaItem[] = (data || []).map((item: any) => ({
        ...item,
        groupIds: item.media_item_group_links?.map((link: any) => link.group_id) || [],
      }));
      
      setMediaItems(itemsWithGroups);
    } catch (error: any) {
      console.error("Error fetching media:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const groupAndSortMedia = () => {
    let filtered = mediaItems;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = mediaItems.filter((item) => {
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesGroupId = item.groupIds?.some(gid => gid.toString().includes(query));
        return matchesTitle || matchesGroupId;
      });
    }

    // Group by group_id (media can have multiple groups, so we'll create entries for each)
    const grouped: Record<number | "null", MediaItem[]> = {} as Record<number | "null", MediaItem[]>;
    
    filtered.forEach((item) => {
      if (item.groupIds && item.groupIds.length > 0) {
        item.groupIds.forEach((groupId) => {
          if (!grouped[groupId]) {
            grouped[groupId] = [];
          }
          // Only add if not already in this group (avoid duplicates)
          if (!grouped[groupId].find(i => i.id === item.id)) {
            grouped[groupId].push(item);
          }
        });
      } else {
        // Items with no groups
        if (!grouped["null"]) {
          grouped["null"] = [];
        }
        grouped["null"].push(item);
      }
    });

    // Convert to array
    const groupedArray: GroupedMedia[] = Object.entries(grouped).map(([key, items]) => ({
      groupId: key === "null" ? null : Number(key),
      items,
    }));

    // Sort groups
    groupedArray.sort((a, b) => {
      if (sortBy === "count") {
        const diff = a.items.length - b.items.length;
        return sortOrder === "asc" ? diff : -diff;
      } else {
        // Sort by groupId
        if (a.groupId === null && b.groupId === null) return 0;
        if (a.groupId === null) return sortOrder === "asc" ? 1 : -1;
        if (b.groupId === null) return sortOrder === "asc" ? -1 : 1;
        const diff = a.groupId - b.groupId;
        return sortOrder === "asc" ? diff : -diff;
      }
    });

    setGroupedMedia(groupedArray);

    // Auto-expand all groups on first load
    if (expandedGroups.size === 0 && groupedArray.length > 0) {
      setExpandedGroups(new Set(groupedArray.map((g) => g.groupId)));
    }
  };

  const toggleGroup = (groupId: number | null) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleDelete = async (itemId: string | number, itemTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${itemTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(itemId);
    try {
      const client = getSupabaseClient();
      
      // Delete related records first
      await client.from("media_item_group_links").delete().eq("media_item_id", itemId);
      
      // Delete the media item
      const { error } = await client.from("media_items").delete().eq("id", itemId);
      
      if (error) throw error;
      
      // Refresh the list
      await fetchMediaItems();
    } catch (error: any) {
      console.error("Error deleting media item:", error);
      alert(`Error deleting media item: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Convert form inputs to JSON sources based on media type
  const buildSourcesJson = (): any => {
    if (formData.type === "video") {
      if (!formData.youtubeLink.trim()) return null;
      return { youtube: formData.youtubeLink.trim() };
    } else {
      // Audio type
      const sources: any = {};
      if (formData.spotifyLink.trim()) {
        sources.spotify = formData.spotifyLink.trim();
      }
      if (formData.soundcloudLink.trim()) {
        sources.soundcloud = formData.soundcloudLink.trim();
      }
      return Object.keys(sources).length > 0 ? sources : null;
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus({ type: null, message: "" });
    
    try {
      // Validate group IDs are provided
      const validGroupIds = groupIds
        .map(id => id.trim())
        .filter(id => id !== "");

      if (validGroupIds.length === 0) {
        setSaveStatus({ type: "error", message: "At least one group ID is required." });
        return;
      }

      // Validate duration
      const durationValue = formData.durationMinutes.trim();
      if (!durationValue) {
        setSaveStatus({ type: "error", message: "Duration is required." });
        return;
      }
      const durationInt = parseInt(durationValue, 10);
      if (isNaN(durationInt) || durationInt < 1) {
        setSaveStatus({ type: "error", message: "Duration must be a valid positive integer." });
        return;
      }

      const sourcesJson = buildSourcesJson();

      const client = getSupabaseClient();
      const { data: insertedData, error } = await client.from("media_items").insert([
        {
          title: formData.title,
          description: formData.description.trim() || null,
          type: formData.type,
          image_path: formData.imagePath || null,
          sources: sourcesJson,
          language_id: formData.languageId,
          duration_minutes: durationInt,
        },
      ]).select();

      if (error) throw error;

      if (!insertedData || insertedData.length === 0) {
        throw new Error("Media item created but no data returned");
      }

      const createdMediaItem = insertedData[0];

      // Link groups (required)
      const parsedGroupIds = validGroupIds.map(id => {
        const parsed = parseInt(id, 10);
        if (isNaN(parsed)) {
          throw new Error(`Invalid group ID: "${id}". Group IDs must be numbers.`);
        }
        return parsed;
      });

      const groupLinks = parsedGroupIds.map(groupId => ({
        media_item_id: createdMediaItem.id,
        group_id: groupId,
      }));

      const { error: linkError } = await client
        .from("media_item_group_links")
        .insert(groupLinks);

      if (linkError) {
        throw new Error(`Failed to link groups: ${linkError.message}`);
      }

      setSaveStatus({ type: "success", message: "Media created successfully!" });
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          type: "video",
          imagePath: "",
          languageId: 1,
          durationMinutes: "",
          youtubeLink: "",
          spotifyLink: "",
          soundcloudLink: "",
        });
        setGroupIds([]);
        setImagePreview(null);
        setViewMode("list");
        fetchMediaItems();
      }, 1500);
    } catch (error: any) {
      setSaveStatus({ type: "error", message: error.message || "Failed to create media item" });
    }
  };

  const searchGroups = async () => {
    setIsSearching(true);
    try {
      const client = getSupabaseClient();
      let query = client.from("groups").select("*");

      if (groupSearchId) query = query.eq("groupId", parseInt(groupSearchId));
      if (groupSearchLang) query = query.eq("languageCode", groupSearchLang);

      const { data, error } = await query.limit(20);
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const linkToGroup = async (group: Group) => {
    if (!linkingItem) return;
    try {
      const client = getSupabaseClient();
      const { error } = await client.from("media_item_group_links").insert([
        { media_item_id: linkingItem.id, group_id: group.id },
      ]);

      if (error) throw error;
      alert(`Linked "${linkingItem.title}" to Group ${group.groupId}`);
      setLinkingItem(null); // Close modal
      setSearchResults([]);
      setGroupSearchId("");
    } catch (error: any) {
      alert(error.message);
    }
  };

  // --- Render ---

  if (loading && mediaItems.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
          <p className="text-sm font-medium text-slate-500">Loading Library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Media Library</h1>
          <p className="text-slate-500">Manage video and audio content for the app.</p>
        </div>
        
        {viewMode === "list" ? (
          <button
            onClick={() => setViewMode("create")}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload New Media
          </button>
        ) : (
          <button
            onClick={() => setViewMode("list")}
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel & Return to List
          </button>
        )}
      </div>

      {/* --- CREATE MODE --- */}
      {viewMode === "create" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="max-w-2xl mx-auto rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-800">New Media Item</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              {/* Status Messages */}
              {saveStatus.type && saveStatus.message && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
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

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any, youtubeLink: "", spotifyLink: "", soundcloudLink: "" })}
                    className="w-full rounded-lg border-slate-300 bg-slate-50 px-3 py-2"
                  >
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Language</label>
                  <select
                    value={formData.languageId}
                    onChange={(e) => setFormData({ ...formData, languageId: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-lg border-slate-300 bg-slate-50 px-3 py-2"
                  >
                    {Object.entries(LANGUAGE_MAP).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="e.g., The Story of Yusuf"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                  className="w-full rounded-lg border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="e.g., 15"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Enter the duration in minutes (whole number only, will be rounded)
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Optional description..."
                />
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Thumbnail Image</label>
                <div className="space-y-2">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-32 w-auto rounded-lg border border-slate-200 object-cover"
                        onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                      />
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setShowImageModal(true)}
                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <ImageIcon size={16} />
                    {imagePreview ? "Change Image" : "Select Image"}
                  </button>
                </div>
              </div>

              {/* Sources Section - Conditional based on type */}
              {formData.type === "video" ? (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    YouTube Iframe Link
                  </label>
                  <input
                    type="text"
                    value={formData.youtubeLink}
                    onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
                    className="w-full rounded-lg border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Paste YouTube iframe embed code here..."
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Paste the full iframe embed code from YouTube
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Spotify Embed Link
                    </label>
                    <input
                      type="text"
                      value={formData.spotifyLink}
                      onChange={(e) => setFormData({ ...formData, spotifyLink: e.target.value })}
                      className="w-full rounded-lg border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Paste Spotify embed code here..."
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      SoundCloud Embed Link
                    </label>
                    <input
                      type="text"
                      value={formData.soundcloudLink}
                      onChange={(e) => setFormData({ ...formData, soundcloudLink: e.target.value })}
                      className="w-full rounded-lg border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="Paste SoundCloud embed code here..."
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    You can add one or both audio sources. Paste the full embed code for each.
                  </p>
                </div>
              )}

              {/* Group IDs Section */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <LinkIcon size={14} />
                    Group IDs <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setGroupIds([...groupIds, ""])}
                    className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors flex items-center gap-1"
                  >
                    <Plus size={12} />
                    Add Group ID
                  </button>
                </div>
                <div className="space-y-2">
                  {groupIds.length === 0 ? (
                    <div>
                      <p className="text-xs text-red-500 italic mb-2">At least one group ID is required.</p>
                      <button
                        type="button"
                        onClick={() => setGroupIds([""])}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        + Add your first Group ID
                      </button>
                    </div>
                  ) : (
                    groupIds.map((groupId, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={groupId}
                          onChange={(e) => {
                            const newGroupIds = [...groupIds];
                            newGroupIds[index] = e.target.value;
                            setGroupIds(newGroupIds);
                          }}
                          placeholder="Enter group ID (number)"
                          required
                          className="flex-1 rounded-lg border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newGroupIds = groupIds.filter((_, i) => i !== index);
                            setGroupIds(newGroupIds);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          disabled={groupIds.length === 1}
                          title={groupIds.length === 1 ? "At least one group ID is required" : "Remove"}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Enter the group ID (bigint) to link this media item to Quranic groups. You can add multiple group IDs. At least one is required.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white shadow-md hover:bg-emerald-700"
                >
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIST MODE --- */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or group ID..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "count" | "groupId")}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
              >
                <option value="groupId">Sort by Group ID</option>
                <option value="count">Sort by Count</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 text-sm"
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                <Filter className="h-4 w-4" />
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* Grouped Media List */}
          {groupedMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 sm:py-20 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-4">
                <svg className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900">
                {searchQuery ? "No media found" : "No media yet"}
              </h3>
              <p className="mt-1 text-slate-500">
                {searchQuery ? "Try a different search term" : "Upload your first video or audio track."}
              </p>
            </div>
          ) : (
            <div ref={gridRef} className="space-y-2">
              {groupedMedia.map((group) => (
                <div
                  key={group.groupId ?? "null"}
                  className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden"
                >
                  {/* Group Header (Accordion) */}
                  <button
                    onClick={() => toggleGroup(group.groupId)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {expandedGroups.has(group.groupId) ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      )}
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Group ID: {group.groupId ?? "No Group"}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Group Content */}
                  {expandedGroups.has(group.groupId) && (
                    <div className="border-t border-slate-100 p-4">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            className="media-card group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
                          >
                            {/* Thumbnail Area */}
                            <div className="relative aspect-video bg-slate-100">
                              {item.image_path ? (
                                <img
                                  src={item.image_path.startsWith('http') ? item.image_path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Images/${item.image_path}`}
                                  alt={item.title}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-300">
                                  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              <div className="absolute top-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs font-medium uppercase text-white backdrop-blur-sm">
                                {item.type}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                              <h3 className="mb-1 truncate text-lg font-bold text-slate-800" title={item.title}>
                                {item.title}
                              </h3>
                              <p className="mb-4 text-xs text-slate-500 line-clamp-2">
                                {item.description || "No description provided."}
                              </p>
                              
                              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => router.push(`/admin/media/edit/${item.id}`)}
                                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                                  >
                                    <Edit className="h-3 w-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id, item.title)}
                                    disabled={deletingId === item.id}
                                    className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {deletingId === item.id ? (
                                      <>
                                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="h-3 w-3" />
                                        Delete
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- LINKING MODAL --- */}
      {linkingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Link Media to Group</h3>
                <p className="text-sm text-slate-500">
                  Select a Quranic group for <span className="font-semibold text-slate-800">"{linkingItem.title}"</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setLinkingItem(null);
                  setSearchResults([]);
                }}
                className="rounded-full bg-slate-100 p-1 text-slate-500 hover:bg-slate-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={groupSearchId}
                  onChange={(e) => setGroupSearchId(e.target.value)}
                  className="flex-1 rounded-lg border-slate-300 px-3 py-2 text-sm"
                  placeholder="Group ID..."
                />
                <input
                  type="text"
                  value={groupSearchLang}
                  onChange={(e) => setGroupSearchLang(e.target.value)}
                  className="w-24 rounded-lg border-slate-300 px-3 py-2 text-sm"
                  placeholder="Lang"
                />
                <button
                  onClick={searchGroups}
                  disabled={isSearching}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSearching ? "..." : "Search"}
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-2">
                {searchResults.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400 italic">
                    {isSearching ? "Searching..." : "Search results will appear here"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm border border-slate-200"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            Group {group.groupId} <span className="text-xs font-normal text-slate-500">({group.languageCode})</span>
                          </p>
                          <p className="text-xs text-slate-500">
                            Surah {group.surahId} : Ayah {group.startAyah}-{group.endAyah}
                          </p>
                        </div>
                        <button
                          onClick={() => linkToGroup(group)}
                          className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
                        >
                          Link
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Selection/Upload Modal - Rendered via Portal */}
      {showImageModal && typeof window !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" onClick={() => {
            setShowImageModal(false);
            setImageModalMode(null);
            setExistingImages([]);
          }} />
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">Select Media Thumbnail</h2>
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

              <div className="flex-1 overflow-y-auto p-6">
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