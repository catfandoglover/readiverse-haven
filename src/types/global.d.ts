
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
