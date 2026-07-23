import { useState } from 'react';
import { getJsonStats, repairJsonString } from '../../utils/json-core';
import { AlertCircle, CheckCircle, Wrench } from 'lucide-react';

export default function JsonValidator() {
  const [input, setInput] = useState(`{\n  name: 'JSONFormator',\n  features: ['validator', 'repair'],\n}`);
  const [result, setResult] = useState(() => getJsonStats(input));

  const handleValidate = () => {
    setResult(getJsonStats(input));
  };

  const handleAutoRepair = () => {
    try {
      const repaired = repairJsonString(input);
      const formatted = JSON.stringify(JSON.parse(repaired), null, 2);
      setInput(formatted);
      setResult(getJsonStats(formatted));
    } catch (e) {
      // Keep result updated
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '1.25rem' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>JSON Validator & Auto-Repair</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleValidate}
            style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.45rem 1rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Validate Syntax
          </button>
          <button
            onClick={handleAutoRepair}
            style={{ background: 'var(--accent-cyan)', color: '#000', border: 'none', padding: '0.45rem 1rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Wrench size={16} /> Fix Syntax Errors
          </button>
        </div>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '100%', height: '280px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', outline: 'none' }}
        placeholder="Paste JSON string to validate..."
      />

      <div style={{ marginTop: '1rem' }}>
        {result.isValid ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-emerald)', padding: '1rem', borderRadius: '0.5rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle size={24} />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Valid JSON Payload</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>No syntax errors found. Ready for production API transmission.</p>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', padding: '1rem', borderRadius: '0.5rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <AlertCircle size={24} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Syntax Error Detected</strong>
              <p style={{ fontSize: '0.85rem', color: '#fecdd3', margin: '0.25rem 0' }}>{result.error}</p>
              <button 
                onClick={handleAutoRepair}
                style={{ background: 'var(--accent-rose)', color: '#fff', border: 'none', padding: '0.25rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.4rem' }}
              >
                Click to Auto-Fix
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
