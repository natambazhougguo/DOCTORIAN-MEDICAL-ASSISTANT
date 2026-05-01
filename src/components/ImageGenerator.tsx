import { useState, useEffect } from 'react';
import { api } from '../api';
import { Image as ImageIcon, Loader2, Download, Sparkles, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const generateImage = async () => {
    if (!prompt.trim() || isLoading) return;

    if (isOffline) {
      setError("You are currently offline. Image generation requires an internet connection.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const generateWithRetry = async (retryCount = 0): Promise<any> => {
        try {
          const promptText = `Professional medical anatomical illustration of: ${prompt}. Cinematic lighting, anatomical detail, clinical style, high resolution, white background.`;
          
          const response = await api.ai.geminiChat(
            [{ role: "user", text: promptText }],
            "You are a medical medical illustrator. When asked to generate an illustration, provide it.",
            'gemini-2.0-flash',
            0.7
          );
          
          return response;
        } catch (err: any) {
          const errorMsg = err?.message || String(err);
          const isQuotaError = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota');
          const isTransientError = errorMsg.includes('500') || errorMsg.includes('503') || errorMsg.includes('fetch') || errorMsg.includes('NetworkError');

          if (isQuotaError) {
            throw new Error("API Quota Exceeded. Please try again later.");
          }

          if (isTransientError && retryCount < 2) {
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return generateWithRetry(retryCount + 1);
          }

          throw err;
        }
      };

      const response = await generateWithRetry();

      if (response.imageData) {
        setImageUrl(`data:image/png;base64,${response.imageData}`);
      } else {
        setError("The AI did not provide an image. It might have returned a text description instead.");
        console.warn("AI Response without image:", response.text);
      }
    } catch (err) {
      console.error("Image Generation Error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section 
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col"
      aria-labelledby="anatomical-illustrator-title"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400" aria-hidden="true">
          <ImageIcon size={20} />
        </div>
        <div>
          <h3 id="anatomical-illustrator-title" className="font-bold text-slate-900 dark:text-white text-sm">Anatomical Illustrator</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-wider font-semibold">AI-Powered Visuals</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="relative group">
          <label htmlFor="anatomical-prompt" className="sr-only">Illustration prompt</label>
          <textarea
            id="anatomical-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Cross-section of the human heart showing ventricles'..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm text-slate-900 dark:text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
          <button
            onClick={generateImage}
            disabled={!prompt.trim() || isLoading}
            aria-label={isLoading ? "Generating illustration" : "Generate illustration"}
            className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Sparkles size={14} aria-hidden="true" />}
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        <div 
          className="flex-1 min-h-[250px] bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center relative overflow-hidden group"
          role="status"
          aria-live="polite"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" aria-hidden="true"></div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Creating illustration...</p>
              </motion.div>
            ) : imageUrl ? (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full p-2"
              >
                <img
                  src={imageUrl}
                  alt={`AI generated anatomical illustration: ${prompt}`}
                  className="w-full h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = imageUrl;
                    link.download = 'doctorian-illustration.png';
                    link.click();
                  }}
                  aria-label="Download generated illustration"
                  className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download size={16} aria-hidden="true" />
                </button>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-6"
                role="alert"
              >
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-6"
              >
                <ImageIcon className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} aria-hidden="true" />
                <p className="text-xs text-slate-400 dark:text-slate-500">Your generated illustration will appear here.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
