export interface Database {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string;
          code: string;
          url: string;
          site_name: string;
          favicon_url: string | null;
          report: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          url: string;
          site_name: string;
          favicon_url?: string | null;
          report: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          url?: string;
          site_name?: string;
          favicon_url?: string | null;
          report?: Record<string, unknown>;
          created_at?: string;
        };
      };
      comparisons: {
        Row: {
          id: string;
          code: string;
          report_a: Record<string, unknown>;
          report_b: Record<string, unknown>;
          site_name_a: string;
          site_name_b: string;
          favicon_url_a: string | null;
          favicon_url_b: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          report_a: Record<string, unknown>;
          report_b: Record<string, unknown>;
          site_name_a: string;
          site_name_b: string;
          favicon_url_a?: string | null;
          favicon_url_b?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          report_a?: Record<string, unknown>;
          report_b?: Record<string, unknown>;
          site_name_a?: string;
          site_name_b?: string;
          favicon_url_a?: string | null;
          favicon_url_b?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
