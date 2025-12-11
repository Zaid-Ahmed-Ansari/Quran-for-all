"use client";

import { useState, useEffect } from "react";
import { 
  Battery, Signal, Wifi, ChevronLeft, ChevronRight, MoreHorizontal, 
  ImageIcon, Download, Bookmark, Send, ExternalLink, ChevronDown 
} from "lucide-react";
import BlockRenderer from "./BlockRenderer";
import { getSupabaseClient } from "../lib/supabase/client";

// --- Configuration ---
const STORAGE_BUCKET = "Images";
const STORAGE_FOLDER = "Article_Images";

interface Block {
  type: "subheading" | "normalText" | "boldText" | "verse" | "quote";
  text_content: string;
}

interface ArticlePreviewProps {
  title: string;
  excerpt?: string;
  blocks: Block[];
  readTime?: number;
  imagePath?: string;
  isShort?: boolean; // Controls the UI mode
}

export default function ArticlePreview({
  title,
  excerpt,
  blocks,
  readTime = 5,
  imagePath,
  isShort = false,
}: ArticlePreviewProps) {
  const currentDate = new Date();
  const timeString = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // State for the resolved image URL
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

  // --- Image Fetching Logic (Your Code) ---
  useEffect(() => {
    const loadImageUrl = async () => {
      if (!imagePath) {
        setFullImageUrl(null);
        return;
      }

      try {
        const client = getSupabaseClient();
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        
        if (!supabaseUrl) {
          console.error("NEXT_PUBLIC_SUPABASE_URL is not defined");
          setFullImageUrl(null);
          return;
        }

        const fullPath = imagePath.startsWith('Article_Images/') 
          ? imagePath 
          : `${STORAGE_FOLDER}/${imagePath}`;

        // 1. Try Signed URL
        try {
          const { data: signedData, error: signedError } = await client.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(fullPath, 3600);
          
          if (!signedError && signedData?.signedUrl) {
            setFullImageUrl(signedData.signedUrl);
            return;
          }
        } catch (signedErr) {
          console.warn("Signed URL generation failed, trying public URL:", signedErr);
        }

        // 2. Try Public URL method
        try {
          const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(fullPath);
          if (data?.publicUrl) {
            setFullImageUrl(data.publicUrl);
            return;
          }
        } catch (publicError) {
          console.warn("Public URL also failed:", publicError);
        }

        // 3. Fallback manual construction
        setFullImageUrl(`${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${fullPath}`);
      } catch (error) {
        console.error("Error getting image URL:", error);
        setFullImageUrl(null);
      }
    };

    loadImageUrl();
  }, [imagePath]);

  // ==========================================
  // VIEW MODE 1: SHORT ARTICLE (Immersive UI)
  // ==========================================
  if (isShort) {
    return (
      <div className="flex items-center justify-center min-h-[900px] w-full bg-slate-100 p-8">
        <div className="relative mx-auto h-[850px] w-full max-w-[400px] rounded-[3.5rem] border-[6px] border-[#424242] bg-[#2d2d2d] shadow-[0_0_0_2px_#525252,0_30px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/10 overflow-hidden">
          
          {/* Background Layer */}
          <div className="absolute inset-0 z-0 bg-slate-800">
            {fullImageUrl ? (
              <img 
                src={fullImageUrl} 
                alt="Background" 
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-900 to-slate-900" />
            )}
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-7 pt-4 text-white">
            <span className="text-[14px] font-semibold tracking-wide w-12 text-center">{timeString}</span>
            <div className="absolute left-1/2 -translate-x-1/2 top-[18px] w-[120px] h-[35px] bg-black rounded-full pointer-events-none" />
            <div className="flex items-center gap-1.5 w-12 justify-end">
              <Signal size={16} strokeWidth={2.5} />
              <Wifi size={16} strokeWidth={2.5} />
              <Battery size={20} strokeWidth={2.5} />
            </div>
          </div>

          {/* Top Actions */}
          <div className="absolute top-14 left-0 right-0 z-20 px-5 py-2 flex items-center justify-between text-white">
            <button><ChevronDown size={28} /></button>
            <div className="flex items-center gap-4">
              <button><div className="rounded-full border border-white/30 p-1"><Download size={16} /></div></button>
              <button><Bookmark size={22} /></button>
              <button><Send size={22} className="-rotate-45 mb-1" /></button>
              <button className="flex items-center gap-1 text-[13px] font-medium bg-white/10 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
                Source <ExternalLink size={12} />
              </button>
            </div>
          </div>

          {/* Floating Card Content */}
          <div className="absolute inset-x-4 top-28 bottom-24 z-10 flex flex-col justify-center">
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl h-auto max-h-full overflow-hidden flex flex-col justify-center">
              {/* Scrollable content area only */}
              <div className="overflow-y-auto scrollbar-hide pr-1">
              <h1 className="text-2xl font-bold font-serif text-slate-900 mb-6 leading-tight">
                {title || "Untitled Short"}
              </h1>

              <div className="space-y-4">
                {excerpt ? (
                  <p className="font-serif text-slate-800 text-[17px] leading-[1.6]">
                    {excerpt}
                  </p>
                ) : null}
                {/* Specific Rendering for Short Mode */}
                {blocks.map((block, i) => {
                  if (block.type === 'verse') {
                    return (
                      <p key={i} className="font-serif italic text-slate-700 text-[17px] leading-relaxed text-center mb-4">
                        {block.text_content}
                      </p>
                    );
                  }
                  if (block.type === 'quote') {
                    return (
                      <p key={i} className="font-serif italic text-slate-700 text-[17px] leading-relaxed mb-4">
                        “{block.text_content}”
                      </p>
                    );
                  }
                  if (block.type === 'subheading') {
                     return <h3 key={i} className="font-bold text-slate-900 mt-4 mb-2">{block.text_content}</h3>;
                  }
                  if (block.type === 'boldText') {
                    return <h3 key={i} className="font-bold text-center text-slate-900 mt-4 mb-2">{block.text_content}</h3>;
                 }
                  return (
                    <p key={i} className="font-serif text-slate-800 text-[17px] leading-[1.6]">
                      {block.text_content}
                    </p>
                  );
                })}
                <div className="h-4" />
              </div>
              </div>
              {/* Soft bottom fade to hint scrollable content */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
            </div>
          </div>

          {/* Bottom Nav */}
          <div className="absolute bottom-8 left-0 right-0 z-20 px-6 flex items-center justify-between text-white">
            <button className="p-2 opacity-50 hover:opacity-100"><ChevronLeft size={32} /></button>
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/30 border border-white/30" />
            </div>
            <button className="p-2 hover:opacity-80"><ChevronRight size={32} /></button>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-8 z-30 flex justify-center items-end pb-2 pointer-events-none">
            <div className="h-[5px] w-32 rounded-full bg-white/20 backdrop-blur-md"></div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW MODE 2: STANDARD ARTICLE (Scrollable)
  // ==========================================
  return (
    <div className="flex items-center justify-center min-h-[900px] w-full bg-slate-100 p-8">
      {/* Device Frame */}
      <div className="relative mx-auto h-[850px] w-full max-w-[400px] rounded-[3.5rem] border-[6px] border-[#424242] bg-[#2d2d2d] shadow-[0_0_0_2px_#525252,0_30px_60px_-15px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
        
        <div className="relative h-full w-full overflow-hidden rounded-[3.2rem] bg-white text-slate-900 flex flex-col">
          
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-7 pt-4 text-black mix-blend-darken">
            <span className="text-[14px] font-semibold tracking-wide w-12 text-center">{timeString}</span>
            <div className="absolute left-1/2 -translate-x-1/2 top-[18px] w-[120px] h-[35px] bg-black rounded-full pointer-events-none" />
            <div className="flex items-center gap-1.5 w-12 justify-end">
              <Signal size={16} strokeWidth={2.5} />
              <Wifi size={16} strokeWidth={2.5} />
              <Battery size={20} strokeWidth={2.5} />
            </div>
          </div>

          {/* App Header */}
          <div className="absolute top-14 left-0 right-0 z-20 px-6 py-2 flex items-center justify-between pointer-events-none">
             <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm pointer-events-auto">
                <ChevronLeft size={24} className="text-slate-900" />
             </button>
             <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-sm pointer-events-auto">
                <MoreHorizontal size={24} className="text-slate-900" />
             </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide bg-white">
            
            {/* Header Section */}
            <div className="bg-[#F9F8F8] pt-28 px-6 pb-10">
              
              {/* Feature Image */}
              {fullImageUrl ? (
                <div className="mb-8 -ml-8 -mr-8 overflow-hidden shadow-sm aspect-[4/3] bg-slate-200">
                  <img 
                    src={fullImageUrl} 
                    alt="Article Cover" 
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                  />
                </div>
              ) : (
                 <div className="mb-8 rounded-3xl aspect-[4/3] bg-slate-200/50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                    <span className="text-xs font-medium uppercase tracking-widest">No Image</span>
                 </div>
              )}

              {/* Title & Metadata */}
              <h1 className="text-[28px] leading-[1.2] font-bold text-slate-900 mb-3">
                {title || "Untitled Article"}
              </h1>
              <div className="flex items-center gap-2 text-[13px] font-medium text-[#545454] mb-8">
                <span>{readTime} min read</span>
                <span className="w-1 h-1 rounded-full bg-[#545454]" />
                <span>by Maulana Wahiduddin Khan</span>
              </div>

              {/* Excerpt as Intro */}
              {excerpt ? (
                <div className="text-[18px] leading-[1.8] text-slate-800 font-serif">
                   {excerpt}
                </div>
              ) : (
                <p className="text-slate-400 italic text-sm">Add an excerpt...</p>
              )}
            </div>

            {/* Blocks Content */}
            <div className="bg-white px-6 pt-8 pb-32 space-y-6">
              {blocks.length === 0 ? (
                 <div className="py-10 text-center opacity-30">
                    <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Content continues here</p>
                 </div>
              ) : (
                blocks.map((block, index) => (
                  <div key={index}>
                    <BlockRenderer block={block} />
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-8 z-30 flex justify-center items-end pb-2 pointer-events-none">
            <div className="h-[5px] w-32 rounded-full bg-slate-900/90"></div>
          </div>

        </div>
      </div>
    </div>
  );
}