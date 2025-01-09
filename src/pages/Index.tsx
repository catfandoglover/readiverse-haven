import Reader from "@/components/Reader";

const Index = () => {
  // This metadata would typically come from an admin dashboard or API
  const bookMetadata = {
    coverUrl: "https://example.com/book-cover.jpg", // Replace with actual cover URL
    title: "Sample Book",
    author: "Sample Author"
  };

  return <Reader metadata={bookMetadata} />;
};

export default Index;