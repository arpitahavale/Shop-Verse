import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAgent, fetchAiStatus } from '../api/ai';
import { ROUTES } from '../constants';
import { formatCurrency } from '../utils/format';
import ProductImage from './common/ProductImage';
import Button from './common/Button';

const STARTERS = [
  'Calm desk setup under $100',
  'Gift for a runner',
  'Bold accessories for a night out',
  'Soft home comfort picks',
];

function AiConcierge() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('local-agent');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi — I’m your ShopVerse AI concierge. Ask for a vibe, budget, or gift idea and I’ll pull real products from the catalog.',
      products: [],
    },
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    fetchAiStatus()
      .then((s) => {
        if (s.providerConfigured) setMode('llm-ready');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text) => {
    const message = (text || input).trim();
    if (!message || busy) return;

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: message, products: [] }]);
    setBusy(true);

    try {
      const result = await chatWithAgent(message, history);
      setMode(result.mode || mode);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.reply,
          products: result.products || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.message || 'Concierge is unavailable right now.',
          products: [],
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="ai-fab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open AI concierge"
      >
        {open ? '✕' : 'AI'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.aside
            className="ai-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25 }}
          >
            <header className="ai-panel-head">
              <div>
                <p className="ai-panel-kicker">ShopVerse Concierge</p>
                <h2>Ask for picks</h2>
              </div>
              <span className="ai-mode-pill">{mode}</span>
            </header>

            <div className="ai-starters">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="ai-chip"
                  onClick={() => send(s)}
                  disabled={busy}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="ai-messages">
              {messages.map((m, idx) => (
                <div
                  key={`${m.role}-${idx}`}
                  className={`ai-bubble ai-bubble-${m.role}`}
                >
                  <p>{m.content}</p>
                  {m.products?.length > 0 && (
                    <div className="ai-product-list">
                      {m.products.map((p) => (
                        <Link
                          key={p.id}
                          to={ROUTES.product(p.id)}
                          className="ai-product-row"
                          onClick={() => setOpen(false)}
                        >
                          <ProductImage src={p.image} alt={p.name} />
                          <div>
                            <strong>{p.name}</strong>
                            <span>
                              {formatCurrency(p.price)}
                              {p.reason ? ` · ${p.reason}` : ''}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {busy && (
                <div className="ai-bubble ai-bubble-assistant ai-typing">
                  Thinking with catalog tools…
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form
              className="ai-composer"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. quiet desk under $100"
                disabled={busy}
              />
              <Button type="submit" variant="primary" disabled={busy || !input.trim()}>
                Send
              </Button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

export default AiConcierge;
