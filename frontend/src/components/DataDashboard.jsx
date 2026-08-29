import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  UploadCloud, Loader2, BarChart2, CheckCircle2, X,
  ArrowLeft, FileSpreadsheet, Pencil, Trash2, MoreVertical, Plus,
  Sparkles, ChevronRight, AlertTriangle, Table2, TrendingUp,
  Package, DollarSign, Users, Sliders, Menu, Search
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import DataEditor from './DataEditor';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabase';

// ── Constants ─────────────────────────────────────────────────────────────────

const ACCENT = '#d4f000';
const CHART_COLORS = ['#d4f000', '#a3b800', '#ffffff', '#888888', '#444444'];

const ANALYSIS_TYPES = [
  { id: 'general',   label: 'General Analytics', icon: BarChart2 },
  { id: 'sales',     label: 'Sales',              icon: TrendingUp },
  { id: 'inventory', label: 'Inventory',           icon: Package },
  { id: 'finance',   label: 'Finance',             icon: DollarSign },
  { id: 'customer',  label: 'Customer Insights',   icon: Users },
  { id: 'custom',    label: 'Custom',              icon: Sliders },
];

// ── Dashboard Card ────────────────────────────────────────────────────────────

function DashboardCard({ dashboard, isSelected, onOpen, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nameValue, setNameValue] = useState(dashboard.name);
  const inputRef = useRef(null);

  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const commitRename = () => {
    const t = nameValue.trim();
    if (t && t !== dashboard.name) onRename(dashboard.id, t);
    else setNameValue(dashboard.name);
    setEditing(false);
  };

  const onKey = (e) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setNameValue(dashboard.name); setEditing(false); }
  };

  const date = new Date(dashboard.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <>
      <div
        onClick={() => !editing && onOpen(dashboard)}
        style={{
          position: 'relative', cursor: 'pointer',
          background: isSelected ? 'rgba(212,240,0,0.06)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${isSelected ? ACCENT : 'rgba(255,255,255,0.08)'}`,
          padding: '16px', marginBottom: '4px', transition: 'all 0.2s',
        }}
        className="group"
        onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
      >
        {isSelected && (
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px', background: ACCENT }} />
        )}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div
            style={{
              flexShrink: 0, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${isSelected ? ACCENT : 'rgba(255,255,255,0.1)'}`,
              color: isSelected ? ACCENT : 'rgba(255,255,255,0.4)', marginTop: '2px',
            }}
          >
            <FileSpreadsheet size={15} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <input
                ref={inputRef}
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={onKey}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%', background: 'transparent', color: '#fff', fontSize: '14px',
                  fontWeight: 600, outline: 'none', border: 'none', borderBottom: `1px solid ${ACCENT}`,
                  paddingBottom: '2px', boxSizing: 'border-box',
                }}
              />
            ) : (
              <p style={{
                fontSize: '14px', fontWeight: 600,
                color: isSelected ? ACCENT : 'rgba(255,255,255,0.85)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {dashboard.name}
              </p>
            )}
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>
              {date}
            </p>
          </div>
          <div
            className="opacity-0 group-hover:opacity-100"
            style={{ display: 'flex', alignItems: 'center', gap: '2px', transition: 'opacity 0.15s' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditing(true)}
              style={{ padding: '6px', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              title="Rename"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{ padding: '6px', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.color = '#f87171'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => { e.stopPropagation(); setShowDeleteModal(false); }}
        >
          <div 
            className="bg-[#111] border border-white/10 p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={22} />
            </div>
            <h3 className="text-base font-bold text-white/90 mb-1">Delete Dashboard</h3>
            <p className="text-white/50 text-xs mb-6 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-semibold">"{dashboard.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-[11px] uppercase tracking-widest font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { onDelete(dashboard.id); setShowDeleteModal(false); }}
                className="flex-1 py-2.5 bg-red-500 text-white hover:bg-red-600 text-[11px] uppercase tracking-widest font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.2)', marginBottom: '16px' }}>
        <Table2 size={20} />
      </div>
      <p style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '6px' }}>No saved dashboards</p>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', lineHeight: '1.6' }}>
        Upload and analyze a file to generate your first dashboard.
      </p>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ savedDashboards, activeDashboard, onOpen, onRename, onDelete, onNewAnalysis, style, className }) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDashboards = savedDashboards.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const defaultWidth = style?.width || '320px';

  return (
    <aside className={`${className || ''} ${!isOpen ? 'sidebar-closed' : ''}`} style={{
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      width: isOpen ? defaultWidth : '64px', 
      borderRight: isOpen ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent', 
      background: isOpen ? '#080808' : 'transparent',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease, background-color 0.3s ease',
      overflow: 'hidden',
      position: 'relative',
      ...style,
      width: isOpen ? defaultWidth : '64px',
    }}>
      {/* Header with Title, Search & Hamburger toggle */}
      <div style={{ padding: isOpen ? '24px 20px 16px' : '20px 12px', borderBottom: isOpen ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent', transition: 'padding 0.3s ease, border-color 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: isOpen ? 'space-between' : 'center', alignItems: 'center', minHeight: '28px' }}>
          {isOpen && (
            <h2 style={{ 
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', margin: 0,
              whiteSpace: 'nowrap', opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s ease'
            }}>
              Saved Dashboards
            </h2>
          )}
          <button 
            onClick={() => setIsOpen(prev => !prev)} 
            style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'none'; }}
            title={isOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            <Menu size={18} />
          </button>
        </div>

        {isOpen && (
          <div style={{ position: 'relative', marginTop: '16px', opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s ease' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input 
              type="text" 
              placeholder="Search dashboards..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#fff', fontSize: '13px', padding: '8px 12px 8px 32px', outline: 'none', borderRadius: '4px',
                boxSizing: 'border-box', transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d4f000'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
        )}
      </div>

      {/* Main List Area */}
      <div style={{ 
        flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: isOpen ? '8px' : '8px 4px',
        opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'opacity 0.2s ease, padding 0.3s ease'
      }}>
        {isOpen && (
          filteredDashboards.length === 0 ? (
            searchQuery ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                No results found
              </div>
            ) : <EmptyState />
          ) : (
            filteredDashboards.map((d) => (
              <DashboardCard
                key={d.id} dashboard={d} isSelected={activeDashboard?.id === d.id}
                onOpen={onOpen} onRename={onRename} onDelete={onDelete}
              />
            ))
          )
        )}
      </div>

      {/* Footer Action Button */}
      {onNewAnalysis && isOpen && (
        <div style={{ 
          padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)',
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s ease'
        }}>
          <button
            onClick={onNewAnalysis}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '10px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
              border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', background: 'none', cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <Plus size={13} /> New Analysis
          </button>
        </div>
      )}
    </aside>
  );
}

// ── Dashboard Results View ────────────────────────────────────────────────────

function DashboardView({ dashboard, onBack, onUpdateName, onUpdateDashboard }) {
  const { result, csvContent, name, analysisType } = dashboard;
  const [activeView, setActiveView] = useState('dashboard');
  const [dashboardName, setDashboardName] = useState(name);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const handleReanalyze = async (newCsvContent) => {
    setIsReanalyzing(true);
    try {
      const typeLabel = ANALYSIS_TYPES.find((t) => t.id === analysisType)?.label || '';
      const finalQuery = (analysisType !== 'general' && analysisType !== 'custom')
        ? `Perform a comprehensive ${typeLabel} analysis of this data.` : '';

      const response = await fetch('http://localhost:5000/api/data/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: newCsvContent, query: finalQuery }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze data');
      
      if (onUpdateDashboard) {
        onUpdateDashboard({
          ...dashboard,
          csvContent: newCsvContent,
          result: data.result,
        });
      }
      setActiveView('dashboard');
    } catch (err) {
      alert('Error re-analyzing: ' + err.message);
    } finally {
      setIsReanalyzing(false);
    }
  };

  if (!result || typeof result.answer !== 'object' || result.answer.error) {
    return (
      <div style={{ padding: '32px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '24px' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '24px', fontSize: '13px', fontFamily: 'monospace', overflow: 'auto', color: 'rgba(255,255,255,0.5)' }}>
          {typeof result?.answer === 'string' ? result.answer : JSON.stringify(result?.answer, null, 2)}
        </div>
      </div>
    );
  }

  const { metrics, charts, insights } = result.answer;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ padding: '4px', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          onMouseOver={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <ArrowLeft size={14} />
        </button>
        <input
          type="text"
          value={dashboardName}
          onChange={(e) => { setDashboardName(e.target.value); onUpdateName(dashboard.id, e.target.value); }}
          style={{ flex: 1, background: 'transparent', color: 'rgba(255,255,255,0.9)', fontSize: '18px', fontWeight: 700, outline: 'none', border: 'none', borderBottom: '1px solid transparent', paddingBottom: '2px', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
          onFocus={(e) => e.target.style.borderColor = ACCENT}
          onBlur={(e) => e.target.style.borderColor = 'transparent'}
          title="Click to rename"
        />
        <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
          {['dashboard', 'editor'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveView(tab)}
              style={{
                padding: '8px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                background: activeView === tab ? ACCENT : 'transparent',
                color: activeView === tab ? '#080808' : 'rgba(255,255,255,0.4)',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {tab === 'dashboard' ? 'Dashboard' : 'Data Editor'}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Dashboard panel */}
        <div style={{ display: activeView === 'dashboard' ? 'block' : 'none', background: '#0a0a0a', padding: '24px', paddingBottom: '80px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>

            {metrics && metrics.length > 0 && (
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>Key Metrics</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                  {metrics.map((m, i) => (
                    <div
                      key={i}
                      style={{ padding: '20px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', transition: 'border-color 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(212,240,0,0.3)'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                    >
                      <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '12px' }}>{m.label}</p>
                      <p style={{ fontSize: '24px', fontWeight: 900, color: ACCENT, wordBreak: 'break-word' }}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {charts && charts.length > 0 && (
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>Charts</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
                  {charts.map((chart, i) => (
                    <div key={i} style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: '24px', paddingLeft: '12px', borderLeft: `2px solid ${ACCENT}` }}>{chart.title}</h4>
                      <div style={{ height: '256px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          {chart.type === 'pie' ? (
                            <PieChart>
                              <Pie data={chart.data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" nameKey="name" stroke="none" labelLine={false}>
                                {chart.data.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: 0, border: '1px solid rgba(255,255,255,0.1)', background: '#111', fontSize: 12, fontWeight: 600, color: '#fff' }} itemStyle={{ color: ACCENT }} />
                              <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }} iconType="circle" />
                            </PieChart>
                          ) : (
                            <BarChart data={chart.data} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                              <XAxis dataKey="name" fontSize={10} fontFamily="inherit" tickLine={false} axisLine={false} dy={8} interval="preserveStartEnd" tick={{ fill: 'rgba(255,255,255,0.3)' }} />
                              <YAxis fontSize={10} fontFamily="inherit" tickLine={false} axisLine={false} dx={-5} tick={{ fill: 'rgba(255,255,255,0.3)' }} />
                              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ borderRadius: 0, border: '1px solid rgba(255,255,255,0.1)', background: '#111', fontSize: 12, fontWeight: 600, color: '#fff' }} itemStyle={{ color: ACCENT }} />
                              <Bar dataKey="value" name="Value" fill={ACCENT} radius={[2, 2, 0, 0]} barSize={32} />
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insights && (
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>AI Insights</p>
                <div style={{ border: '1px solid rgba(212,240,0,0.15)', background: 'rgba(212,240,0,0.03)', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(212,240,0,0.3)', color: ACCENT }}>
                      <Sparkles size={14} />
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: ACCENT }}>Analysis Summary</span>
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: '1.75', color: 'rgba(255,255,255,0.65)' }}>
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>{children}</h1>,
                        h2: ({ children }) => <h2 style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '14px', marginBottom: '8px', marginTop: '20px' }}>{children}</h2>,
                        p: ({ children }) => <p style={{ marginBottom: '12px' }}>{children}</p>,
                        ul: ({ children }) => <ul style={{ listStyle: 'disc', marginLeft: '20px', marginBottom: '12px' }}>{children}</ul>,
                        ol: ({ children }) => <ol style={{ listStyle: 'decimal', marginLeft: '20px', marginBottom: '12px' }}>{children}</ol>,
                        strong: ({ children }) => <strong style={{ color: ACCENT }}>{children}</strong>,
                      }}
                    >
                      {insights}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editor panel */}
        <div style={{ display: activeView === 'editor' ? 'block' : 'none', background: '#0a0a0a', padding: '24px', height: '100%' }}>
          {isReanalyzing ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-[#0a0a0a] border border-white/10 text-white/40">
              <Loader2 className="animate-spin text-[#d4f000] mb-4" size={32} />
              <p className="text-[11px] font-bold uppercase tracking-widest">Re-analyzing dataset...</p>
            </div>
          ) : (
            <DataEditor initialCsvContent={csvContent} onReanalyze={handleReanalyze} dashboardName={dashboardName} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DataDashboard() {
  const [savedDashboards, setSavedDashboards] = useState([]);
  const [activeDashboard, setActiveDashboard] = useState(null);
  const [fileState, setFileState] = useState({ file: null, fileName: '', fileSize: '', csvContent: '' });
  const [isDragging, setIsDragging] = useState(false);
  const [query, setQuery] = useState('');
  const [analysisType, setAnalysisType] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const fetchDashboards = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('saved_dashboards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved dashboards:', error);
      } else if (data) {
        const mapped = data.map(d => ({
          id: d.id,
          name: d.name,
          fileName: d.file_name,
          csvContent: d.csv_content,
          analysisType: d.analysis_type,
          result: d.result,
          createdAt: d.created_at,
        }));
        setSavedDashboards(mapped);
      }
    } catch (err) {
      console.error('Error fetching dashboards from database:', err);
    }
  }, []);

  useEffect(() => {
    fetchDashboards();
  }, [fetchDashboards]);

  const handleDeleteDashboard = async (id) => {
    try {
      const { error } = await supabase
        .from('saved_dashboards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting dashboard:', error);
        alert('Failed to delete dashboard: ' + error.message);
        return;
      }

      setSavedDashboards(prev => prev.filter((d) => d.id !== id));
      if (activeDashboard?.id === id) setActiveDashboard(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleRenameDashboard = async (id, newName) => {
    try {
      const { error } = await supabase
        .from('saved_dashboards')
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('Error renaming dashboard:', error);
        alert('Failed to rename dashboard: ' + error.message);
        return;
      }

      setSavedDashboards(prev => prev.map((d) => d.id === id ? { ...d, name: newName } : d));
      if (activeDashboard?.id === id) setActiveDashboard((p) => (p ? { ...p, name: newName } : null));
    } catch (err) {
      console.error('Rename error:', err);
    }
  };

  const handleOpenDashboard = (dashboard) => {
    setActiveDashboard(dashboard);
    setFileState({ file: null, fileName: '', fileSize: '', csvContent: '' });
    setError(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const processFile = useCallback(async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setError('Unsupported file type. Please upload a .csv or .xlsx file.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      let csv = '';
      if (ext === 'csv') {
        csv = evt.target.result;
      } else {
        try {
          const XLSX = await import('xlsx');
          const data = new Uint8Array(evt.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          csv = XLSX.utils.sheet_to_csv(ws);
        } catch (err) { setError('Failed to parse Excel file: ' + err.message); return; }
      }
      setFileState({ file, fileName: file.name, fileSize: formatSize(file.size), csvContent: csv });
    };
    if (ext === 'csv') reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const clearFile = () => {
    setFileState({ file: null, fileName: '', fileSize: '', csvContent: '' });
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyzeData = async () => {
    if (!fileState.csvContent) { setError('Please upload a file first.'); return; }
    setLoading(true); setError(null);
    const typeLabel = ANALYSIS_TYPES.find((t) => t.id === analysisType)?.label || '';
    const finalQuery = query.trim() ? query :
      (analysisType !== 'general' && analysisType !== 'custom')
        ? `Perform a comprehensive ${typeLabel} analysis of this data.` : '';
    try {
      const response = await fetch('http://localhost:5000/api/data/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: fileState.csvContent, query: finalQuery }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze data');
      const baseName = fileState.fileName.replace(/\.[^/.]+$/, '');
      const cleanName = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

      // Fetch user ID if logged in
      const { data: { user } } = await supabase.auth.getUser();

      const newDashPayload = {
        name: `${cleanName} Dashboard`,
        file_name: fileState.fileName,
        csv_content: fileState.csvContent,
        analysis_type: analysisType,
        result: data.result,
        user_id: user ? user.id : null,
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('saved_dashboards')
        .insert([newDashPayload])
        .select()
        .single();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error('Failed to save dashboard to database: ' + insertError.message);
      }

      const newDash = {
        id: insertedData.id,
        name: insertedData.name,
        fileName: insertedData.file_name,
        csvContent: insertedData.csv_content,
        result: insertedData.result,
        createdAt: insertedData.created_at,
        analysisType: insertedData.analysis_type,
      };

      setSavedDashboards(prev => [newDash, ...prev]);
      setActiveDashboard(newDash);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── Active dashboard view ──────────────────────────────────────────────────

  if (activeDashboard && activeDashboard.result) {
    return (
      <div style={{ display: 'flex', height: 'calc(100vh - 81px)', background: '#080808' }}>
        <div style={{ display: 'none' }} className="lg-sidebar-placeholder" />
        <style>{`.lg-sidebar-placeholder { display: none; } @media(min-width:1024px){.lg-sidebar-placeholder{display:flex;} .dash-sidebar{display:flex !important;}}`}</style>
        <div className="dash-sidebar" style={{ display: 'none', flexShrink: 0 }}>
          <Sidebar
            savedDashboards={savedDashboards}
            activeDashboard={activeDashboard}
            onOpen={handleOpenDashboard}
            onRename={handleRenameDashboard}
            onDelete={handleDeleteDashboard}
            onNewAnalysis={() => setActiveDashboard(null)}
            style={{ width: '280px' }}
          />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <DashboardView
            dashboard={activeDashboard}
            onBack={() => setActiveDashboard(null)}
            onUpdateName={handleRenameDashboard}
            onUpdateDashboard={async (updatedDash) => {
              try {
                const { error } = await supabase
                  .from('saved_dashboards')
                  .update({
                    name: updatedDash.name,
                    csv_content: updatedDash.csvContent,
                    result: updatedDash.result,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', updatedDash.id);

                if (error) {
                  console.error('Error updating dashboard:', error);
                  alert('Failed to update dashboard: ' + error.message);
                  return;
                }

                setSavedDashboards(prev => prev.map(d => d.id === updatedDash.id ? updatedDash : d));
                setActiveDashboard(updatedDash);
              } catch (err) {
                console.error('Update error:', err);
              }
            }}
          />
        </div>
      </div>
    );
  }

  // ── Main two-column layout ─────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .da-layout { display: flex; height: calc(100vh - 81px); background: #080808; }
        .da-sidebar { width: 320px; flex-shrink: 0; }
        .da-main { flex: 1; overflow-y: auto; }
        @media (max-width: 767px) {
          .da-layout { flex-direction: column; height: auto; min-height: calc(100vh - 81px); }
          .da-sidebar { width: 100%; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08); max-height: 260px; overflow-y: auto; overflow-x: hidden; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .da-sidebar { width: 260px; }
        }
        .sidebar-closed { width: 64px !important; }
        @media (max-width: 767px) {
          .sidebar-closed { 
            width: 100% !important; height: 60px !important; 
            flex-direction: row !important; justify-content: flex-start !important; padding: 0 16px !important;
            border-bottom: 1px solid rgba(255,255,255,0.08) !important; max-height: none !important;
          }
        }
        .da-browse-btn:hover { border-color: #d4f000 !important; color: #d4f000 !important; }
        .da-type-btn:hover { border-color: rgba(255,255,255,0.2) !important; color: rgba(255,255,255,0.7) !important; }

      `}</style>
      <div className="da-layout">

        {/* LEFT: Saved Dashboards */}
        <Sidebar
          savedDashboards={savedDashboards}
          activeDashboard={activeDashboard}
          onOpen={handleOpenDashboard}
          onRename={handleRenameDashboard}
          onDelete={handleDeleteDashboard}
          onNewAnalysis={null}
          style={{}}
          className="da-sidebar"
        />

        {/* RIGHT: Data Analysis */}
        <main className="da-main">
          <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 32px' }}>

            {/* Heading */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
                marginBottom: '20px', padding: '6px 12px',
                border: '1px solid rgba(212,240,0,0.3)', color: ACCENT,
              }}>
                <BarChart2 size={12} /> Data Agent
              </div>
              <h1 style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-0.025em', color: '#fff', marginBottom: '12px', lineHeight: 1.05, margin: '0 0 12px' }}>
                Data Intelligence
              </h1>
              <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'rgba(255,255,255,0.4)', maxWidth: '480px', margin: 0 }}>
                Upload an Excel or CSV file. The AI will analyze your entire dataset and generate a comprehensive dashboard with charts, KPIs, and insights.
              </p>
            </div>

            {/* Upload */}
            {fileState.csvContent ? (
              <div style={{
                marginBottom: '32px', padding: '16px',
                border: '1px solid rgba(212,240,0,0.25)', background: 'rgba(212,240,0,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={18} style={{ color: ACCENT, flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff', margin: 0 }}>{fileState.fileName}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px', marginBottom: 0 }}>{fileState.fileSize} · Ready for analysis</p>
                  </div>
                </div>
                <button
                  onClick={clearFile}
                  style={{ padding: '6px', color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#f87171'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  display: 'block', marginBottom: '32px', padding: '48px 32px', textAlign: 'center', cursor: 'pointer',
                  border: isDragging ? `1.5px dashed ${ACCENT}` : '1.5px dashed rgba(255,255,255,0.12)',
                  background: isDragging ? 'rgba(212,240,0,0.04)' : 'rgba(255,255,255,0.01)',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  ref={fileInputRef} type="file" style={{ display: 'none' }}
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => { if (e.target.files[0]) processFile(e.target.files[0]); }}
                />
                <UploadCloud size={32} style={{ display: 'block', margin: '0 auto 16px', color: isDragging ? ACCENT : 'rgba(255,255,255,0.2)' }} />
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Drag &amp; drop your file here</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '20px' }}>or</p>
                <span
                  className="da-browse-btn"
                  style={{
                    display: 'inline-block', padding: '10px 20px',
                    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                    border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', transition: 'all 0.15s',
                  }}
                >
                  Browse Files
                </span>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '16px' }}>Supports .csv, .xlsx — up to 10 MB</p>
              </label>
            )}

            {/* Analysis Type */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>
                Analysis Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {ANALYSIS_TYPES.map(({ id, label, icon: Icon }) => {
                  const selected = analysisType === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setAnalysisType(id)}
                      className={!selected ? 'da-type-btn' : ''}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 12px', fontSize: '12px', fontWeight: 600, textAlign: 'left',
                        border: `1px solid ${selected ? ACCENT : 'rgba(255,255,255,0.08)'}`,
                        background: selected ? 'rgba(212,240,0,0.07)' : 'transparent',
                        color: selected ? ACCENT : 'rgba(255,255,255,0.45)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <Icon size={13} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>
                What would you like to know about your data?
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Show me a breakdown of revenue by product category, highlight top performers…"
                rows={4}
                style={{
                  width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: '14px', padding: '16px', outline: 'none', resize: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(212,240,0,0.5)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>
                Optional — leave blank and the AI will auto-discover the most important trends.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', fontSize: '14px', fontWeight: 500,
                border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.06)', color: '#f87171',
              }}>
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={analyzeData}
              disabled={loading || !fileState.csvContent}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                padding: '16px', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em',
                background: (loading || !fileState.csvContent) ? 'rgba(255,255,255,0.06)' : ACCENT,
                color: (loading || !fileState.csvContent) ? 'rgba(255,255,255,0.2)' : '#080808',
                border: 'none', cursor: (loading || !fileState.csvContent) ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => { if (!loading && fileState.csvContent) e.currentTarget.style.background = '#b8d000'; }}
              onMouseOut={(e) => { if (!loading && fileState.csvContent) e.currentTarget.style.background = ACCENT; }}
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={18} /> Analyzing dataset…</>
              ) : (
                <>Generate Dashboard <ChevronRight size={16} /></>
              )}
            </button>

            {loading && (
              <p className="animate-pulse" style={{ fontSize: '12px', textAlign: 'center', marginTop: '16px', color: 'rgba(255,255,255,0.25)' }}>
                The AI is crunching your numbers — this usually takes 10–30 seconds.
              </p>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
