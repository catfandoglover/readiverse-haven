import Reader from "@/components/Reader";
import type { BookMetadata } from "@/types/reader";

const bookMetadata: BookMetadata = {
  coverUrl: "/placeholder.svg",
  title: "Sample Book",
  author: "Sample Author"
};

const Index = () => {
  return (
    <div className="min-h-screen">
      <Reader metadata={bookMetadata} />
    </div>
  );
};

export default Index;