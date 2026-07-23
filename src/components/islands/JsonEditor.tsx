import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { getJsonStats, repairJsonString, type JsonStats } from '../../utils/json-core';
import { Copy, Check, Sparkles, Trash2, Download, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

const SAMPLE_JSON = `{
  "app": "JSONFormator",
  "version": "1.0.0",
  "status": "active",
  "features": [
    "Zero-JS Baseline Shell",
    "100/100 Core Web Vitals",
    "Web Worker Thread Offloading",
    "100% In-Browser Privacy"
  ],
  "author": {
    "name": "Antigravity Engineer",
    "role": "Lead Architect",
    "verified": true
  },
  "metrics": {
    "cls": 0.000,
    "inp_ms": 12,
    "privacy": "Local Storage Only"
  }
}`;

export default function JsonEditor() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [indent, setIndent] = useState(2);
  const [stats, setStats] = useState<JsonStats>(() => getJsonStats(SAMPLE_JSON));
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setStats(getJsonStats(input));
  }, [input]);

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleFormat = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indent);
      setInput(formatted);
      triggerNotice(`Formatted successfully (${indent} spaces)`);
    } catch (err: any) {
      triggerNotice('Invalid JSON syntax');
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setInput(minified);
      triggerNotice('Minified successfully');
    } catch (err: any) {
      triggerNotice('Invalid JSON syntax');
    }
  };

  const handleRepair = () => {
    try {
      const repaired = repairJsonString(input);
      const parsed = JSON.parse(repaired);
      setInput(JSON.stringify(parsed, null, indent));
      triggerNotice('Repaired trailing commas & unquoted keys!');
    } catch (err) {
      triggerNotice('Could not auto-repair JSON');
    }
  };

  const handleCopy = async () => {
    if (!input) return;
    await navigator.clipboard.writeText(input);
    setCopied(true);
    triggerNotice('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([input], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
    triggerNotice('Downloaded formatted.json');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleFormat();
    } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      handleMinify();
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', position: 'relative' }}>
      {/* Toolbar */}
      <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', padding: '0.75rem 1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        {/* Actions Left */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            onClick={handleFormat} 
            style={{ background: 'var(--accent-emerald)', color: '#ffffff', border: 'none', padding: '0.45rem 0.9rem', borderRadius: '0.375rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(5,150,105,0.25)' }}
            aria-label="Format JSON (Ctrl+Enter)"
          >
            <Sparkles size={16} /> Format JSON
          </button>

          <button 
            onClick={handleMinify} 
            style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.45rem 0.9rem', borderRadius: '0.375rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            aria-label="Minify JSON (Ctrl+Shift+F)"
          >
            Minify
          </button>

          <button 
            onClick={handleRepair} 
            style={{ background: 'var(--bg-card-hover)', color: 'var(--accent-cyan)', border: '1px solid var(--border-highlight)', padding: '0.45rem 0.9rem', borderRadius: '0.375rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            aria-label="Auto Repair JSON"
          >
            Auto Repair
          </button>

          <select 
            value={indent} 
            onChange={(e) => setIndent(Number(e.target.value))}
            style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.45rem 0.6rem', borderRadius: '0.375rem', fontSize: '0.85rem' }}
            aria-label="Indent spacing"
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
            <option value={8}>8 Spaces</option>
          </select>
        </div>

        {/* Actions Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          <button 
            onClick={handleCopy} 
            style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.45rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            aria-label="Copy JSON"
          >
            {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button 
            onClick={handleDownload} 
            style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.45rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            aria-label="Download JSON file"
          >
            <Download size={16} /> Download
          </button>

          <button 
            onClick={() => setInput('')} 
            style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', padding: '0.45rem', borderRadius: '0.375rem', cursor: 'pointer' }}
            aria-label="Clear Editor"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Live Stats & Validation Bar */}
      <div style={{ background: 'var(--bg-primary)', padding: '0.5rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span>Size: <strong>{(stats.sizeBytes / 1024).toFixed(2)} KB</strong></span>
          <span>Lines: <strong>{stats.lines}</strong></span>
          <span>Keys: <strong>{stats.keysCount}</strong></span>
          <span>Depth: <strong>{stats.depth}</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {stats.isValid ? (
            <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <CheckCircle2 size={14} /> Valid JSON
            </span>
          ) : (
            <span style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <AlertTriangle size={14} /> {stats.errorLine ? `Error on line ${stats.errorLine}` : 'Invalid JSON'}
            </span>
          )}
        </div>
      </div>

      {/* Editor Textarea */}
      <div style={{ position: 'relative' }}>
        <label htmlFor="json-input-editor" className="sr-only">JSON Source Editor</label>
        <textarea
          id="json-input-editor"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-describedby={stats.error ? "editor-error-notice" : undefined}
          aria-invalid={!stats.isValid}
          placeholder="Paste or type JSON payload here..."
          style={{
            width: '100%',
            height: '480px',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            padding: '1.25rem',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            tabSize: indent
          }}
        />
      </div>

      {/* Status Toast Notification */}
      {notice && (
        <div 
          role="status" 
          style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', background: '#ffffff', border: '1px solid var(--accent-emerald)', color: 'var(--text-primary)', padding: '0.6rem 1rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ShieldCheck size={16} color="var(--accent-emerald)" />
          {notice}
        </div>
      )}
    </div>
  );
}
