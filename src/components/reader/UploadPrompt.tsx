import { Upload } from "lucide-react";
import { useToast } from "../ui/use-toast";

interface UploadPromptProps {
  onFileUpload: (file: File) => void;
}

const UploadPrompt = ({ onFileUpload }: UploadPromptProps) => {
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      onFileUpload(file);
      toast({
        title: "Success",
        description: "Book loaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load book. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] border-2 border-dashed border-gray-300 rounded-lg">
      <label className="cursor-pointer">
        <div className="flex flex-col items-center">
          <Upload className="w-12 h-12 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">Upload EPUB file</span>
        </div>
        <input
          type="file"
          accept=".epub"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default UploadPrompt;