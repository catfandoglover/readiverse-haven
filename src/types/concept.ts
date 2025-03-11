
export interface Concept {
  id: string;
  title: string;
  description?: string; // Optional to accommodate database structure
  about?: string;       // From database
  introduction?: string; // From database
  illustration: string;
  type?: string;
  Notion_URL?: string;  // From database
  created_at?: string;  // From database
  randomizer?: number;  // From database
}
