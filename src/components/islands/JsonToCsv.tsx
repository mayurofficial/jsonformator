import { useState } from 'react';
import { jsonToCsv } from '../../utils/json-converters';
import { Download, Copy, Check } from 'lucide-react';

const SAMPLE_ARRAY = `[
  { "id": 1, "name": "Alice Johnson", "role": "Developer", "department": "Engineering" },
  { "id": 2, "name": "Bob Smith", "role": "Designer", "department": "Product" },
  { "id": 3, "name": "Charlie Brown", "role": "Architect", "department": "Infrastructure" }
]`;

export default function JsonToCsv() {
  const [input, setInput] = useState(SAMPLE_ARRAY);
  const [csvOutput, setCsvOutput] = useState(() => jsonToCsv(SAMPLE_ARRAY));
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    try {
      const csv = jsonToCsv(input);
      setCsvOutput(csv);
    } catch (e) {
      setCsvOutput('Error converting to CSV. Ensure input is valid JSON object or array.');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(csvOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([csvOutput], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>JSON Array Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: '100%', height: '260px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Generated CSV Output</label>
          <textarea
            value={csvOutput}
            readOnly
            style={{ width: '100%', height: '260px', background: 'var(--bg-primary)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={handleConvert}
          style={{ background: 'var(--accent-emerald)', color: '#000', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          Convert to CSV
        </button>

        <button
          onClick={handleCopy}
          style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
          {copied ? 'Copied CSV' : 'Copy CSV'}
        </button>

        <button
          onClick={handleDownload}
          style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Download size={16} /> Download .csv
        </button>
      </div>
    </div>
  );
}
