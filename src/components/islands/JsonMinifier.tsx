import { useState } from 'react';
import { Copy, Check, Minimize2 } from 'lucide-react';

export default function JsonMinifier() {
  const [input, setInput] = useState(`{\n  "name": "JSONFormator",\n  "version": "1.0.0",\n  "status": "production"\n}`);
  const [output, setOutput] = useState('');
  const [ratio, setRatio] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      
      const origSize = new Blob([input]).size;
      const newSize = new Blob([minified]).size;
      const saved = Math.round(((origSize - newSize) / origSize) * 100);
      setRatio(saved);
    } catch (e) {
      setOutput('Error: Invalid JSON syntax');
      setRatio(null);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Formatted JSON Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: '100%', height: '220px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', outline: 'none' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Minified JSON Output</label>
            {ratio !== null && (
              <span style={{ fontSize: '0.75rem', background: 'var(--accent-emerald-glow)', color: 'var(--accent-emerald)', padding: '0.1rem 0.5rem', borderRadius: '0.2rem', fontWeight: 700 }}>
                Saved {ratio}% Size
              </span>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            style={{ width: '100%', height: '220px', background: 'var(--bg-primary)', color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', outline: 'none' }}
            placeholder="Minified string will appear here..."
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={handleMinify}
          style={{ background: 'var(--accent-emerald)', color: '#000', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Minimize2 size={16} /> Compress & Minify
        </button>

        {output && (
          <button
            onClick={handleCopy}
            style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy Minified Result'}
          </button>
        )}
      </div>
    </div>
  );
}
