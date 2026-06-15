import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string;
  altText?: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, altText = "Image", onClose }) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[110]"
      >
        <X size={24} />
      </button>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      <div className="relative z-10 max-w-[90vw] max-h-[90vh] w-full px-4 flex justify-center items-center pointer-events-none">
        <img 
          src={imageUrl} 
          alt={altText} 
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
        />
      </div>
    </div>
  );
};
