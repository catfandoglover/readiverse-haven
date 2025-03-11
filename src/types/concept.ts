
export interface Concept {
  id: string;
  title: string;
  description?: string; // Making it optional to match database structure
  about?: string;       // Add this field to match database
  illustration: string;
  type?: string;
  introduction?: string;
  Notion_URL?: string;  // Add to match database
  randomizer?: number;  // Add to match database
  created_at?: string;  // Add to match database
}
