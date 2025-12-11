import { Quote } from "lucide-react";

interface Block {
  type: "subheading" | "normalText" | "boldText" | "verse" | "quote";
  text_content: string;
}

interface BlockRendererProps {
  block: Block;
}

export default function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case "subheading":
      return (
        <h2 className="mt-8 mb-3 text-[20px] font-bold text-slate-900 font-sans leading-tight">
          {block.text_content}
        </h2>
      );
    
    case "normalText":
      // Main text uses font-sans as per "Intro text in different font then main text"
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
      // Requirement: "text color #70A2B7 and font will be same as introduction"
      // Intro uses font-serif, so Verse uses font-serif
      return (
        <div className="my-6">
           <p className="text-[18px] leading-[1.9] text-[#70A2B7] font-serif ">
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