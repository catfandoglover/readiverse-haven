import React from "react";
import type { Book } from "epubjs";
import type { Highlight } from "@/types/highlight";
import BookViewer from "./BookViewer";
import ReaderControls from "./ReaderControls";
import ProgressTracker from "./ProgressTracker";
import SessionTimer from "./SessionTimer";
import TableOfContents from "./TableOfContents";
import BookmarkDialog from "./BookmarkDialog";
import { cn } from "@/lib/utils";

interface ReaderContentProps {
  book: Book | null;
  fontSize: number;
  fontFamily: 'lexend' | 'georgia' | 'helvetica' | 'times';
  textAlign?: 'left' | 'justify' | 'center';
  brightness: number;
  currentLocation: string | null;
  progress: number;
  pageInfo: { currentPage: number; totalPages: number };
  sessionTime: number;
  highlights: Highlight[];
  selectedColor: string;
  toc: any[];
  currentChapterTitle: string | null;
  showBookmarkDialog: boolean;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (font: 'lexend' | 'georgia' | 'helvetica' | 'times') => void;
  onTextAlignChange: (align: 'left' | 'justify' | 'center') => void;
  onBrightnessChange: (brightness: number) => void;
  onBookmarkClick: () => void;
  onLocationChange: (location: any) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onTocNavigate: (href: string) => void;
  onRenditionReady: (rendition: any) => void;
  onTextSelect: (cfiRange: string, text: string) => void;
  setShowBookmarkDialog: (show: boolean) => void;
  handleRemoveBookmark: (cfiRange: string) => void;
  setSelectedColor: (color: string) => void;
  removeHighlight: (cfiRange: string) => void;
}

const ReaderContent: React.FC<ReaderContentProps> = ({
  book,
  fontSize,
  fontFamily,
  textAlign,
  brightness,
  currentLocation,
  progress,
  pageInfo,
  sessionTime,
  highlights,
  selectedColor,
  toc,
  currentChapterTitle,
  showBookmarkDialog,
  onFontSizeChange,
  onFontFamilyChange,
  onTextAlignChange,
  onBrightnessChange,
  onBookmarkClick,
  onLocationChange,
  onPrevPage,
  onNextPage,
  onTocNavigate,
  onRenditionReady,
  onTextSelect,
  setShowBookmarkDialog,
  handleRemoveBookmark,
  setSelectedColor,
  removeHighlight,
}) => {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4">
        <div className="hidden md:block">
          <TableOfContents
            toc={toc}
            currentChapterTitle={currentChapterTitle}
            onTocNavigate={onTocNavigate}
          />
        </div>
        <div>
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <ReaderControls
              fontSize={fontSize}
              fontFamily={fontFamily}
              textAlign={textAlign}
              brightness={brightness}
              onFontSizeChange={onFontSizeChange}
              onFontFamilyChange={onFontFamilyChange}
              onTextAlignChange={onTextAlignChange}
              onBrightnessChange={onBrightnessChange}
              onBookmarkClick={onBookmarkClick}
              onPrevPage={onPrevPage}
              onNextPage={onNextPage}
              highlights={highlights}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              removeHighlight={removeHighlight}
            />
          </div>
          <div className={cn("bg-white rounded-lg shadow-lg p-4 relative", textAlign)}>
            <BookViewer
              book={book}
              fontSize={fontSize}
              fontFamily={fontFamily}
              textAlign={textAlign}
              currentLocation={currentLocation}
              onLocationChange={onLocationChange}
              onRenditionReady={onRenditionReady}
              highlights={highlights}
              onTextSelect={onTextSelect}
            />
          </div>
          <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
            <ProgressTracker progress={progress} pageInfo={pageInfo} />
            <SessionTimer sessionTime={sessionTime} />
          </div>
        </div>
      </div>
      <BookmarkDialog
        show={showBookmarkDialog}
        onClose={() => setShowBookmarkDialog(false)}
        onRemove={handleRemoveBookmark}
      />
    </div>
  );
};

export default ReaderContent;