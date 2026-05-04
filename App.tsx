
import React, { useState, useCallback } from 'react';
import { generateThumbnail } from './services/geminiService';
import ImagePicker from './components/ImagePicker';
import { ImageState, ThumbnailGenerationState } from './types';

const App: React.FC = () => {
  const [leftTutor, setLeftTutor] = useState<ImageState>({ file: null, preview: null });
  const [rightTutor, setRightTutor] = useState<ImageState>({ file: null, preview: null });
  const [logo, setLogo] = useState<ImageState>({ file: null, preview: null });

  const [generation, setGeneration] = useState<ThumbnailGenerationState>({
    isGenerating: false,
    resultUrl: null,
    error: null,
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Strip out the data:image/xxx;base64, part
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = useCallback((setter: React.Dispatch<React.SetStateAction<ImageState>>) => (file: File | null) => {
    if (file) {
      const preview = URL.createObjectURL(file);
      setter({ file, preview });
    } else {
      setter({ file: null, preview: null });
    }
  }, []);

  const handleGenerate = async () => {
    if (!leftTutor.file || !rightTutor.file || !logo.file) {
      alert("Please upload both tutor images and the Clapingo logo.");
      return;
    }

    setGeneration({ isGenerating: true, resultUrl: null, error: null });

    try {
      const leftBase64 = await fileToBase64(leftTutor.file);
      const rightBase64 = await fileToBase64(rightTutor.file);
      const logoBase64 = await fileToBase64(logo.file);

      const resultUrl = await generateThumbnail(leftBase64, rightBase64, logoBase64);
      setGeneration({ isGenerating: false, resultUrl, error: null });
    } catch (err: any) {
      setGeneration({ isGenerating: false, resultUrl: null, error: err.message });
    }
  };

  const downloadImage = () => {
    if (!generation.resultUrl) return;
    const link = document.createElement('a');
    link.href = generation.resultUrl;
    link.download = `clapingo-thumbnail-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canGenerate = leftTutor.file && rightTutor.file && logo.file;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Clapingo</h1>
              <p className="text-xs text-slate-500 font-medium mt-1">Marketing Thumbnail Engine</p>
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || generation.isGenerating}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95 ${
              !canGenerate || generation.isGenerating
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            {generation.isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing AI Magic...
              </span>
            ) : "Generate Thumbnail"}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload Assets
            </h2>
            
            <div className="space-y-6">
              <ImagePicker 
                label="Left Tutor Image" 
                id="left-tutor" 
                preview={leftTutor.preview}
                onFileChange={handleFileChange(setLeftTutor)}
              />
              <ImagePicker 
                label="Right Tutor Image" 
                id="right-tutor" 
                preview={rightTutor.preview}
                onFileChange={handleFileChange(setRightTutor)}
              />
              <ImagePicker 
                label="Clapingo Logo" 
                id="logo" 
                preview={logo.preview}
                onFileChange={handleFileChange(setLogo)}
              />
            </div>
          </div>

          <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
            <h3 className="text-sm font-bold text-indigo-900 mb-2">Internal Guidelines</h3>
            <ul className="text-xs text-indigo-800 space-y-2 list-disc list-inside opacity-90">
              <li>High-res portrait photos work best</li>
              <li>Ensure logo has a transparent background</li>
              <li>Gemini will auto-remove backgrounds</li>
              <li>Headline length is strictly controlled</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Preview / Result */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Thumbnail Canvas (1280x720)</h2>
              {generation.resultUrl && (
                <button 
                  onClick={downloadImage}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export PNG
                </button>
              )}
            </div>

            <div className="flex-1 relative flex items-center justify-center p-6 bg-slate-100/50">
              {generation.isGenerating ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-800 animate-pulse">Designing your thumbnail...</p>
                    <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">Gemini is removing backgrounds and crafting the perfect headline.</p>
                  </div>
                </div>
              ) : generation.resultUrl ? (
                <div className="w-full max-w-3xl aspect-video rounded-xl shadow-2xl overflow-hidden bg-black ring-1 ring-slate-200 animate-[fadeIn_0.5s_ease-out]">
                  <img src={generation.resultUrl} alt="Result" className="w-full h-full object-cover" />
                </div>
              ) : generation.error ? (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-slate-800">Generation Failed</p>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{generation.error}</p>
                  <button 
                    onClick={handleGenerate}
                    className="mt-6 px-5 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Ready to Build</h3>
                  <p className="text-sm text-slate-500">
                    Upload your tutor photos and the official logo to start the automated generation process.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-center">
        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
          Internal Tool &copy; {new Date().getFullYear()} Clapingo Marketing Engine
        </p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default App;
