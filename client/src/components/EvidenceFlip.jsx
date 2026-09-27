import { useEffect, useState } from 'react';

function EvidenceCardContent({ card }) {
  const Icon = card.icon;
  return (
    <>
      <span className="evidence-card-heading">
        {Icon && <Icon size={32} className="text-accent shrink-0" />}
        <span className="data-category">{card.category}</span>
      </span>
      <span className={`data-stat ${/^\d/.test(card.stat) ? '' : 'data-stat--word'}`}>{card.stat}</span>
      <span className="evidence-measure">{card.measure}</span>
      <span className="data-label">{card.label}</span>
    </>
  );
}

export function EvidenceFlip({ title, kicker, frontView, backView }) {
  const [currentState, setCurrentState] = useState('front');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const flipped = currentState === 'back';

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event) => setPrefersReducedMotion(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  if (prefersReducedMotion) {
    return (
      <div className="evidence-flip-scene">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-16 md:py-20">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-accent mb-4">
            {kicker}
          </p>
          <h2 className="text-[clamp(28px,3.8vw,34px)] font-bold text-text mb-12">{title}</h2>
          {[frontView, backView].map((view) => (
            <div key={view.label} className="mb-8 last:mb-0">
              <h3 className="font-bold text-text mb-4">{view.label}</h3>
              <div className="data-grid data-grid--3" role="list" aria-label={view.label}>
                {view.cards.map((card) => (
                  <div key={card.category} className="data-card" role="listitem">
                    <EvidenceCardContent card={card} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="evidence-flip-scene is-armed">
      <div className="evidence-flip-stage max-w-[1100px] mx-auto px-6 md:px-12 py-16 md:py-20">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-accent mb-4">
          {kicker}
        </p>
        <h2 className="text-[clamp(28px,3.8vw,34px)] font-bold text-text mb-6">{title}</h2>

        <div className="evidence-view mb-6">
          <div className="evidence-view-control" role="group" aria-label="View the evidence from two sides">
            <button
              type="button"
              className={`evidence-view-option ${!flipped ? 'is-active' : ''}`}
              onMouseEnter={() => setCurrentState('front')}
              onFocus={() => setCurrentState('front')}
              onClick={() => setCurrentState('front')}
              aria-pressed={!flipped}
            >
              {frontView.label}
            </button>
            <button
              type="button"
              className={`evidence-view-option ${flipped ? 'is-active' : ''}`}
              onMouseEnter={() => setCurrentState('back')}
              onFocus={() => setCurrentState('back')}
              onClick={() => setCurrentState('back')}
              aria-pressed={flipped}
            >
              {backView.label}
            </button>
          </div>
        </div>

        <div className="data-grid data-grid--3 evidence-flip-grid" role="list">
          {frontView.cards.map((frontCard, i) => {
            const backCard = backView.cards[i];
            return (
              <div key={frontCard.category} className={`data-card evidence-card ${flipped ? 'is-flipped' : ''}`} role="listitem">
                <div className="evidence-flip-btn">
                  <span className="evidence-face evidence-face--front" aria-hidden={flipped}>
                    <EvidenceCardContent card={frontCard} />
                  </span>
                  <span className="evidence-face evidence-face--back" aria-hidden={!flipped}>
                    <EvidenceCardContent card={backCard} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
