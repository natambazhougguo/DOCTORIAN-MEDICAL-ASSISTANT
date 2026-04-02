import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Image as ImageIcon, Loader2, Download, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `Professional medical anatomical illustration of: ${prompt}. High quality, detailed, scientific accuracy, clean background.`,
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          setImageUrl(`data:image/png;base64,${base64EncodeString}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        setError("No image was generated. Please try a different prompt.");
      }
    } catch (err) {
      console.error("Image Generation Error:", err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
          <ImageIcon size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Anatomical Illustrator</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">AI-Powered Visuals</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="relative group">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Cross-section of the human heart showing ventricles'..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
          <button
            onClick={generateImage}
            disabled={!prompt.trim() || isLoading}
            className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        <div className="flex-1 min-h-[250px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-xs font-medium text-slate-500">Creating illustration...</p>
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
                  alt="Generated anatomical illustration"
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
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg text-slate-700 hover:text-indigo-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Download size={16} />
                </button>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-6"
              >
                <p className="text-xs text-rose-500 font-medium">{error}</p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center p-6"
              >
                <ImageIcon className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-xs text-slate-400">Your generated illustration will appear here.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
