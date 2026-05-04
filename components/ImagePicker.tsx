
import React from 'react';

interface ImagePickerProps {
  label: string;
  id: string;
  preview: string | null;
  onFileChange: (file: File | null) => void;
  required?: boolean;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ label, id, preview, onFileChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div 
        className={`relative group h-40 w-full border-2 border-dashed rounded-xl overflow-hidden transition-all duration-200 
          ${preview ? 'border-indigo-200 bg-white' : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-slate-100'}`}
      >
        {preview ? (
          <>
            <img src={preview} alt={label} className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <button 
                onClick={() => onFileChange(null)}
                className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <label htmlFor={id} className="flex flex-col items-center justify-center h-full cursor-pointer">
            <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs text-slate-500 font-medium">Click to upload</span>
          </label>
        )}
        <input 
          type="file" 
          id={id} 
          accept="image/*" 
          onChange={handleInputChange} 
          className="hidden" 
        />
      </div>
    </div>
  );
};

export default ImagePicker;
