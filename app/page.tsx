"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Send, Loader2, Search, Info, Settings, Hand, Sparkles, MapPin, Plane, ArrowUp, History, Trash2, LayoutGrid, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HotelResult {
  hotel_name: string;
  makemytrip: number | null;
  travclan: number | null;
  travelboutiqueonline: number | null;
}

interface Message {
  id: string;
  type: 'user' | 'system';
  content: string | { exact: HotelResult[]; similar: HotelResult[] };
  timestamp: string; // Store as string for localStorage
}

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [placeholderText, setPlaceholderText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const placeholders = [
    "Search for a hotel...",
    "Compare prices for Taj Palace...",
    "Find deals at Marriott...",
    "Check rates for Hyatt Regency...",
    "Looking for the best hotel deals?"
  ];

  useEffect(() => {
    if (hasSearched) return;

    let currentIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timeout: NodeJS.Timeout;

    const type = () => {
      const currentPlaceholder = placeholders[currentIdx];

      if (isDeleting) {
        setPlaceholderText(currentPlaceholder.substring(0, charIdx - 1));
        charIdx--;
      } else {
        setPlaceholderText(currentPlaceholder.substring(0, charIdx + 1));
        charIdx++;
      }

      let typeSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && charIdx === currentPlaceholder.length) {
        typeSpeed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        currentIdx = (currentIdx + 1) % placeholders.length;
        typeSpeed = 500;
      }

      timeout = setTimeout(type, typeSpeed);
    };

    type();
    return () => clearTimeout(timeout);
  }, [hasSearched]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('hotel_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
        if (parsed.length > 0) setHasSearched(true);
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('hotel_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSearch = async (e?: React.FormEvent | string) => {
    const queryText = typeof e === 'string' ? e : input;
    if (e && typeof e !== 'string') e.preventDefault();

    if (!queryText.trim() || isLoading) return;

    const userQuery = queryText.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userQuery,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setHasSearched(true);
    setInput('');

    const startTime = Date.now();
    try {
      const response = await fetch('/api/search-hotel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuery }),
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();

      // Ensure at least 5 seconds of loading time
      const elapsedTime = Date.now() - startTime;
      const remainingDelay = Math.max(0, 5000 - elapsedTime);
      if (remainingDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingDelay));
      }

      const systemMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: {
          exact: data.exactMatches,
          similar: data.similarMatches,
        },
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, systemMsg]);
    } catch (error) {
      // Ensure at least 5 seconds of loading time even on error
      const elapsedTime = Date.now() - startTime;
      const remainingDelay = Math.max(0, 5000 - elapsedTime);
      if (remainingDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingDelay));
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, I encountered an error while searching.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('hotel_chat_history');
    setMessages([]);
    setHasSearched(false);
  };

  const quickActions = [
    { icon: <Search className="w-3.5 h-3.5" />, label: "Grand Excelsior Hotel Bur Dubai", query: "Grand Excelsior Hotel Bur Dubai" },
    { icon: <LayoutGrid className="w-3.5 h-3.5" />, label: "Search hotel Citymax Hotel Bur Dubai", query: "Citymax Hotel Bur Dubai" },
    { icon: <Info className="w-3.5 h-3.5" />, label: "Find Grand Hyatt", query: "Grand Hyatt" },
    { icon: <Sparkles className="w-3.5 h-3.5" />, label: "Check dubai hotel", query: "dubai hotel" },
  ];

  const fetchmmtdata = async () => {
    const response = await fetch('/api/mmt-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchCriteria: {
          checkIn: "2026-04-22",
          checkOut: "2026-04-30",
          cityCode: "CTDUB",
          roomStayCandidates: [
            {
              rooms: 1,
              adultCount: 1,
              childAges: [],
            },
          ],
        },
      }),
    });
    console.log("##MMT", response);
  }

  // fetchmmtdata();

  return (
    <div className={cn(
      "flex flex-col h-screen font-sans selection:bg-zinc-100 transition-colors duration-300 relative overflow-hidden",
      isDarkMode ? "bg-zinc-950 text-zinc-100 dark" : "bg-white text-zinc-900"
    )}>
      {/* Dynamic Background Glow */}
      {!hasSearched && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, -100, 0],
              y: [0, -50, 50, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className={cn(
              "absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20",
              isDarkMode ? "bg-zinc-500" : "bg-zinc-200"
            )}
          />
          <motion.div
            animate={{
              x: [0, -100, 100, 0],
              y: [0, 50, -50, 0],
              scale: [1, 0.8, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className={cn(
              "absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20",
              isDarkMode ? "bg-zinc-400" : "bg-zinc-100"
            )}
          />
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className={cn(
        "fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-12 z-50 backdrop-blur-md border-b transition-colors duration-300",
        isDarkMode ? "bg-zinc-950/80 border-zinc-800" : "bg-white/80 border-zinc-100"
      )}>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xl font-bold tracking-tight transition-colors",
            isDarkMode ? "text-white" : "text-zinc-900"
          )}>Plus 91 Travel</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "p-2 rounded-full transition-all active:scale-90",
              isDarkMode ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
            )}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <LayoutGroup>
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-24 pb-40 relative">
          <div className="max-w-3xl w-full mx-auto">
            <AnimatePresence mode="popLayout">
              {!hasSearched ? (
                <motion.div
                  key="hero"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center text-center space-y-16 relative z-10 min-h-[60vh]"
                >
                  {/* Centered Input for Initial State */}
                  <motion.div
                    layoutId="search-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="w-full max-w-2xl relative mb-2"
                  >
                    <form onSubmit={handleSearch} className="relative group">
                      <div className={cn(
                        "absolute inset-0 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500",
                        isDarkMode ? "bg-white/10" : "bg-zinc-900/5"
                      )} />
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={placeholderText}
                        className={cn(
                          "w-full border rounded-full px-7 py-5 text-lg focus:outline-none focus:ring-1 transition-all relative z-10 shadow-2xl",
                          isDarkMode
                            ? "bg-zinc-900/80 border-zinc-800 text-white focus:ring-zinc-700 focus:border-zinc-700 placeholder:text-zinc-600 shadow-black/40 backdrop-blur-xl"
                            : "bg-white/80 border-zinc-200 text-zinc-900 focus:ring-zinc-400 focus:border-zinc-400 placeholder:text-zinc-300 shadow-zinc-200/50 backdrop-blur-xl"
                        )}
                      />
                      <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-20 shadow-lg z-20",
                          isDarkMode ? "bg-white text-zinc-900 hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-black"
                        )}                      >
                        <ArrowUp className="w-5 h-5" />
                      </button>
                    </form>
                  </motion.div>

                  {/* Quick Action Pills */}
                  <div className="flex flex-wrap justify-center gap-4 pt-4 max-w-2xl">
                    {quickActions.map((action, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSearch(action.query)}
                        className={cn(
                          "flex items-center gap-2.5 px-6 py-3.5 rounded-full border text-sm font-medium transition-all shadow-sm backdrop-blur-sm",
                          isDarkMode
                            ? "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                            : "bg-white/50 border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
                        )}
                      >
                        <span className={isDarkMode ? "text-zinc-500" : "text-zinc-400"}>{action.icon}</span>
                        {action.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-12">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-6",
                        msg.type === 'user' ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-sm border transition-colors",
                        msg.type === 'user'
                          ? (isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-100")
                          : (isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100")
                      )}>
                        {msg.type === 'user' ? (
                          <div className={cn(
                            "text-[10px] font-bold uppercase",
                            isDarkMode ? "text-zinc-500" : "text-zinc-400"
                          )}>Me</div>
                        ) : (
                          <div className={cn(
                            "w-full h-full flex items-center justify-center font-bold text-sm",
                            isDarkMode ? "text-white" : "text-zinc-900"
                          )}>S</div>
                        )}
                      </div>

                      <div className={cn(
                        "max-w-[85%] space-y-4",
                        msg.type === 'user' ? "items-end" : "items-start"
                      )}>
                        {typeof msg.content === 'string' ? (
                          <div className={cn(
                            "px-6 py-4 rounded-2xl text-[15px] leading-relaxed transition-all",
                            msg.type === 'user'
                              ? (isDarkMode ? "bg-white text-zinc-900 shadow-xl" : "bg-zinc-900 text-white shadow-xl shadow-zinc-200/50")
                              : (isDarkMode ? "bg-zinc-900 text-zinc-300 border border-zinc-800 shadow-sm" : "bg-white text-zinc-700 border border-zinc-200 shadow-sm")
                          )}>
                            {msg.content}
                          </div>
                        ) : (
                          <div className="space-y-10 w-full">
                            {msg.content.exact.length > 0 && (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] px-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Exact Matches
                                </div>
                                <HotelTable data={msg.content.exact} isDarkMode={isDarkMode} />
                              </div>
                            )}

                            {msg.content.similar.length > 0 && (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] px-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  Similar Matches
                                </div>
                                <HotelTable data={msg.content.similar} isDarkMode={isDarkMode} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 mt-12 mb-8"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-colors",
                  isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
                )}>
                  <div className={cn(
                    "text-[10px] font-bold uppercase",
                    isDarkMode ? "text-zinc-500" : "text-zinc-400"
                  )}>Plus</div>
                </div>
                <div className={cn(
                  "px-8 py-5 rounded-2xl shadow-xl border transition-all duration-300",
                  isDarkMode ? "bg-zinc-900/50 border-zinc-800/50 backdrop-blur-md text-zinc-400" : "bg-white/50 border-zinc-200 backdrop-blur-md text-zinc-500"
                )}>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{
                            y: [0, -6, 0],
                            opacity: [0.3, 1, 0.3],
                            scale: [0.9, 1.1, 0.9],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.15,
                          }}
                          className={cn(
                            "w-2 h-2 rounded-full shadow-sm",
                            isDarkMode ? "bg-white" : "bg-zinc-900"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium tracking-tight">Searching for best deals...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </main>

        {/* Bottom Input Area (Visible only after search) */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className={cn(
                "fixed bottom-0 left-0 right-0 p-8 z-40 transition-colors duration-300",
                isDarkMode
                  ? "bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent"
                  : "bg-gradient-to-t from-white via-white to-transparent"
              )}
            >
              <div className="max-w-3xl mx-auto flex items-center gap-4">
                <button
                  onClick={clearHistory}
                  className={cn(
                    "w-14 h-14 border rounded-2xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl active:scale-95 shrink-0",
                    isDarkMode
                      ? "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900/50"
                      : "bg-white border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-100"
                  )}
                  title="Clear History"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="flex-1 relative group">
                  <div className={cn(
                    "absolute inset-0 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity",
                    isDarkMode ? "bg-white/5" : "bg-zinc-900/5"
                  )} />
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about another hotel..."
                      className={cn(
                        "w-full border rounded-full px-6 py-4 text-base focus:outline-none focus:ring-1 transition-all shadow-lg relative z-10",
                        isDarkMode
                          ? "bg-zinc-900 border-zinc-800 text-white focus:ring-zinc-700 focus:border-zinc-700 placeholder:text-zinc-600"
                          : "bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-400 focus:border-zinc-400 placeholder:text-zinc-400"
                      )}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20 z-20",
                        isDarkMode ? "bg-white text-zinc-900 hover:bg-zinc-200" : "bg-zinc-900 text-white hover:bg-black"
                      )}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}

function HotelTable({ data, isDarkMode }: { data: HotelResult[], isDarkMode?: boolean }) {
  return (
    <div className={cn(
      "overflow-hidden rounded-2xl border shadow-sm transition-colors",
      isDarkMode ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white"
    )}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={cn(
              "border-b transition-colors",
              isDarkMode ? "bg-zinc-800/50 border-zinc-800" : "bg-zinc-50/50 border-zinc-100"
            )}>
              <th className={cn(
                "px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider",
                isDarkMode ? "text-zinc-500" : "text-zinc-400"
              )}>Hotel Name</th>
              <th className={cn(
                "px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-right",
                isDarkMode ? "text-zinc-500" : "text-zinc-400"
              )}>MakeMyTrip</th>
              <th className={cn(
                "px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-right",
                isDarkMode ? "text-zinc-500" : "text-zinc-400"
              )}>TravClan</th>
              <th className={cn(
                "px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-right",
                isDarkMode ? "text-zinc-500" : "text-zinc-400"
              )}>TravelBoutiqueOnline</th>
            </tr>
          </thead>
          <tbody className={cn(
            "divide-y transition-colors",
            isDarkMode ? "divide-zinc-800" : "divide-zinc-50"
          )}>
            {data.map((hotel, i) => (
              <tr key={i} className={cn(
                "group transition-colors",
                isDarkMode ? "hover:bg-zinc-800/50" : "hover:bg-zinc-50/50"
              )}>
                <td className={cn(
                  "px-5 py-4 text-sm font-semibold",
                  isDarkMode ? "text-zinc-100" : "text-zinc-900"
                )}>{hotel.hotel_name}</td>
                <td className={cn(
                  "px-5 py-4 text-sm font-mono text-right",
                  isDarkMode ? "text-zinc-400" : "text-zinc-600"
                )}>
                  {hotel.makemytrip ? `₹${hotel.makemytrip.toLocaleString()}` : <span className="text-zinc-300">—</span>}
                </td>
                <td className={cn(
                  "px-5 py-4 text-sm font-mono text-right",
                  isDarkMode ? "text-zinc-400" : "text-zinc-600"
                )}>
                  {hotel.travclan ? `₹${hotel.travclan.toLocaleString()}` : <span className="text-zinc-300">—</span>}
                </td>
                <td className={cn(
                  "px-5 py-4 text-sm font-mono text-right",
                  isDarkMode ? "text-zinc-400" : "text-zinc-600"
                )}>
                  {hotel.travelboutiqueonline ? `₹${hotel.travelboutiqueonline.toLocaleString()}` : <span className="text-zinc-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
