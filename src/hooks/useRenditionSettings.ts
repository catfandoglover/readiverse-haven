import { useState } from 'react';
import type { Rendition } from "epubjs";

export const useRenditionSettings = () => {
  const [fontSize, setFontSize] = useState(100);
  const [fontFamily, setFontFamily] = useState<'lexend' | 'georgia' | 'helvetica' | 'times'>('lexend');
  const [textAlign, setTextAlign] = useState<'left' | 'justify' | 'center'>('left');
  const [brightness, setBrightness] = useState(1);
  const [rendition, setRendition] = useState<Rendition | null>(null);

  const handleFontFamilyChange = (value: 'lexend' | 'georgia' | 'helvetica' | 'times') => {
    setFontFamily(value);
  };

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
  };

  const handleBrightnessChange = (value: number[]) => {
    setBrightness(value[0]);
  };

  const handleRenditionReady = (newRendition: Rendition) => {
    setRendition(newRendition);
  };

  return {
    fontSize,
    fontFamily,
    textAlign,
    brightness,
    rendition,
    handleFontFamilyChange,
    handleFontSizeChange,
    handleBrightnessChange,
    handleRenditionReady,
    setTextAlign
  };
};