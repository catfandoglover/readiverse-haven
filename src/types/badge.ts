
export interface Badge {
  id: string;
  entry_uuid: string;
  type: 'classic' | 'icon' | 'concept';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  date_created: string;
  title: string;
  description?: string;
  image_url?: string;
}
