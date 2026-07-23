import { useState } from 'react';
import { ChevronRight, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';

const SAMPLE_TREE = `{
  "project": "jsonformator.com",
  "architecture": {
    "framework": "Astro SSG",
    "islands": ["React", "TypeScript"],
    "performance": {
      "cwv": 100,
      "cls": 0,
      "inp_ms": 15
    }
  },
  "routes": ["/", "/compare", "/validator", "/minify", "/tree"]
}`;

function TreeNode({ label, data, isLast, forceCollapse }: { label?: string; data: any; isLast?: boolean; forceCollapse?: boolean | null }) {
  const [collapsed, setCollapsed] = useState(false);
  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  const isNodeCollapsed = forceCollapse !== null && forceCollapse !== undefined ? forceCollapse : collapsed;

  if (!isObject) {
    let color = 'var(--accent-emerald)';
    if (typeof data === 'number') color = 'var(--accent-cyan)';
    if (typeof data === 'boolean') color = 'var(--accent-purple)';

    return (
      <div style={{ paddingLeft: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '1.6' }}>
        {label && <span style={{ color: 'var(--text-secondary)' }}>"{label}": </span>}
        <span style={{ color }}>{JSON.stringify(data)}</span>
        {!isLast && <span style={{ color: 'var(--text-muted)' }}>,</span>}
      </div>
    );
  }

  const keys = Object.keys(data);
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '1.6' }}>
      <div 
        onClick={() => setCollapsed(!isNodeCollapsed)}
        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-primary)' }}
      >
        {isNodeCollapsed ? <ChevronRight size={14} color="var(--accent-emerald)" /> : <ChevronDown size={14} color="var(--accent-emerald)" />}
        {label && <span style={{ color: 'var(--text-secondary)' }}>"{label}": </span>}
        <span style={{ color: 'var(--text-muted)' }}>{openBracket}</span>
        {isNodeCollapsed && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0.3rem' }}>{keys.length} items</span>}
        {isNodeCollapsed && <span style={{ color: 'var(--text-muted)' }}>{closeBracket}</span>}
      </div>

      {!isNodeCollapsed && (
        <div style={{ borderLeft: '1px dashed var(--border-subtle)', marginLeft: '0.4rem', paddingLeft: '0.8rem' }}>
          {keys.map((key, i) => (
            <TreeNode 
              key={key} 
              label={isArray ? undefined : key} 
              data={data[key]} 
              isLast={i === keys.length - 1}
              forceCollapse={forceCollapse}
            />
          ))}
        </div>
      )}

      {!isNodeCollapsed && <div style={{ color: 'var(--text-muted)' }}>{closeBracket}{!isLast && ','}</div>}
    </div>
  );
}

export default function JsonTree() {
  const [input, setInput] = useState(SAMPLE_TREE);
  const [parsed, setParsed] = useState<any>(() => JSON.parse(SAMPLE_TREE));
  const [forceCollapseState, setForceCollapseState] = useState<boolean | null>(null);

  const handleParse = () => {
    try {
      setParsed(JSON.parse(input));
      setForceCollapseState(null);
    } catch (e) {
      setParsed(null);
    }
  };

  const handleExpandAll = () => {
    setForceCollapseState(false);
  };

  const handleCollapseAll = () => {
    setForceCollapseState(true);
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>JSON Payload Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ width: '100%', height: '320px', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', outline: 'none' }}
          />
          <button
            onClick={handleParse}
            style={{ marginTop: '0.75rem', background: 'var(--accent-emerald)', color: '#ffffff', border: 'none', padding: '0.45rem 1rem', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Update Visual Tree Graph
          </button>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Expandable Node Tree</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={handleExpandAll}
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                title="Expand All Nodes"
              >
                <Maximize2 size={12} /> Expand All
              </button>
              <button
                onClick={handleCollapseAll}
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                title="Collapse All Nodes"
              >
                <Minimize2 size={12} /> Collapse All
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: '320px', background: 'var(--bg-primary)', padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', overflow: 'auto' }}>
            {parsed ? (
              <TreeNode data={parsed} isLast={true} forceCollapse={forceCollapseState} />
            ) : (
              <span style={{ color: 'var(--accent-rose)', fontSize: '0.85rem' }}>Invalid JSON payload for tree rendering.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
