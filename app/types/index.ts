// types/index.ts
export interface Article {
    id: string; // UUID
    title: string;
    excerpt: string | null;
    image_path: string | null;
    language_id: number | null;
    read_time_minutes: number | null;
    is_short: boolean;
    relevance: number | null;
  }
  
  export interface ContentBlock {
    id?: number;
    article_id?: string;
    type: "subheading" | "normalText" | "quote" | "intro" | "verse";
    text_content: string;
    block_order: number;
  }
  
  export interface Tag {
    id: number;
    name: string;
  }
  
  export interface Topic {
    id: number;
    name: string;
  }