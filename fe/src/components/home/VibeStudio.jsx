import { VIBES, VIBE_BUNDLE_DISCOUNT } from '../../constants';
import { useCart } from '../../context/CartContext';
import { getVibeById } from '../../utils/vibe';

function VibeStudio() {
  const { activeVibe, toggleVibe } = useCart();
  const selected = getVibeById(activeVibe);
  const discountPct = Math.round(VIBE_BUNDLE_DISCOUNT * 100);

  return (
    <section className="vibe-studio animate-fade-up" aria-labelledby="vibe-heading">
      <div className="vibe-studio-copy">
        <p className="section-eyebrow">Only on ShopVerse</p>
        <h2 id="vibe-heading" className="section-title">
          Vibe Match Studio
        </h2>
        <p className="section-desc">
          Pick how you want to feel — products reshuffle by live match score.
          Add two strong matches and unlock a {discountPct}% Vibe Bundle
          discount in your bag.
        </p>
        {selected && (
          <p className="vibe-active-hint" style={{ color: selected.accent }}>
            Live mode: {selected.label} — catalog sorted by your energy
          </p>
        )}
      </div>

      <div className="vibe-grid" role="listbox" aria-label="Shopping vibes">
        {VIBES.map((vibe) => {
          const isActive = activeVibe === vibe.id;
          return (
            <button
              key={vibe.id}
              type="button"
              role="option"
              aria-selected={isActive}
              className={`vibe-chip ${isActive ? 'vibe-chip-active' : ''}`}
              style={{ '--vibe-accent': vibe.accent }}
              onClick={() => toggleVibe(vibe.id)}
            >
              <span className="vibe-chip-dot" aria-hidden />
              <span className="vibe-chip-label">{vibe.label}</span>
              <span className="vibe-chip-blurb">{vibe.blurb}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default VibeStudio;
