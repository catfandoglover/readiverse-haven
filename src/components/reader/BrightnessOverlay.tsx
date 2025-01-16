interface BrightnessOverlayProps {
  brightness: number;
}

const BrightnessOverlay = ({ brightness }: BrightnessOverlayProps) => {
  return (
    <div 
      style={{ 
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        backgroundColor: 'black',
        opacity: 1 - brightness,
        zIndex: 50
      }} 
    />
  );
};

export default BrightnessOverlay;