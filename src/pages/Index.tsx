import Reader from "@/components/Reader";

const Index = () => {
  const bookMetadata = {
    coverUrl: "/placeholder.svg", // Using the placeholder image from public folder
    title: "Sample Book",
    author: "Sample Author"
  };

  return <Reader metadata={bookMetadata} />;
};

export default Index;