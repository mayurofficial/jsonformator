import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent, DragEvent } from 'react';
import { getJsonStats, repairJsonString, jsonToTypescript, type JsonStats } from '../../utils/json-core';
import { Copy, Check, Sparkles, Trash2, Download, CheckCircle2, AlertTriangle, ShieldCheck, Upload, Lightbulb, Wrench, ChevronRight, ChevronDown, Maximize2, Minimize2, Search, Code, TreeDeciduous, FileCode, FileText, Plus, X, FileUp } from 'lucide-react';

const SAMPLES = {
  default: `{
  "application": {
    "name": "JSONFormator Pro Suite",
    "version": "2.4.0",
    "license": "MIT",
    "environment": "production",
    "privacy": {
      "clientSideOnly": true,
      "serverUploads": false,
      "webWorkerThreads": true,
      "telemetryEnabled": false
    }
  },
  "performanceMetrics": {
    "lighthouseScore": 100,
    "firstContentfulPaintMs": 280,
    "cumulativeLayoutShift": 0.000,
    "interactionToNextPaintMs": 12,
    "bundleSizeBytes": 0
  },
  "activeFeatures": [
    "Side-by-Side Dual Pane Workspace",
    "Interactive Tree Explorer & Search Filter",
    "JSONPath Click-to-Copy",
    "Multi-Pass Syntax Auto-Repair Engine",
    "1-Click TypeScript & Go Struct Generators"
  ],
  "supportedConverters": {
    "tabular": ["CSV", "Excel TSV"],
    "serialization": ["YAML", "XML"],
    "typeDefinitions": ["TypeScript", "Go Struct", "JSON Schema"]
  },
  "userPreferences": {
    "theme": "slate-light",
    "indentSpaces": 2,
    "autoRepairOnPaste": true,
    "defaultViewMode": "tree"
  }
}`,
  api: `{
  "statusCode": 200,
  "data": {
    "users": [
      { "id": 101, "name": "Alice", "role": "admin", "active": true },
      { "id": 102, "name": "Bob", "role": "developer", "active": false }
    ],
    "pagination": { "page": 1, "perPage": 20, "total": 102 }
  }
}`
};

interface PageSession {
  id: string;
  name: string;
  content: string;
}

// Interactive Tree Node Component
function TreeNode({ label, data, isLast, forceCollapse, searchFilter, path = '' }: { label?: string; data: any; isLast?: boolean; forceCollapse?: boolean | null; searchFilter?: string; path?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const isObject = typeof data === 'object' && data !== null;
  const isArray = Array.isArray(data);

  const isNodeCollapsed = forceCollapse !== null && forceCollapse !== undefined ? forceCollapse : collapsed;

  const currentPath = path ? (label ? `${path}.${label}` : path) : (label || '$');

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(currentPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 1500);
  };

  // Filter check
  if (searchFilter && searchFilter.trim()) {
    const term = searchFilter.toLowerCase();
    const matchesLabel = label && label.toLowerCase().includes(term);
    const matchesValue = !isObject && String(data).toLowerCase().includes(term);
    if (!matchesLabel && !matchesValue && !isObject) {
      return null;
    }
  }

  if (!isObject) {
    let color = 'var(--accent-emerald)';
    if (typeof data === 'number') color = 'var(--accent-cyan)';
    if (typeof data === 'boolean') color = 'var(--accent-purple)';

    return (
      <div className="tree-leaf" style={{ paddingLeft: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', lineHeight: '1.6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {label && <span style={{ color: 'var(--text-secondary)' }}>"{label}": </span>}
          <span style={{ color }}>{JSON.stringify(data)}</span>
          {!isLast && <span style={{ color: 'var(--text-muted)' }}>,</span>}
        </div>
        <button 
          onClick={handleCopyPath} 
          style={{ opacity: copiedPath ? 1 : 0.4, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: copiedPath ? 'var(--accent-emerald)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          title={`Copy JSONPath: ${currentPath}`}
        >
          {copiedPath ? '✓ copied' : currentPath}
        </button>
      </div>
    );
  }

  const keys = Object.keys(data);
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', lineHeight: '1.6' }}>
      <div 
        onClick={() => setCollapsed(!isNodeCollapsed)}
        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-primary)', userSelect: 'none' }}
      >
        {isNodeCollapsed ? <ChevronRight size={13} color="var(--accent-emerald)" /> : <ChevronDown size={13} color="var(--accent-emerald)" />}
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
              searchFilter={searchFilter}
              path={currentPath}
            />
          ))}
        </div>
      )}

      {!isNodeCollapsed && <div style={{ color: 'var(--text-muted)' }}>{closeBracket}{!isLast && ','}</div>}
    </div>
  );
}

export default function JsonEditor() {
  // Dynamic Workspace Pages State (Starts with 1 page by default)
  const [pages, setPages] = useState<PageSession[]>([
    { id: '1', name: 'Page 1', content: SAMPLES.default }
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  const activePage = pages[activePageIndex] || pages[0];
  const input = activePage?.content || '';

  const setInput = (val: string) => {
    setPages(prev => {
      const copy = [...prev];
      if (copy[activePageIndex]) {
        copy[activePageIndex] = { ...copy[activePageIndex], content: val };
      }
      return copy;
    });
  };

  const handleAddPage = () => {
    const newNum = pages.length + 1;
    const newPage: PageSession = {
      id: String(Date.now()),
      name: `Page ${newNum}`,
      content: ''
    };
    setPages(prev => [...prev, newPage]);
    setActivePageIndex(pages.length);
    triggerNotice(`Created Page ${newNum}`);
  };

  const handleRemovePage = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pages.length <= 1) return;
    setPages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (activePageIndex >= indexToRemove && activePageIndex > 0) {
      setActivePageIndex(prev => prev - 1);
    }
  };

  const [indent, setIndent] = useState(2);
  const [stats, setStats] = useState<JsonStats>(() => getJsonStats(SAMPLES.default));
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rightMode, setRightMode] = useState<'tree' | 'code' | 'types'>('tree');
  const [searchFilter, setSearchFilter] = useState('');
  const [forceCollapseState, setForceCollapseState] = useState<boolean | null>(null);
  const [parsedData, setParsedData] = useState<any>(() => JSON.parse(SAMPLES.default));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentStats = getJsonStats(input);
    setStats(currentStats);
    if (currentStats.isValid && input.trim()) {
      try {
        setParsedData(JSON.parse(input));
      } catch (e) {}
    } else {
      setParsedData(null);
    }
  }, [input, activePageIndex]);

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
      triggerNotice(`Formatted ${activePage.name} (${indent} spaces)`);
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
      triggerNotice(`Minified ${activePage.name}`);
    } catch (err: any) {
      triggerNotice('Invalid JSON syntax');
    }
  };

  const handleRepair = () => {
    if (!input.trim()) return;
    const repaired = repairJsonString(input);
    setInput(repaired);
    const statsNow = getJsonStats(repaired);
    setStats(statsNow);
    if (statsNow.isValid) {
      triggerNotice(`Repaired ${activePage.name} successfully!`);
    } else {
      triggerNotice('Auto-repaired partially. See diagnostic tips below.');
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
    if (!input.trim()) return;
    const blob = new Blob([input], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePage.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerNotice(`Downloaded ${activePage.name}.json`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          setInput(text);
          triggerNotice(`Loaded ${file.name} into ${activePage.name}`);
        }
      };
      reader.readAsText(file);
    }
  };

  // Drag and drop file loader
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          setInput(text);
          triggerNotice(`Loaded ${file.name} into ${activePage.name}`);
        }
      };
      reader.readAsText(file);
    }
  };

  // Jump cursor to error line
  const handleJumpToError = () => {
    if (!stats.errorLine || !textareaRef.current) return;
    const lines = input.split('\n');
    let charPos = 0;
    for (let i = 0; i < stats.errorLine - 1; i++) {
      charPos += lines[i].length + 1;
    }
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(charPos, charPos + (lines[stats.errorLine - 1]?.length || 0));
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
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ position: 'relative' }}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".json,application/json,text/plain" 
        style={{ display: 'none' }} 
      />

      {/* 1. FIXED WORKSPACE SIDEBAR ON EXTREME LEFT */}
      <div 
        style={{ 
          position: 'fixed',
          top: '4rem',
          left: 0,
          bottom: 0,
          width: '145px',
          height: 'calc(100vh - 4rem)',
          background: 'var(--bg-card)', 
          borderRight: '1px solid var(--border-subtle)', 
          padding: '0.85rem 0.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.45rem',
          zIndex: 30,
          boxShadow: '4px 0 15px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.2rem 0.4rem', marginBottom: '0.1rem' }}>
          Pages ({pages.length})
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {pages.map((p, idx) => {
            const isActive = activePageIndex === idx;
            const pStats = getJsonStats(p.content);
            const pLines = p.content ? p.content.split('\n').length : 0;
            const hasContent = p.content.trim().length > 0;

            return (
              <div
                key={p.id}
                onClick={() => setActivePageIndex(idx)}
                style={{
                  width: '100%',
                  background: isActive ? 'rgba(5, 150, 105, 0.08)' : 'var(--bg-primary)',
                  border: isActive ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                  borderLeft: isActive ? '3px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                  borderRadius: '0.375rem',
                  padding: '0.45rem 0.5rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.15rem',
                  position: 'relative'
                }}
                className="workspace-tab"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isActive ? 'var(--accent-emerald)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FileText size={13} color={isActive ? 'var(--accent-emerald)' : 'var(--text-muted)'} /> {p.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {hasContent && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: pStats.isValid ? 'var(--accent-emerald)' : 'var(--accent-rose)' }} />
                    )}
                    {pages.length > 1 && (
                      <button
                        onClick={(e) => handleRemovePage(idx, e)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.1rem', borderRadius: '0.2rem', display: 'inline-flex', opacity: 0.7 }}
                        title="Delete Page"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {hasContent ? `${pLines} lines` : 'Empty'}
                </div>
              </div>
            );
          })}

          {/* SINGLE "+ Add Page" BUTTON */}
          <button
            onClick={handleAddPage}
            style={{ 
              width: '100%', 
              background: 'var(--bg-primary)', 
              border: '1px dashed var(--border-highlight)', 
              color: 'var(--text-secondary)', 
              padding: '0.45rem', 
              borderRadius: '0.375rem', 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.3rem', 
              marginTop: '0.15rem' 
            }}
          >
            <Plus size={13} /> Add Page
          </button>
        </div>
      </div>

      {/* Drag overlay notice */}
      {isDragging && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)', pointerEvents: 'none' }}>
          <Upload size={44} style={{ marginBottom: '0.5rem' }} />
          <strong style={{ fontSize: '1.1rem' }}>Drop JSON file into {activePage.name}</strong>
        </div>
      )}

      {/* 2. MAIN RIGHT CONTENT AREA (ASYMMETRIC SPLIT: LEFT CARD 42%, RIGHT CARD 58%) */}
      <div style={{ marginLeft: '145px', padding: '1rem' }}>
        
        {/* Asymmetric 42% / 58% Grid Workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 42fr) minmax(380px, 58fr)', gap: '1rem' }}>
          
          {/* LEFT CARD: RAW JSON INPUT & FORMAT CONTROLS (42% Width) */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Left Card Top Header Row */}
            <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', padding: '0.6rem 0.85rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
              {/* Format Actions */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.35rem' }}>
                <button 
                  onClick={handleFormat} 
                  style={{ background: 'var(--accent-emerald)', color: '#ffffff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '0.35rem', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 2px 6px rgba(5,150,105,0.25)' }}
                  aria-label="Format JSON (Ctrl+Enter)"
                >
                  <Sparkles size={14} /> Format
                </button>

                <button 
                  onClick={handleMinify} 
                  style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.35rem 0.7rem', borderRadius: '0.35rem', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}
                  aria-label="Minify JSON"
                >
                  Minify
                </button>

                <button 
                  onClick={handleRepair} 
                  style={{ background: 'var(--bg-card-hover)', color: 'var(--accent-cyan)', border: '1px solid var(--border-highlight)', padding: '0.35rem 0.7rem', borderRadius: '0.35rem', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  aria-label="Auto Repair JSON"
                >
                  <Wrench size={12} /> Auto Repair
                </button>

                <select 
                  value={indent} 
                  onChange={(e) => setIndent(Number(e.target.value))}
                  style={{ background: 'var(--bg-card-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-highlight)', padding: '0.35rem 0.45rem', borderRadius: '0.35rem', fontSize: '0.78rem' }}
                  aria-label="Indent spacing"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={8}>8 Spaces</option>
                </select>
              </div>

              {/* Clear Button */}
              <button 
                onClick={() => setInput('')} 
                style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', padding: '0.3rem', borderRadius: '0.3rem', cursor: 'pointer' }}
                aria-label="Clear Editor"
                title={`Clear ${activePage.name}`}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Left Card Sub-Header: Stats & Validation Bar */}
            <div style={{ background: 'var(--bg-primary)', padding: '0.35rem 0.85rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span>Session: <strong style={{ color: 'var(--accent-emerald)' }}>{activePage.name}</strong></span>
                <span>Size: <strong>{(stats.sizeBytes / 1024).toFixed(2)} KB</strong></span>
                <span>Lines: <strong>{input.trim() ? stats.lines : 0}</strong></span>
                <span>Keys: <strong>{stats.keysCount}</strong></span>
              </div>

              <div>
                {!input.trim() ? (
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Ready for JSON</span>
                ) : stats.isValid ? (
                  <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                    <CheckCircle2 size={13} /> Valid JSON
                  </span>
                ) : (
                  <button 
                    onClick={handleJumpToError}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                    title="Click to jump to error in editor"
                  >
                    <AlertTriangle size={13} /> {stats.errorLine ? `Error on line ${stats.errorLine} (Click to jump)` : 'Invalid JSON'}
                  </button>
                )}
              </div>
            </div>

            {/* Left Textarea Body (Always Open at Top for Direct Pasting) */}
            <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="json-input-editor" className="sr-only">JSON Source Editor</label>
              <textarea
                id="json-input-editor"
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-describedby={stats.error ? "editor-error-notice" : undefined}
                aria-invalid={!stats.isValid}
                placeholder={`Paste JSON for ${activePage.name} here...`}
                style={{
                  width: '100%',
                  flex: 1,
                  minHeight: input.trim() ? '400px' : '260px',
                  height: input.trim() ? 'calc(100vh - 210px)' : 'calc(100vh - 360px)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.86rem',
                  lineHeight: '1.45',
                  padding: '0.85rem 1rem',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  tabSize: indent
                }}
              />

              {/* COMPACT BOTTOM DROPZONE BANNER (ONLY SHOWN WHEN EMPTY, REMOVED ONCE USER PASTES) */}
              {!input.trim() && (
                <div 
                  style={{
                    margin: '0.75rem',
                    background: 'var(--bg-primary)',
                    border: '1px dashed var(--border-highlight)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ background: 'rgba(5, 150, 105, 0.1)', borderRadius: '0.4rem', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileUp size={20} color="var(--accent-emerald)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Drag & drop file or pick a sample payload
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Drop a <code>.json</code> file anywhere or click a button to load sample data.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button 
                      onClick={() => setInput(SAMPLES.default)}
                      style={{ background: 'var(--accent-emerald)', color: '#ffffff', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '0.3rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 2px 5px rgba(5,150,105,0.2)' }}
                    >
                      <Sparkles size={12} /> Load Sample 1
                    </button>

                    <button 
                      onClick={() => setInput(SAMPLES.api)}
                      style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.65rem', borderRadius: '0.3rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      API Response
                    </button>

                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      style={{ background: 'var(--bg-card)', color: 'var(--accent-cyan)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.65rem', borderRadius: '0.3rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Upload size={12} /> Upload File
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CARD: INTERACTIVE TREE & OUTPUT INSPECTOR (58% Width) */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
            
            {/* Right Card Top Header Row */}
            <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)', padding: '0.6rem 0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              
              {/* View Mode Switcher Tabs */}
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button 
                  onClick={() => setRightMode('tree')}
                  style={{ background: rightMode === 'tree' ? 'var(--bg-card)' : 'transparent', color: rightMode === 'tree' ? 'var(--accent-emerald)' : 'var(--text-secondary)', border: rightMode === 'tree' ? '1px solid var(--border-subtle)' : 'none', padding: '0.25rem 0.55rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <TreeDeciduous size={13} /> Interactive Tree
                </button>

                <button 
                  onClick={() => setRightMode('code')}
                  style={{ background: rightMode === 'code' ? 'var(--bg-card)' : 'transparent', color: rightMode === 'code' ? 'var(--accent-emerald)' : 'var(--text-secondary)', border: rightMode === 'code' ? '1px solid var(--border-subtle)' : 'none', padding: '0.25rem 0.55rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <Code size={13} /> Formatted Code
                </button>

                <button 
                  onClick={() => setRightMode('types')}
                  style={{ background: rightMode === 'types' ? 'var(--bg-card)' : 'transparent', color: rightMode === 'types' ? 'var(--accent-purple)' : 'var(--text-secondary)', border: rightMode === 'types' ? '1px solid var(--border-subtle)' : 'none', padding: '0.25rem 0.55rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <FileCode size={13} /> TS Interfaces
                </button>
              </div>

              {/* Right Controls: Search, Copy, Download, Expand */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {rightMode === 'tree' && input.trim() && (
                  <>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Search size={11} style={{ position: 'absolute', left: '0.4rem', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Search node..."
                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', borderRadius: '0.25rem', padding: '0.18rem 0.4rem 0.18rem 1.3rem', fontSize: '0.72rem', color: 'var(--text-primary)', outline: 'none', width: '95px' }}
                      />
                    </div>
                    <button onClick={() => setForceCollapseState(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.15rem' }} title="Expand All"><Maximize2 size={12} /></button>
                    <button onClick={() => setForceCollapseState(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.15rem' }} title="Collapse All"><Minimize2 size={12} /></button>
                  </>
                )}

                <button 
                  onClick={handleCopy} 
                  disabled={!input.trim()}
                  style={{ background: 'var(--bg-card-hover)', color: input.trim() ? 'var(--text-primary)' : 'var(--text-muted)', border: '1px solid var(--border-highlight)', padding: '0.22rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.25rem', opacity: input.trim() ? 1 : 0.5 }}
                  aria-label="Copy Output"
                >
                  {copied ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>

                <button 
                  onClick={handleDownload} 
                  disabled={!input.trim()}
                  style={{ background: 'var(--bg-card-hover)', color: input.trim() ? 'var(--text-primary)' : 'var(--text-muted)', border: '1px solid var(--border-highlight)', padding: '0.22rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.25rem', opacity: input.trim() ? 1 : 0.5 }}
                  aria-label="Download Output"
                >
                  <Download size={13} />
                </button>
              </div>
            </div>

            {/* Right Viewer Body */}
            <div style={{ height: 'calc(100vh - 165px)', minHeight: '430px', overflow: 'auto', padding: '0.85rem 1rem', background: 'var(--bg-card)' }}>
              {!input.trim() ? (
                <div style={{ height: '100%', minHeight: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                  <TreeDeciduous size={36} style={{ opacity: 0.25, marginBottom: '0.6rem' }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Interactive Tree Explorer</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Formatted tree nodes and TypeScript types will render here automatically.</span>
                </div>
              ) : !stats.isValid ? (
                <div style={{ color: 'var(--accent-rose)', fontSize: '0.85rem', padding: '1rem', background: 'rgba(225,29,72,0.05)', border: '1px solid var(--accent-rose-glow)', borderRadius: '0.375rem' }}>
                  <strong>Syntax Error:</strong> Parse failed on {activePage.name}. Fix syntax errors on left pane to view tree.
                </div>
              ) : (
                <>
                  {rightMode === 'tree' && parsedData && (
                    <TreeNode data={parsedData} isLast={true} forceCollapse={forceCollapseState} searchFilter={searchFilter} />
                  )}

                  {rightMode === 'code' && (
                    <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.86rem', lineHeight: '1.45', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                      <code>{JSON.stringify(parsedData, null, indent)}</code>
                    </pre>
                  )}

                  {rightMode === 'types' && (
                    <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.84rem', lineHeight: '1.45', color: 'var(--accent-purple)', whiteSpace: 'pre-wrap' }}>
                      <code>{jsonToTypescript(input, 'RootObject')}</code>
                    </pre>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Diagnostic Suggestions Panel (Rendered ONLY if invalid non-empty JSON) */}
        {input.trim() && !stats.isValid && stats.suggestions && stats.suggestions.length > 0 && (
          <div style={{ marginTop: '1rem', background: 'rgba(225, 29, 72, 0.05)', border: '1px solid var(--accent-rose-glow)', borderRadius: '0.5rem', padding: '0.75rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lightbulb size={15} /> Diagnostic Suggestions to Fix JSON ({activePage.name})
              </span>
              <button 
                onClick={handleRepair}
                style={{ background: 'var(--accent-emerald)', color: '#ffffff', border: 'none', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <Wrench size={12} /> Auto-Fix Now
              </button>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              {stats.suggestions.map((sug, i) => (
                <li key={i}>{sug}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Status Toast Notification */}
      {notice && (
        <div 
          role="status" 
          style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 100, background: '#ffffff', border: '1px solid var(--accent-emerald)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ShieldCheck size={16} color="var(--accent-emerald)" />
          {notice}
        </div>
      )}
    </div>
  );
}
