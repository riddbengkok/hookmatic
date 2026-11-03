import { useState, type FormEvent } from 'react';
import './App.css';
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Clapperboard,
  Clock3,
  Copy,
  Lightbulb,
  LoaderCircle,
  MessageCircle,
  Mic2,
  RotateCcw,
  Sparkles,
  WandSparkles,
  Zap,
} from 'lucide-react';
import type { HookResponse } from '@hookmatic/shared';

const NICHES = [
  'Athleisure',
  'Activewear / Gym Wear',
  'Sneakers / Footwear',
  'Outdoor / Trail Fashion',
  'Streetwear',
];

const AUDIENCES = [
  'Sport Enthusiast',
  'Fashion Enthusiast',
  'Runner',
  'Gym Goer / Fitness',
  'Hiker / Outdoor Explorer',
];

const TONES = [
  { value: 'Relatable', description: 'Feels like a friend' },
  { value: 'Contrarian', description: 'Flips the script' },
  { value: 'Storytime', description: 'Opens mid-story' },
  { value: 'Educational', description: 'Teaches something' },
];

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function isHookResponse(value: unknown): value is HookResponse {
  if (typeof value !== 'object' || value === null || !('hooks' in value) || !Array.isArray(value.hooks)) {
    return false;
  }

  return value.hooks.every((hook: unknown) => {
    if (typeof hook !== 'object' || hook === null) return false;

    return (
      'hookTitle' in hook &&
      typeof hook.hookTitle === 'string' &&
      'hookScript' in hook &&
      typeof hook.hookScript === 'string' &&
      'bodyBeat' in hook &&
      typeof hook.bodyBeat === 'string' &&
      'cta' in hook &&
      typeof hook.cta === 'string' &&
      'hashtags' in hook &&
      Array.isArray(hook.hashtags) &&
      hook.hashtags.every((tag: unknown) => typeof tag === 'string') &&
      'estimatedSeconds' in hook &&
      typeof hook.estimatedSeconds === 'number' &&
      'platformTips' in hook &&
      typeof hook.platformTips === 'string'
    );
  });
}

export default function App() {
  const [niche, setNiche] = useState(NICHES[0]);
  const [audience, setAudience] = useState(AUDIENCES[2]);
  const [tone, setTone] = useState(TONES[0].value);
  const [format, setFormat] = useState<'Singkat' | 'Detail'>('Singkat');
  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<HookResponse['hooks'] | null>(null);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copyError, setCopyError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setCopyError('');

    try {
      const response = await fetch(`${API_URL}/v1/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          audience,
          tone,
          format,
          productTitle: productTitle.trim() || undefined,
          productDescription: productDescription.trim() || undefined,
          count: 3,
        }),
      });

      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof payload === 'object' &&
          payload !== null &&
          'error' in payload &&
          typeof payload.error === 'string'
            ? payload.error
            : `The request failed (${response.status}). Please try again.`;
        throw new Error(message);
      }

      if (!isHookResponse(payload)) {
        throw new Error('The server returned an unexpected response. Please try again.');
      }

      setResults(payload.hooks);
    } catch (caught) {
      setError(
        caught instanceof TypeError
          ? 'Could not reach Hookmatic. Check your connection and try again.'
          : caught instanceof Error
            ? caught.message
            : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (item: HookResponse['hooks'][number], index: number) => {
    const text = [
      item.hookTitle,
      '',
      `HOOK\n${item.hookScript}`,
      '',
      `SCRIPT\n${item.bodyBeat}`,
      '',
      `CTA\n${item.cta}`,
      '',
      item.hashtags.join(' '),
      '',
      `CREATOR NOTE\n${item.platformTips}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setCopyError('');
      window.setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      setCopyError('Clipboard access is unavailable in this browser.');
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="Hookmatic home">
          <span className="wordmark-icon"><Clapperboard size={19} strokeWidth={2.2} /></span>
          <span>hookmatic<span className="wordmark-period">.</span></span>
        </a>
        <div className="topbar-note">
          <span className="status-dot" />
          <span>Your next good idea starts here</span>
        </div>
        <a className="topbar-link" href="#studio">
          Open studio <ArrowDown size={14} />
        </a>
      </header>

      <main className="page-content" id="studio">
        <section className="intro">
          <div className="eyebrow"><span /> THE SHORT-FORM SCRIPT STUDIO</div>
          <div className="intro-row">
            <div>
              <h1>Make the first<br className="desktop-break" /> three seconds <em>count.</em></h1>
              <p className="intro-copy">
                Good videos start with a line worth stopping for. Find yours, then build the rest.
              </p>
            </div>
            <div className="intro-aside">
              <span className="aside-icon"><Mic2 size={17} /></span>
              <p>Made for creators who have something real to say.</p>
            </div>
          </div>
        </section>

        <div className="studio-grid">
          <form className="brief-panel" onSubmit={handleSubmit}>
            <div className="panel-heading">
              <div>
                <span className="section-index">01 / YOUR BRIEF</span>
                <h2>Set the scene</h2>
              </div>
              <span className="heading-mark"><WandSparkles size={17} /></span>
            </div>

            <div className="field">
              <label htmlFor="niche">Your corner of the internet</label>
              <select id="niche" value={niche} onChange={(event) => setNiche(event.target.value)}>
                {NICHES.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>

            <div className="field">
              <label htmlFor="audience">Who are you talking to?</label>
              <select id="audience" value={audience} onChange={(event) => setAudience(event.target.value)}>
                {AUDIENCES.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>

            <fieldset className="field tone-field">
              <legend>Pick a point of view</legend>
              <div className="tone-grid">
                {TONES.map((option) => (
                  <button
                    className={`tone-option${tone === option.value ? ' is-selected' : ''}`}
                    key={option.value}
                    type="button"
                    aria-pressed={tone === option.value}
                    onClick={() => setTone(option.value)}
                  >
                    <span>{option.value}</span>
                    <small>{option.description}</small>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="field format-field">
              <legend>How much are we making?</legend>
              <div className="format-options">
                <button
                  type="button"
                  className={`format-option${format === 'Singkat' ? ' is-selected' : ''}`}
                  aria-pressed={format === 'Singkat'}
                  onClick={() => setFormat('Singkat')}
                >
                  <Zap size={15} />
                  <span><strong>Quick take</strong><small>15–30 sec</small></span>
                </button>
                <button
                  type="button"
                  className={`format-option${format === 'Detail' ? ' is-selected' : ''}`}
                  aria-pressed={format === 'Detail'}
                  onClick={() => setFormat('Detail')}
                >
                  <Clapperboard size={15} />
                  <span><strong>Full story</strong><small>45–90 sec</small></span>
                </button>
              </div>
            </fieldset>

            <div className="optional-fields">
              <div className="optional-heading">
                <span>Got a product or idea?</span>
                <span className="optional-tag">OPTIONAL</span>
              </div>
              <div className="field">
                <label htmlFor="product-title">Give it a name</label>
                <input
                  id="product-title"
                  type="text"
                  placeholder="e.g. Your everyday running shoe"
                  value={productTitle}
                  onChange={(event) => setProductTitle(event.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="field description-field">
                <label htmlFor="product-description">What should we know?</label>
                <textarea
                  id="product-description"
                  placeholder="The details, the difference, the thing people always ask..."
                  value={productDescription}
                  onChange={(event) => setProductDescription(event.target.value)}
                  rows={3}
                  maxLength={300}
                />
                <span className="character-count">{productDescription.length}/300</span>
              </div>
            </div>

            <button className="generate-button" type="submit" disabled={loading}>
              {loading ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={16} />}
              {loading ? 'Finding your opening...' : 'Find my hooks'}
              {!loading && <ArrowUpRight size={16} className="button-arrow" />}
            </button>
            <p className="privacy-note">Three distinct starting points. No blank-page spiral.</p>
          </form>

          <section className="results-panel" aria-live="polite">
            <div className="results-heading">
              <div>
                <span className="section-index">02 / THE GOOD STUFF</span>
                <h2>{results ? 'Pick your opening.' : 'Room for a little spark.'}</h2>
              </div>
              {results && (
                <button
                  type="button"
                  className="reset-button"
                  onClick={() => {
                    setResults(null);
                    setError('');
                  }}
                >
                  <RotateCcw size={14} /> Start fresh
                </button>
              )}
            </div>

            {error && (
              <div className="error-banner" role="alert">
                <span>{error}</span>
                <button type="button" onClick={() => setError('')} aria-label="Dismiss error">×</button>
              </div>
            )}

            {copyError && <p className="copy-error" role="status">{copyError}</p>}

            {!results && !loading && (
              <div className="empty-state">
                <div className="empty-art" aria-hidden="true">
                  <div className="art-sun" />
                  <div className="art-card art-card-back" />
                  <div className="art-card art-card-front">
                    <span className="art-lines"><i /><i /><i /></span>
                    <span className="art-star"><Sparkles size={17} /></span>
                  </div>
                  <span className="art-orbit orbit-one" />
                  <span className="art-orbit orbit-two" />
                </div>
                <span className="empty-kicker"><Lightbulb size={14} /> A good hook sounds like you</span>
                <h3>Start with what<br />you actually care about.</h3>
                <p>Tell us the niche, the person, and the point of view. We’ll find three ways in.</p>
                <div className="empty-steps">
                  <span><i>1</i> Set your brief</span>
                  <span><i>2</i> Pick a point of view</span>
                  <span><i>3</i> Make it yours</span>
                </div>
              </div>
            )}

            {loading && !results && (
              <div className="loading-state">
                <div className="loading-orbit"><span /><Sparkles size={20} /></div>
                <p>Looking for the line that makes someone stop.</p>
                <span>Usually just a few seconds</span>
              </div>
            )}

            {results && (
              <>
                {loading && <p className="refreshing-note"><LoaderCircle className="spin" size={13} /> Finding a fresh set of openings...</p>}
                <div className="hook-list">
                {results.map((item, index) => (
                  <article className="hook-card" key={`${item.hookTitle}-${index}`}>
                    <div className="hook-card-top">
                      <span className="hook-number">0{index + 1}</span>
                      <span className="hook-duration"><Clock3 size={13} /> {item.estimatedSeconds}s</span>
                    </div>
                    <h3>{item.hookTitle}</h3>

                    <div className="hook-script">
                      <div className="content-label"><MessageCircle size={13} /> SAY THIS FIRST</div>
                      <p>“{item.hookScript}”</p>
                    </div>

                    <div className="hook-details">
                      <div className="detail-block">
                        <span className="content-label">THE FLOW</span>
                        <p>{item.bodyBeat}</p>
                      </div>
                      <div className="detail-block cta-block">
                        <span className="content-label">LAND THE PLANE</span>
                        <p>{item.cta}</p>
                      </div>
                    </div>

                    <div className="hook-bottom">
                      <div className="hook-meta">
                        <div className="hashtags">
                          {item.hashtags.map((tag) => <span key={tag}>{tag}</span>)}
                        </div>
                        <p><Lightbulb size={13} /> {item.platformTips}</p>
                      </div>
                      <button
                        type="button"
                        className={`copy-button${copiedIndex === index ? ' is-copied' : ''}`}
                        onClick={() => void copyToClipboard(item, index)}
                        aria-label={copiedIndex === index ? `Hook ${index + 1} copied` : `Copy hook ${index + 1}`}
                      >
                        {copiedIndex === index ? <Check size={15} /> : <Copy size={14} />}
                        {copiedIndex === index ? 'Copied' : 'Copy script'}
                      </button>
                    </div>
                  </article>
                ))}
                </div>
              </>
            )}

            {results && (
              <div className="results-footnote">
                <span className="status-dot" />
                Good starting points, not scripts set in stone. Make them yours.
              </div>
            )}
          </section>
        </div>

        <footer className="page-footer">
          <span>HOOKMATIC <i>·</i> MAKE SOMETHING THEY’LL REMEMBER</span>
          <span>Less scrolling. More saying something.</span>
        </footer>
      </main>
    </div>
  );
}
