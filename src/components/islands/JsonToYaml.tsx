import { useState } from 'react';
import { jsonToYaml } from '../../utils/json-converters';
import { Copy, Check } from 'lucide-react';

const SAMPLE_JSON = `{
  "server": {
    "port": 8080,
    "host": "0.0.0.0",
    "ssl": true
  },
  "database": {
    "adapter": "postgres",
    "pool": 10
  }
}`;

export default function JsonToYaml() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [yamlOutput, setYamlOutput] = useState(() => jsonToYaml(SAMPLE_JSON));
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    try {
      setYamlOutput(jsonToYaml(input));
    } catch (e) {
      setYamlOutput('Error: Invalid JSON syntax');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yamlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>JSON Payload</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: '100%', height: '260px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Generated YAML Data</label>
          <textarea
            value={yamlOutput}
            readOnly
            style={{ width: '100%', height: '260px', background: 'var(--bg-primary)', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={handleConvert}
          style={{ background: 'var(--accent-emerald)', color: '#000', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          Convert to YAML
        </button>

        <button
          onClick={handleCopy}
          style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
          {copied ? 'Copied YAML' : 'Copy YAML'}
        </button>
      </div>
    </div>
  );
}
