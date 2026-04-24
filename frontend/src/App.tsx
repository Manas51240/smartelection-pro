import { useState } from 'react';
import { useStore } from './store/useStore';
import { motion } from 'framer-motion';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function App() {
  const { context, setContext } = useStore();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg, context })
      });
      const data = await res.json();
      const aiResponse = data.response || "No response";
      
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);

      // Log interaction to Firebase
      try {
        await addDoc(collection(db, 'chat_history'), {
          user_query: userMsg,
          ai_response: aiResponse,
          context: context,
          timestamp: serverTimestamp()
        });
      } catch {
        console.warn("Firebase logging skipped (expected if using dummy config)");
      }
      
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: "Error connecting to AI Assistant." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
            Election Assistant Pro
          </h1>
          <p className="text-slate-400">Accessible, AI-powered guidance for the Indian Elections.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar / Context */}
          <div className="col-span-1 bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-slate-200" id="context-heading">Your Profile</h2>
            <div className="space-y-4" role="group" aria-labelledby="context-heading">
              <div>
                <label htmlFor="age-input" className="block text-sm font-medium text-slate-400 mb-1">Age</label>
                <input
                  id="age-input"
                  type="number"
                  value={context.age || ''}
                  onChange={(e) => setContext({ age: parseInt(e.target.value) || null })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  aria-label="Enter your age"
                />
              </div>
              <div>
                <label htmlFor="state-input" className="block text-sm font-medium text-slate-400 mb-1">State</label>
                <input
                  id="state-input"
                  type="text"
                  value={context.state}
                  onChange={(e) => setContext({ state: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  aria-label="Enter your state"
                />
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="col-span-1 md:col-span-2 bg-slate-800 rounded-2xl flex flex-col h-[600px] shadow-xl border border-slate-700">
            <div className="flex-1 overflow-y-auto p-6 space-y-4" role="log" aria-live="polite">
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-500">
                  Ask me anything about voter registration, dates, or eligibility!
                </div>
              )}
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx}
                  className={`max-w-[85%] rounded-xl p-4 ${msg.role === 'user' ? 'bg-blue-600 ml-auto text-white' : 'bg-slate-700 text-slate-100'}`}
                >
                  {msg.content}
                </motion.div>
              ))}
              {loading && (
                <div className="text-slate-400 animate-pulse bg-slate-700 max-w-[85%] rounded-xl p-4 w-fit">
                  Typing...
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-700 flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Message the assistant..."
                aria-label="Message input"
              />
              <button
                onClick={handleSend}
                disabled={loading || !query.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-6 font-medium transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
                aria-label="Send message"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
