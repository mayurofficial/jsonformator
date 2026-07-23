import { useState } from 'react';
import { jsonToTypescript } from '../../utils/json-converters';
import { Copy, Check, FileCode } from 'lucide-react';

const SAMPLE_PAYLOAD = `{
  "userId": 9482,
  "username": "antigravity",
  "active": true,
  "roles": ["admin", "architect"],
  "meta": {
    "loginCount": 42,
    "lastIp": "127.0.0.1"
  }
}`;

export default function JsonToTypescript() {
  const [input, setInput] = useState(SAMPLE_PAYLOAD);
  const [rootName, setRootName] = useState('UserProfile');
  const [tsOutput, setTsOutput] = useState(() => jsonToTypescript(SAMPLE_PAYLOAD, 'UserProfile'));
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    try {
      setTsOutput(jsonToTypescript(input, rootName || 'RootObject'));
    } catch (e) {
      setTsOutput('// Error: Invalid JSON input');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tsOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '1.25rem' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Root Interface Name:</label>
        <input
          type="text"
          value={rootName}
          onChange={(e) => setRootName(e.target.value)}
          style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.35rem 0.75rem', borderRadius: '0.375rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>JSON Sample Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: '100%', height: '260px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>TypeScript Interface Output</label>
          <textarea
            value={tsOutput}
            readOnly
            style={{ width: '100%', height: '260px', background: 'var(--bg-primary)', color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={handleConvert}
          style={{ background: 'var(--accent-emerald)', color: '#000', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <FileCode size={16} /> Generate Interfaces
        </button>

        <button
          onClick={handleCopy}
          style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
          {copied ? 'Copied Types' : 'Copy TS Interfaces'}
        </button>
      </div>
    </div>
  );
}
