"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { getSupabaseClient } from "../../../../lib/supabase/client";
import { X, Image as ImageIcon, Upload, Loader2, AlertCircle, CheckCircle2, Link as LinkIcon, Plus } from "lucide-react";

const LANGUAGE_MAP: Record<number, string> = {
  1: "English",
  2: "Arabic",
  3: "Urdu",
};

export default function EditMediaPage() {
  const params = useParams();
  const router = useRouter();
  const mediaId = params.id as string;

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

  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  // Image upload state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalMode, setImageModalMode] = useState<"select" | "upload" | null>(null);
  const [existingImages, setExistingImages] = useState<{ name: string; url: string; path: string }[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (mediaId) {
      fetchMediaItem();
    }
  }, [mediaId]);

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

  const fetchMediaItem = async () => {
    try {
      const client = getSupabaseClient();
      
      // Fetch media item
      const { data: mediaItem, error: mediaError } = await client
        .from("media_items")
        .select("*")
        .eq("id", mediaId)
        .single();

      if (mediaError) throw mediaError;

      if (mediaItem) {
        setFormData({
          title: mediaItem.title || "",
          description: mediaItem.description || "",
          type: mediaItem.type || "video",
          imagePath: mediaItem.image_path || "",
          languageId: mediaItem.language_id || 1,
          durationMinutes: mediaItem.duration_minutes?.toString() || "",
          youtubeLink: mediaItem.sources?.youtube || "",
          spotifyLink: mediaItem.sources?.spotify || "",
          soundcloudLink: mediaItem.sources?.soundcloud || "",
        });
      }

      // Fetch group links
      const { data: groupLinks, error: linksError } = await client
        .from("media_item_group_links")
        .select("group_id")
        .eq("media_item_id", mediaId);

      if (linksError) throw linksError;

      if (groupLinks && groupLinks.length > 0) {
        setGroupIds(groupLinks.map(link => link.group_id.toString()));
      } else {
        setGroupIds([""]);
      }
    } catch (error: any) {
      console.error("Error fetching media item:", error);
      setSaveStatus({ type: "error", message: `Error: ${error.message}` });
      setTimeout(() => router.push("/admin/media"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingImages = async () => {
    setLoadingImages(true);
    setSaveStatus({ type: null, message: "" });
    
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.storage
        .from('Images')
        .list('Article_Images', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        if (error.message?.includes('Bucket not found') || error.message?.includes('does not exist')) {
          setExistingImages([]);
          setSaveStatus({ type: "error", message: "Storage bucket 'Images' not found. Please create it in Supabase Dashboard." });
          return;
        }
        throw new Error(`Failed to list images: ${error.message}`);
      }

      if (!data || data.length === 0) {
        setExistingImages([]);
        return;
      }

      const imageFiles = data.filter(file => {
        if (!file.name || file.id === null) return false;
        return file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
      });

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
      }

      const imagesWithUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const path = `Article_Images/${file.name}`;
          const url = await getImageUrl(path);
          
          return {
            name: file.name,
            url: url || `${supabaseUrl}/storage/v1/object/public/Images/${path}`,
            path: path
          };
        })
      );

      setExistingImages(imagesWithUrls);
    } catch (error: any) {
      console.error("Error loading images:", error);
      setSaveStatus({ type: "error", message: error?.message || "Failed to load images" });
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
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `Article_Images/${fileName}`;

      const { data: uploadData, error: uploadError } = await client.storage
        .from('Images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message || 'Unknown error'}`);
      if (!uploadData?.path) throw new Error("Upload completed but no file path returned");

      setFormData({ ...formData, imagePath: filePath });
      const imageUrl = await getImageUrl(filePath);
      setImagePreview(imageUrl);
      setShowImageModal(false);
      setImageModalMode(null);
      setExistingImages([]);

      setSaveStatus({ type: "success", message: `Image "${file.name}" uploaded successfully` });
      setTimeout(() => setSaveStatus({ type: null, message: "" }), 3000);
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setSaveStatus({ type: "error", message: error.message || "Failed to upload image. Please try again." });
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

  const buildSourcesJson = (): any => {
    if (formData.type === "video") {
      if (!formData.youtubeLink.trim()) return null;
      return { youtube: formData.youtubeLink.trim() };
    } else {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus({ type: null, message: "" });
    setSaving(true);
    
    try {
      // Validate group IDs
      const validGroupIds = groupIds
        .map(id => id.trim())
        .filter(id => id !== "");

      if (validGroupIds.length === 0) {
        setSaveStatus({ type: "error", message: "At least one group ID is required." });
        setSaving(false);
        return;
      }

      // Validate duration
      const durationValue = formData.durationMinutes.trim();
      if (!durationValue) {
        setSaveStatus({ type: "error", message: "Duration is required." });
        setSaving(false);
        return;
      }
      const durationInt = parseInt(durationValue, 10);
      if (isNaN(durationInt) || durationInt < 1) {
        setSaveStatus({ type: "error", message: "Duration must be a valid positive integer." });
        setSaving(false);
        return;
      }

      const sourcesJson = buildSourcesJson();
      const client = getSupabaseClient();

      // Update media item
      const { error: updateError } = await client
        .from("media_items")
        .update({
          title: formData.title,
          description: formData.description.trim() || null,
          type: formData.type,
          image_path: formData.imagePath || null,
          sources: sourcesJson,
          language_id: formData.languageId,
          duration_minutes: durationInt,
        })
        .eq("id", mediaId);

      if (updateError) throw updateError;

      // Delete existing group links
      await client.from("media_item_group_links").delete().eq("media_item_id", mediaId);

      // Insert new group links
      const parsedGroupIds = validGroupIds.map(id => {
        const parsed = parseInt(id, 10);
        if (isNaN(parsed)) {
          throw new Error(`Invalid group ID: "${id}". Group IDs must be numbers.`);
        }
        return parsed;
      });

      const groupLinks = parsedGroupIds.map(groupId => ({
        media_item_id: mediaId,
        group_id: groupId,
      }));

      const { error: linkError } = await client
        .from("media_item_group_links")
        .insert(groupLinks);

      if (linkError) {
        throw new Error(`Failed to link groups: ${linkError.message}`);
      }

      setSaveStatus({ type: "success", message: "Media updated successfully!" });
      setTimeout(() => {
        router.push("/admin/media");
      }, 1500);
    } catch (error: any) {
      setSaveStatus({ type: "error", message: error.message || "Failed to update media item" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
          <span className="text-sm font-medium text-slate-500">Loading Media Item...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Media Item</h1>
          <p className="text-sm text-slate-500">Update media item details</p>
        </div>
        <button
          onClick={() => router.push("/admin/media")}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to Media
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
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

        {/* Sources Section */}
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
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-emerald-600 py-3 font-semibold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/media")}
            className="px-6 rounded-lg border border-slate-300 bg-white py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Image Selection/Upload Modal */}
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
                        <p className="text-sm text-slate-400">No images found</p>
                        <button
                          onClick={() => setImageModalMode("upload")}
                          className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Upload a new image instead
                        </button>
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
