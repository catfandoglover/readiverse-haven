interface Window {
  TidyCal?: {
    init: () => void;
  };
}

// Ensure TidyCal embed element exists in JSX.IntrinsicElements
declare namespace JSX {
  interface IntrinsicElements {
    'tidycal-embed': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'data-path'?: string;
    };
  }
}

// TidyCal API types
interface TidyCalTimeSlot {
  date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  id: string;
}

interface TidyCalService {
  id: string;
  name: string;
  duration: number;
  description?: string;
  price?: number;
}

interface TidyCalBookingData {
  name: string;
  email: string;
  service_id: string;
  time_slot_id: string;
  timezone: string;
  custom_fields?: Record<string, string>;
}

interface TidyCalBookingResponse {
  id: string;
  status: 'confirmed' | 'pending';
  meeting_link?: string;
}
