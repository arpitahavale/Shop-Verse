import { useState } from 'react';
import { recommendProducts } from '../../api/ai';
import ProductCard from '../common/ProductCard';
import Button from '../common/Button';
import SectionHeading from '../common/SectionHeading';
import Reveal from '../common/Reveal';

const PROMPTS = [
  'Deep focus desk kit',
  'Weekend motion gear',
  'Soft nest coffee ritual',
  'Statement accessories',
];

function AiPicks() {
  const [query, setQuery] = useState('Deep focus desk kit');
  const [products, setProducts] = useState([]);
  const [reply, setReply] = useState('');
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async (nextQuery = query) => {
    const q = nextQuery.trim();
    if (!q) return;
    setQuery(q);
    setLoading(true);
    setError('');
    try {
      const result = await recommendProducts(q, 4);
      setProducts(result.products || []);
      setReply(result.reply || '');
      setMode(result.mode || '');
    } catch (err) {
      setError(err.message || 'AI recommend failed');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Reveal className="home-section ai-picks">
      <SectionHeading
        eyebrow="AI Concierge"
        title="Ask the catalog in plain English"
        description="This is the extra layer: describe a need, and the agent searches your real Postgres products."
      />

      <form
        className="ai-picks-bar"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you need?"
        />
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Finding…' : 'Get AI picks'}
        </Button>
      </form>

      <div className="ai-starters ai-picks-starters">
        {PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            className="ai-chip"
            onClick={() => run(p)}
            disabled={loading}
          >
            {p}
          </button>
        ))}
      </div>

      {error && <div className="error-panel">{error}</div>}
      {reply && !error && (
        <p className="ai-picks-reply">
          {reply}
          {mode ? <span className="ai-mode-pill">{mode}</span> : null}
        </p>
      )}

      {products.length > 0 && (
        <div className="product-grid" style={{ marginTop: '1.25rem' }}>
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </Reveal>
  );
}

export default AiPicks;
