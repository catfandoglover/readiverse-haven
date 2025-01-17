import Reader from "@/components/Reader";

const Index = () => {
  const bookMetadata = {
    coverUrl: "/placeholder.svg",
    title: "Sample Book",
    author: "Sample Author"
  };

  return (
    <div className="min-h-screen">
      <Reader metadata={bookMetadata} />
    </div>
  );
};

export default Index;