export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };

      genki_words: {
        Row: {
          id: string;
          book_number: number;
          chapter_number: number;
          word_type: "vocab" | "kanji";
          kanji_mode: "vocab" | "back" | null;
          english: string;
          japanese: string;
          hiragana: string | null;
          katakana: string | null;
          kanji: string | null;
          reading: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_number: number;
          chapter_number: number;
          word_type: "vocab" | "kanji";
          kanji_mode?: "vocab" | "back" | null;
          english: string;
          japanese: string;
          hiragana?: string | null;
          katakana?: string | null;
          kanji?: string | null;
          reading?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          book_number?: number;
          chapter_number?: number;
          word_type?: "vocab" | "kanji";
          kanji_mode?: "vocab" | "back" | null;
          english?: string;
          japanese?: string;
          hiragana?: string | null;
          katakana?: string | null;
          kanji?: string | null;
          reading?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};