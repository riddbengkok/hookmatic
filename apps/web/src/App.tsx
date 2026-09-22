import { useState } from 'react';
import { Loader2, Copy, CheckCircle2, Sparkles } from 'lucide-react';
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

const TONES: { value: string; emoji: string }[] = [
  { value: 'Relatable', emoji: '🤝' },
  { value: 'Contrarian', emoji: '🔥' },
  { value: 'Storytime', emoji: '📖' },
  { value: 'Educational', emoji: '💡' },
];

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function App() {
  // Form state
  const [niche, setNiche] = useState(NICHES[0]);
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [tone, setTone] = useState(TONES[0].value);
  const [format, setFormat] = useState<'Singkat' | 'Detail'>('Singkat');
  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<HookResponse['hooks'] | null>(null);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await fetch(`${API_URL}/v1/generate`, {
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? `Server error ${res.status}`);
      }

      setResults(data.hooks);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (item: HookResponse['hooks'][number], index: number) => {
    const text = [
      `📌 ${item.hookTitle}`,
      '',
      `🎬 Hook: "${item.hookScript}"`,
      '',
      `📝 Alur:\n${item.bodyBeat}`,
      '',
      `📢 CTA: ${item.cta}`,
      '',
      item.hashtags.join(' '),
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-7 h-7 text-black" />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black">Hookmatic</h1>
          </div>
          <p className="text-gray-500 text-base">Content script inspiration - eai</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-6">

          {/* ---- FORM SIDEBAR ---- */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5 h-fit">

            {/* Niche */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Niche</label>
              <select
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              >
                {NICHES.map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>

            {/* Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Audience</label>
              <select
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              >
                {AUDIENCES.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>

            {/* Tone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tone / Gaya</label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      tone === t.value
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {t.emoji} {t.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Format Output</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Singkat', 'Detail'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      format === f
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {f === 'Singkat' ? '⚡ Singkat' : '📋 Detail'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {format === 'Singkat' ? '15–30 detik · hook + ide kasar' : '45–90 detik · naskah lengkap per babak'}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 pt-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Produk / Konten (Opsional)</p>

              {/* Product Title */}
              <div className="space-y-1.5 mb-3">
                <label className="text-xs text-gray-500 font-medium">Judul Produk / Video</label>
                <input
                  type="text"
                  placeholder="e.g. Nike Air Zoom Pegasus 41"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-black focus:border-black outline-none transition placeholder:text-gray-300"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              {/* Product Description */}
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-medium">Deskripsi Singkat</label>
                <textarea
                  placeholder="e.g. Sepatu lari dengan cushioning ReactX, cocok untuk marathon dan daily training. Tersedia warna hitam, putih, volt."
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-black focus:border-black outline-none transition placeholder:text-gray-300 resize-none"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={3}
                  maxLength={300}
                />
                <p className="text-right text-xs text-gray-300">{productDescription.length}/300</p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                : <><Sparkles className="w-4 h-4" /> Generate Hooks</>}
            </button>
          </form>

          {/* ---- RESULTS PANEL ---- */}
          <div className="space-y-5">

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                ⚠️ {error}
              </div>
            )}

            {/* Empty state */}
            {!results && !loading && !error && (
              <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm text-center p-8 bg-white/50">
                <Sparkles className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-medium text-gray-500">Hasil hook video Anda akan muncul di sini</p>
                <p className="text-xs mt-1 text-gray-400">Isi form di samping, lalu klik Generate</p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
                <Loader2 className="w-10 h-10 animate-spin text-black mb-3" />
                <p className="text-sm font-medium text-gray-600 animate-pulse">AI sedang menyusun hook terbaik untuk Anda...</p>
              </div>
            )}

            {/* Results */}
            {results && results.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
                {/* Left accent bar */}
                <div className="absolute top-0 left-0 w-1 h-full bg-black rounded-l-2xl" />

                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hook #{idx + 1}</span>
                    <h3 className="font-bold text-gray-900 text-base mt-0.5">{item.hookTitle}</h3>
                  </div>
                  <span className="flex-shrink-0 text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                    ~{item.estimatedSeconds}s
                  </span>
                </div>

                <div className="space-y-4 text-sm">

                  {/* Hook Script */}
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">🎬 Hook (3 Detik Pertama)</span>
                    <p className="font-semibold text-black bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl leading-relaxed">
                      "{item.hookScript}"
                    </p>
                  </div>

                  {/* Body Beat */}
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">📝 Alur / Naskah</span>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{item.bodyBeat}</p>
                  </div>

                  {/* CTA */}
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">📢 Call to Action</span>
                    <p className="text-gray-800 font-medium">{item.cta}</p>
                  </div>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.hashtags.map((tag) => (
                      <span key={tag} className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                    <p className="text-xs text-gray-400 italic flex-1">💡 {item.platformTips}</p>
                    <button
                      onClick={() => copyToClipboard(item, idx)}
                      className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {copiedIndex === idx
                        ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Tersalin!</>
                        : <><Copy className="w-3.5 h-3.5" /> Salin Script</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
