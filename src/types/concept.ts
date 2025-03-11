
export interface Concept {
  id: string;
  title: string;
  description?: string; // Make this optional
  about?: string;       // Add this field to match database
  illustration: string;
  type?: string;
  introduction?: string;
}
