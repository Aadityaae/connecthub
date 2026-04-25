import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, ShieldAlert, ShieldQuestion, Loader2, ExternalLink, Newspaper, BrainCircuit } from "lucide-react";
import { GoogleGenAI, Type } from "@google/genai";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  image: string;
  source: string;
  url: string;
  publishedAt: string;
}

interface VerificationResult {
  verdict: "Real" | "Fake" | "Misleading" | "Uncertain";
  confidence: "High" | "Medium" | "Low";
  reason: string;
}

const NewsCard = ({ news }: { news: NewsItem }) => {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fullStory, setFullStory] = useState<string | null>(null);
  const [generatingStory, setGeneratingStory] = useState(false);

  const verifyNews = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setVerifying(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Fact-check this news accurately. 
        Title: ${news.title}
        Description: ${news.description}
        Source: ${news.source}`,
        config: {
          systemInstruction: "You are a world-class investigative journalist and fact-checker. Analyze the news provided and determine its veracity based on known facts and common patterns of misinformation. Respond ONLY in valid JSON format.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING, enum: ["Real", "Fake", "Misleading", "Uncertain"] },
              confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
              reason: { type: Type.STRING }
            },
            required: ["verdict", "confidence", "reason"]
          }
        }
      });

      if (response.text) {
        setResult(JSON.parse(response.text.trim()));
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setResult({ verdict: "Uncertain", confidence: "Low", reason: "AI verification service temporarily unavailable." });
    } finally {
      setVerifying(false);
    }
  };

  const generateFullStory = async () => {
    if (fullStory) {
      setIsExpanded(!isExpanded);
      return;
    }

    setGeneratingStory(true);
    setIsExpanded(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on this news snippet, generate a detailed, comprehensive 300-400 word article. Maintain a professional journalistic tone.
        Title: ${news.title}
        Source: ${news.source}
        Initial Snippet: ${news.description}`,
      });

      if (response.text) {
        setFullStory(response.text);
      }
    } catch (error) {
      console.error("Story generation failed:", error);
      setFullStory("Unable to expand the full story at this moment. Please check the source link for more details.");
    } finally {
      setGeneratingStory(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "Real": return "text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20";
      case "Fake": return "text-rose-700 dark:text-rose-400 bg-rose-100/50 dark:bg-rose-400/10 border-rose-200 dark:border-rose-400/20";
      case "Misleading": return "text-amber-700 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-400/10 border-amber-200 dark:border-amber-400/20";
      default: return "text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-400/10 border-slate-200 dark:border-slate-400/20";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group bg-white dark:bg-[#1A1B1E] border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden hover:border-amber-500/30 transition-all duration-500 shadow-xl dark:shadow-2xl mb-8"
    >
      <div className="flex flex-col md:flex-row min-h-[400px]">
        {/* Left Side: Large Image */}
        <div className="md:w-[40%] relative overflow-hidden h-[300px] md:h-auto border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
          <img 
            src={news.image || "https://picsum.photos/seed/news/1200/800"} 
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent md:block hidden" />
          <div className="absolute top-6 left-6">
            <span className="px-4 py-1.5 bg-amber-500 text-black text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg">
              {news.source}
            </span>
          </div>
        </div>

        {/* Right Side: Detailed Content */}
        <div className="flex-1 p-8 md:p-12 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-mono text-slate-500 dark:text-slate-400">
              {new Date(news.publishedAt).toLocaleDateString(undefined, {
                 weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
          </div>
          
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight group-hover:text-amber-500 transition-colors">
            {news.title}
          </h3>
          
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl mb-10 leading-relaxed font-medium">
            {news.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-auto">
            <button 
              onClick={generateFullStory}
              disabled={generatingStory}
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-xl shadow-indigo-500/10"
            >
              {generatingStory ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Expanding Story...
                </>
              ) : (
                isExpanded ? "Close Article" : "Read Full Article"
              )}
            </button>

            <button 
              onClick={verifyNews}
              disabled={verifying}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-xl ${
                verifying 
                ? "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed" 
                : "bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-amber-500 hover:text-white dark:hover:bg-amber-100 dark:hover:text-black shadow-white/5"
              }`}
            >
              {verifying ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <BrainCircuit size={18} /> Deep Verify
                </>
              )}
            </button>

            <a 
              href={news.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-auto p-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ExternalLink size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Expanded Content Section */}
      <AnimatePresence>
        {(isExpanded || result) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black/30 overflow-hidden"
          >
            <div className="p-8 md:p-12 space-y-12">
              {/* Verification Result */}
              {result && (
                <div className={`p-6 rounded-3xl border shadow-sm ${getVerdictColor(result.verdict)}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter">
                      {result.verdict === "Real" ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                      Verdict: {result.verdict}
                    </div>
                    <div className="px-4 py-1 bg-white/20 dark:bg-white/10 rounded-full text-xs font-mono">
                      Confidence: {result.confidence}
                    </div>
                  </div>
                  <p className="text-lg leading-relaxed font-bold dark:font-medium">
                    {result.reason}
                  </p>
                </div>
              )}

              {/* Full Generated Story */}
              {isExpanded && (
                <div className="prose dark:prose-invert max-w-none">
                  <div className="flex items-center gap-3 mb-6 text-amber-600 dark:text-amber-500/60 font-mono text-[10px] tracking-widest uppercase">
                    <Newspaper size={14} /> AI Context Expansion Engaged
                  </div>
                  {generatingStory ? (
                    <div className="flex flex-col items-center py-12 gap-4">
                      <Loader2 size={32} className="text-indigo-500 animate-spin" />
                      <p className="text-slate-500 dark:text-slate-400 font-mono text-sm animate-pulse">Reconstructing Full Narrative...</p>
                    </div>
                  ) : (
                    <div className="text-slate-700 dark:text-slate-300 text-lg leading-loose space-y-6">
                      {fullStory?.split('\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const res = await fetch("/api/news");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch news");
        setNews(data);
      } catch (err: any) {
        setError(err.message || "Could not load news feed. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0E0F11] flex flex-col items-center justify-center">
        <Loader2 size={48} className="text-amber-500 dark:text-amber-400 animate-spin mb-4" />
        <p className="text-slate-400 dark:text-slate-500 font-mono text-sm tracking-widest uppercase animate-pulse">Scanning Global Feeds...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0E0F11] text-slate-900 dark:text-white transition-colors duration-500">
      {/* Decorative Header */}
      <div className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/30 dark:bg-amber-500 rounded-full blur-[200px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/30 dark:bg-indigo-600 rounded-full blur-[200px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase mb-8 text-slate-900 dark:text-white"
          >
            News <span className="text-amber-500 dark:text-amber-400">Sphere</span>
          </motion.h1>
          
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-800" />
            <span className="text-xs font-mono tracking-[0.5em] text-slate-400 dark:text-slate-500 uppercase">Neural Dispatch Engine v7.0</span>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800" />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-32">
        {error ? (
          <div className="text-center py-20 bg-rose-500/5 border border-rose-500/10 rounded-[2rem]">
            <ShieldAlert size={48} className="text-rose-400 mx-auto mb-4" />
            <p className="text-rose-400 font-bold">{error}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        )}
      </main>

      <footer className="py-20 border-t border-slate-200 dark:border-slate-900 text-center">
        <p className="text-slate-500 dark:text-slate-600 text-[10px] font-mono tracking-widest uppercase">
          Neural Verification Engine v4.2 // Deep Fact Coverage Active
        </p>
      </footer>
    </div>
  );
}
