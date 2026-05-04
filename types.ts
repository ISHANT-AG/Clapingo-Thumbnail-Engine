
export interface ImageState {
  file: File | null;
  preview: string | null;
}

export interface ThumbnailGenerationState {
  isGenerating: boolean;
  resultUrl: string | null;
  error: string | null;
}
