import { useState } from 'react';
import { computeJsonDiff, type DiffLine } from '../../utils/json-diff';

const DEFAULT_LEFT = `{
  "id": 101,
  "name": "Standard License",
  "price": 29.99,
  "features": ["formatting", "validation"]
}`;

const DEFAULT_RIGHT = `{
  "id": 101,
  "name": "Pro License Suite",
  "price": 49.99,
  "features": ["formatting", "validation", "diff", "converters"],
  "active": true
}`;

export default function JsonCompare() {
  const [leftJson, setLeftJson] = useState(DEFAULT_LEFT);
  const [rightJson, setRightJson] = useState(DEFAULT_RIGHT);
  const [diffs, setDiffs] = useState<DiffLine[]>(() => computeJsonDiff(DEFAULT_LEFT, DEFAULT_RIGHT));

  const handleCompare = () => {
    const computed = computeJsonDiff(leftJson, rightJson);
    setDiffs(computed);
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', overflow: 'hidden' }}>
      {/* Input Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', background: 'var(--border-subtle)' }}>
        {/* Left Pane */}
        <div style={{ background: 'var(--bg-card)', padding: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
            Original JSON (Left)
          </label>
          <textarea
            value={leftJson}
            onChange={(e) => setLeftJson(e.target.value)}
            style={{ width: '100%', height: '220px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', outline: 'none' }}
          />
        </div>

        {/* Right Pane */}
        <div style={{ background: 'var(--bg-card)', padding: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
            Modified JSON (Right)
          </label>
          <textarea
            value={rightJson}
            onChange={(e) => setRightJson(e.target.value)}
            style={{ width: '100%', height: '220px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', outline: 'none' }}
          />
        </div>
      </div>

      {/* Action Toolbar */}
      <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={handleCompare}
          style={{ background: 'var(--accent-emerald)', color: '#000', border: 'none', padding: '0.45rem 1.25rem', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          Compare Differences
        </button>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></span> Additions (+)
          </span>
          <span style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-rose)' }}></span> Deletions (-)
          </span>
        </div>
      </div>

      {/* Diff Output Viewer */}
      <div style={{ background: 'var(--bg-primary)', padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', overflowX: 'auto', minHeight: '300px' }}>
        {diffs.map((diff, idx) => {
          let bg = 'transparent';
          let symbol = ' ';
          let color = 'var(--text-primary)';

          if (diff.type === 'add') {
            bg = 'var(--accent-emerald-glow)';
            symbol = '+';
            color = '#a7f3d0';
          } else if (diff.type === 'remove') {
            bg = 'var(--accent-rose-glow)';
            symbol = '-';
            color = '#fecdd3';
          }

          return (
            <div key={idx} style={{ background: bg, color: color, padding: '0.15rem 0.5rem', borderRadius: '0.2rem', display: 'flex', gap: '1rem', whiteSpace: 'pre-wrap' }}>
              <span style={{ color: 'var(--text-muted)', userSelect: 'none', minWidth: '2.5rem', textAlign: 'right' }}>
                {diff.leftLineNumber || ''}
              </span>
              <span style={{ color: 'var(--text-muted)', userSelect: 'none', minWidth: '2.5rem', textAlign: 'right' }}>
                {diff.rightLineNumber || ''}
              </span>
              <span style={{ width: '1rem', fontWeight: 800 }}>{symbol}</span>
              <span>{diff.content}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
