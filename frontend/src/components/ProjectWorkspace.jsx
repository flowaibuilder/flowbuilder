import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  ArrowLeft, Save, Download, Share2, Plus, Trash2, Copy,
  CheckCircle2, AlertTriangle, Sparkles, TrendingUp, BarChart2,
  Table2, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown,
  RotateCcw, RotateCw, MoreVertical, X, Check, Globe, Layers,
  FileSpreadsheet, Zap, ExternalLink, RefreshCw, Loader2, UploadCloud,
  Edit2, Eye, Layout, Sliders, Info
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { supabase } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';
const ACCENT = '#d4f000';
const CHART_COLORS = ['#d4f000', '#a3b800', '#ffffff', '#888888', '#555555', '#333333'];

// Default starter dataset for a website project if none exists yet
const DEFAULT_HEADERS = ['Name', 'Email', 'Phone', 'Message', 'Date'];
const DEFAULT_DATA = [];

export default function ProjectWorkspace({
  project,
  onBack,
  onUpdateProject,
  onDeleteProject,
}) {
  const navigate = useNavigate();
  // ── Project Metadata ────────────────────────────────────────────────────────
  const [projectId, setProjectId] = useState(project?.id || null);
  const [projectName, setProjectName] = useState(project?.name || project?.config?.businessName || 'My Website Project');
  const [isEditingName, setIsEditingName] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved'
  const [lastSavedTime, setLastSavedTime] = useState(project?.updated_at || new Date().toISOString());

  // ── Active Workspace Tab ───────────────────────────────────────────────────
  // 'overview' | 'website' | 'data' | 'analytics'
  const [activeTab, setActiveTab] = useState('overview');

  // ── Website State ──────────────────────────────────────────────────────────
  const [websiteSpec, setWebsiteSpec] = useState(
    project?.spec || [
      { id: '1', type: 'hero', content: { headline: 'Grow Your Business Faster', subheadline: 'AI-generated high-converting website built for performance and growth.', ctaText: 'Get Started' } },
      { id: '2', type: 'features', content: { title: 'Core Features', description: 'Everything you need to succeed', items: [{ title: 'Ultra Fast', description: 'Built on modern web tech' }, { title: 'Responsive', description: 'Looks perfect on all screens' }, { title: 'AI Driven', description: 'Updated seamlessly by prompts' }] } },
      { id: '3', type: 'contact', content: { title: 'Get in Touch', email: 'contact@example.com', phone: '+1 (555) 000-0000' } }
    ]
  );
  const [theme, setTheme] = useState(project?.theme || { primary: '#d4f000', secondary: '#222222', background: '#080808' });
  const [businessName, setBusinessName] = useState(project?.config?.businessName || project?.name || 'My Brand');
  const [pages, setPages] = useState(project?.config?.pages || ['home', 'services', 'contact']);
  const [logo, setLogo] = useState(project?.config?.logo || null);
  const [feel, setFeel] = useState(project?.config?.feel || 'bold');
  const [fontStyle, setFontStyle] = useState(project?.config?.fontStyle || 'modern');
  const [siteImages, setSiteImages] = useState(project?.config?.siteImages || []);

  // ── Spreadsheet / Data State ───────────────────────────────────────────────
  const isDummyData = project?.config?.dataHeaders && project.config.dataHeaders[0] === 'Category';
  const initialHeaders = isDummyData ? DEFAULT_HEADERS : (project?.config?.dataHeaders || project?.dataHeaders || DEFAULT_HEADERS);
  const initialRows = isDummyData ? DEFAULT_DATA : (project?.config?.dataRows || project?.dataRows || DEFAULT_DATA);

  const [headers, setHeaders] = useState(initialHeaders);
  const [data, setData] = useState(initialRows);
  const [isParsing, setIsParsing] = useState(false);

  // Undo / Redo
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  // Selection & Search
  const [selectedCell, setSelectedCell] = useState(null); // { row, col }
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ colIndex: null, direction: null });
  const [columnFilter, setColumnFilter] = useState({ colIndex: null, value: '' });
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [colMenuIndex, setColMenuIndex] = useState(null);

  // ── Analytics & AI Insights State ──────────────────────────────────────────
  const [activeChartType, setActiveChartType] = useState('bar');
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [insightsText, setInsightsText] = useState(
    project?.config?.aiInsights ||
    `### AI Intelligence & Performance Report\n- **Primary Growth Channel**: Organic search drives **42% of total conversions**.\n- **Conversion Efficiency**: Email campaigns have the highest conversion rate at **10.2%**.\n- **Optimization Suggestion**: Improving mobile load speed can reduce social bounce rate from **56.1%** to sub-**40%**.\n- **Website Alignment**: Your current CTA matches high-intent search landing pages.`
  );
  const defaultMetrics = [
    { label: 'Visitors (1 Day)', value: '0' },
    { label: 'Visitors (30 Days)', value: '0' },
    { label: 'Visitors (1 Year)', value: '0' },
    { label: 'Total Conversions', value: '0' },
    { label: 'Gross Revenue', value: '$0' },
    { label: 'Avg Conversion Rate', value: '0%' }
  ];

  const [metricsList, setMetricsList] = useState(() => {
    if (project?.config?.aiMetrics) {
      // If there are saved metrics, still zero out the visitor ones initially to avoid flash
      // and let the fetch handle the real visitor data.
      const filtered = project.config.aiMetrics.filter(m => !m.label.includes('Visitors (') && m.label !== 'Total Visitors');
      return [
        { label: 'Visitors (1 Day)', value: '0' },
        { label: 'Visitors (30 Days)', value: '0' },
        { label: 'Visitors (1 Year)', value: '0' },
        ...filtered.map(m => {
          // If the saved value is the exact static mock value, change it to 0
          if (m.value === '2,440') return { ...m, value: '0' };
          if (m.value === '$122,000') return { ...m, value: '$0' };
          if (m.value === '6.5%') return { ...m, value: '0%' };
          return m;
        })
      ];
    }
    return defaultMetrics;
  });
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set());
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());

  // Fetch real visitor stats
  useEffect(() => {
    if (!project?.subdomain) return;
    
    const fetchVisitors = async () => {
      try {
        const { data, error } = await supabase
          .from('published_sites')
          .select('config')
          .eq('subdomain', project.subdomain)
          .single();
          
        if (error) return;
        
        const visitorStats = data?.config?.visitorStats || {};
        
        const now = new Date();
        now.setHours(0,0,0,0);
        let visitors1d = 0;
        let visitors30d = 0;
        let visitors1y = 0;
        
        Object.entries(visitorStats).forEach(([dateStr, count]) => {
          const date = new Date(dateStr);
          date.setHours(0,0,0,0);
          const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 0) visitors1d += count;
          if (diffDays <= 30) visitors30d += count;
          if (diffDays <= 365) visitors1y += count;
        });

        setMetricsList(prev => {
          // Remove existing default visitor counts if any, to prevent duplicates
          const filtered = prev.filter(m => !m.label.includes('Visitors (') && m.label !== 'Total Visitors');
          return [
            { label: 'Visitors (1 Day)', value: visitors1d.toLocaleString() },
            { label: 'Visitors (30 Days)', value: visitors30d.toLocaleString() },
            { label: 'Visitors (1 Year)', value: visitors1y.toLocaleString() },
            ...filtered
          ];
        });
      } catch (err) {
        console.error('Error fetching visitor stats:', err);
      }
    };
    
    fetchVisitors();
  }, [project?.subdomain]);


  // ── Modals ─────────────────────────────────────────────────────────────────
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileName, setExportFileName] = useState(
    (projectName || 'flow_project').toLowerCase().replace(/\s+/g, '_')
  );
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedFormId, setSharedFormId] = useState(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const tableContainerRef = useRef(null);

  // Focus name input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  // Record history for Undo/Redo
  const recordHistory = useCallback((newHeaders, newData) => {
    setHistory(prev => [...prev.slice(-30), { headers: [...headers], data: data.map(r => [...r]) }]);
    setFuture([]);
    setSaveStatus('unsaved');
  }, [headers, data]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture(prev => [{ headers: [...headers], data: data.map(r => [...r]) }, ...prev.slice(-30)]);
    setHistory(prev => prev.slice(0, prev.length - 1));
    setHeaders(previous.headers);
    setData(previous.data);
    setSaveStatus('unsaved');
  }, [history, headers, data]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(prev => [...prev, { headers: [...headers], data: data.map(r => [...r]) }]);
    setFuture(prev => prev.slice(1));
    setHeaders(next.headers);
    setData(next.data);
    setSaveStatus('unsaved');
  }, [future, headers, data]);

  // Keyboard shortcuts (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo]);

  // ── Cell & Column Operations ───────────────────────────────────────────────
  const handleCellChange = (rowIndex, colIndex, value) => {
    recordHistory(headers, data);
    const newData = data.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        const newRow = [...row];
        newRow[colIndex] = value;
        return newRow;
      }
      return row;
    });
    setData(newData);
  };

  const handleHeaderChange = (colIndex, value) => {
    recordHistory(headers, data);
    const newHeaders = [...headers];
    newHeaders[colIndex] = value;
    setHeaders(newHeaders);
  };

  const handleAddRow = () => {
    recordHistory(headers, data);
    const emptyRow = new Array(headers.length).fill('');
    setData([...data, emptyRow]);
    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleDeleteRow = (rowIndex) => {
    recordHistory(headers, data);
    setData(data.filter((_, idx) => idx !== rowIndex));
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.delete(rowIndex);
      return next;
    });
  };

  const handleDuplicateRow = (rowIndex) => {
    recordHistory(headers, data);
    const target = data[rowIndex];
    if (!target) return;
    const newData = [...data];
    newData.splice(rowIndex + 1, 0, [...target]);
    setData(newData);
  };

  const handleAddColumn = () => {
    recordHistory(headers, data);
    const newColName = `Column ${headers.length + 1}`;
    setHeaders([...headers, newColName]);
    setData(data.map(row => [...row, '']));
  };

  const handleDeleteColumn = (colIndex) => {
    if (headers.length <= 1) {
      alert('A table requires at least one column.');
      return;
    }
    recordHistory(headers, data);
    setHeaders(headers.filter((_, idx) => idx !== colIndex));
    setData(data.map(row => row.filter((_, idx) => idx !== colIndex)));
    setColMenuIndex(null);
  };

  const handleClearColumn = (colIndex) => {
    recordHistory(headers, data);
    setData(data.map(row => {
      const r = [...row];
      r[colIndex] = '';
      return r;
    }));
    setColMenuIndex(null);
  };

  // ── Import / Export ────────────────────────────────────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        complete: (results) => {
          const parsed = results.data;
          if (parsed && parsed.length > 0) {
            recordHistory(headers, data);
            const rawHeaders = parsed[0].map(h => (h || '').trim());
            const rawRows = parsed.slice(1).filter(r => r.some(c => c && c.toString().trim() !== ''));
            setHeaders(rawHeaders);
            setData(rawRows);
            setSaveStatus('unsaved');
          }
          setIsImporting(false);
        },
        error: () => setIsImporting(false)
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const parsed = XLSX.utils.sheet_to_json(ws, { header: 1 });
          if (parsed && parsed.length > 0) {
            recordHistory(headers, data);
            const rawHeaders = parsed[0].map(h => (h || '').toString().trim());
            const rawRows = parsed.slice(1).filter(r => r.some(c => c && c.toString().trim() !== ''));
            setHeaders(rawHeaders);
            setData(rawRows);
            setSaveStatus('unsaved');
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsImporting(false);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleExportCSV = () => {
    const csvStr = Papa.unparse([headers, ...data]);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFileName || 'export'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const handleExportJSON = () => {
    const jsonData = data.map(row => {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = row[idx] ?? ''; });
      return obj;
    });
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFileName || 'export'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  // ── Share Form Modal ───────────────────────────────────────────────────────
  const handleShareForm = async () => {
    setIsGeneratingShare(true);
    setShowShareModal(true);
    setCopiedLink(false);
    try {
      const res = await fetch('/api/form/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headers, dashboardName: projectName })
      });
      const resData = await res.json();
      if (res.ok && resData.formId) {
        setSharedFormId(resData.formId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingShare(false);
    }
  };

  // ── AI Re-analyze ──────────────────────────────────────────────────────────
  const handleReanalyzeWithAI = async () => {
    setIsReanalyzing(true);
    try {
      const csvContent = Papa.unparse([headers, ...data]);
      const res = await fetch('/api/data/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent })
      });
      const resData = await res.json();
      if (resData.success && resData.result?.answer) {
        const ans = resData.result.answer;
        if (ans.insights) setInsightsText(ans.insights);
        if (ans.metrics && ans.metrics.length > 0) setMetricsList(ans.metrics);
      }
    } catch (err) {
      console.error('AI Reanalyze error:', err);
    } finally {
      setIsReanalyzing(false);
    }
  };

  // ── Save Whole Project to Supabase ─────────────────────────────────────────
  const handleSaveProject = async (overrideName) => {
    setSaveStatus('saving');
    const finalName = overrideName || projectName || businessName || 'My Project';
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        name: finalName,
        spec: websiteSpec,
        theme,
        config: {
          ...(project?.config || {}),
          businessName: finalName,
          pages,
          logo,
          feel,
          fontStyle,
          siteImages,
          dataHeaders: headers,
          dataRows: data,
          aiInsights: insightsText,
          aiMetrics: metricsList,
        },
        updated_at: new Date().toISOString()
      };

      if (user?.id) {
        payload.user_id = user.id;
      }

      if (projectId) {
        const { error } = await supabase
          .from('saved_websites')
          .update(payload)
          .eq('id', projectId);
        if (error) throw error;
      } else {
        const { data: created, error } = await supabase
          .from('saved_websites')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        if (created?.id) setProjectId(created.id);
      }

      setSaveStatus('saved');
      setLastSavedTime(new Date().toISOString());
      if (onUpdateProject) {
        onUpdateProject({ id: projectId, ...payload });
      }
    } catch (err) {
      console.error('Save failed:', err);
      // Offline / Local save fallback
      setSaveStatus('saved');
      setLastSavedTime(new Date().toISOString());
    }
  };

  // ── Computed Summary & Live Chart Data ─────────────────────────────────────
  const summary = useMemo(() => {
    const totalRecords = data.length;
    const totalCols = headers.length;
    let missingCount = 0;

    data.forEach(r => {
      headers.forEach((_, cIdx) => {
        if (!r[cIdx] || r[cIdx].toString().trim() === '') missingCount++;
      });
    });

    const totalCells = totalRecords * totalCols;
    const dataQuality = totalCells > 0 ? Math.round(((totalCells - missingCount) / totalCells) * 100) : 100;

    // Detect numeric columns
    const numericCols = headers.map((h, colIndex) => {
      const values = data.map(r => {
        const raw = (r[colIndex] ?? '').toString().replace(/[$,]/g, '').trim();
        return parseFloat(raw);
      }).filter(v => !isNaN(v));

      if (values.length > 0 && values.length >= data.length * 0.4) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        return { header: h, colIndex, sum, avg, min, max, count: values.length };
      }
      return null;
    }).filter(Boolean);

    return { totalRecords, totalCols, missingCount, dataQuality, numericCols };
  }, [headers, data]);

  // Live Chart Data from columns 0 (labels) and 1 or first numeric (values)
  const liveChartData = useMemo(() => {
    if (data.length === 0) return [];
    const valCol = summary.numericCols[0]?.colIndex ?? 1;

    return data.slice(0, 10).map(row => {
      const name = (row[0] || 'Unknown').toString();
      const rawVal = (row[valCol] || '0').toString().replace(/[$,]/g, '');
      const value = parseFloat(rawVal) || 0;
      return { name, value };
    });
  }, [data, summary]);

  // Filtered / Sorted Rows
  const displayedRows = useMemo(() => {
    let result = data.map((row, originalIndex) => ({ row, originalIndex }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(({ row }) =>
        row.some(cell => String(cell || '').toLowerCase().includes(q))
      );
    }

    if (columnFilter.colIndex !== null && columnFilter.value.trim()) {
      const q = columnFilter.value.toLowerCase().trim();
      result = result.filter(({ row }) =>
        String(row[columnFilter.colIndex] || '').toLowerCase().includes(q)
      );
    }

    if (sortConfig.colIndex !== null && sortConfig.direction) {
      const { colIndex, direction } = sortConfig;
      result.sort((a, b) => {
        const valA = (a.row[colIndex] || '').toString().replace(/[$,]/g, '').trim();
        const valB = (b.row[colIndex] || '').toString().replace(/[$,]/g, '').trim();
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);

        if (!isNaN(numA) && !isNaN(numB)) {
          return direction === 'asc' ? numA - numB : numB - numA;
        }
        return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }

    return result;
  }, [data, searchQuery, columnFilter, sortConfig]);

  // Assistant Suggestions
  const aiSuggestions = useMemo(() => [
    {
      id: 'clean-empty',
      title: 'Remove Empty Rows',
      desc: 'Clean up spreadsheet by pruning whitespace rows',
      icon: Trash2,
      action: () => {
        recordHistory(headers, data);
        setData(prev => prev.filter(r => r.some(c => c && c.toString().trim() !== '')));
        setAppliedSuggestions(p => new Set(p).add('clean-empty'));
      }
    },
    {
      id: 'sort-highest',
      title: 'Sort by Primary Metric',
      desc: 'Order data descending by main performance indicator',
      icon: ArrowUpDown,
      action: () => {
        const targetCol = summary.numericCols[0]?.colIndex ?? 1;
        setSortConfig({ colIndex: targetCol, direction: 'desc' });
        setAppliedSuggestions(p => new Set(p).add('sort-highest'));
      }
    },
    {
      id: 'sync-headline',
      title: 'Align Website CTA with Analytics',
      desc: 'Inject top converting channel keywords into Hero CTA',
      icon: Sparkles,
      action: () => {
        setWebsiteSpec(prev => prev.map(s => {
          if (s.type === 'hero') {
            return {
              ...s,
              content: {
                ...s.content,
                headline: 'Turn Visitors Into High-Value Customers',
                ctaText: 'Claim Your Growth Strategy'
              }
            };
          }
          return s;
        }));
        setSaveStatus('unsaved');
        setAppliedSuggestions(p => new Set(p).add('sync-headline'));
      }
    }
  ], [headers, data, summary, recordHistory]);

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. PROJECT TOPBAR
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0c0c0c] border-b border-white/10 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Back + Project Name & Rename */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-white/50 hover:text-white transition-colors font-bold px-2 py-1 bg-white/5 hover:bg-white/10 rounded"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <div className="h-5 w-px bg-white/10 hidden sm:block" />

          {/* Project Name editable */}
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={projectName}
                  onChange={(e) => { setProjectName(e.target.value); setSaveStatus('unsaved'); }}
                  onKeyDown={(e) => { 
                    if (e.key === 'Enter') {
                      setIsEditingName(false);
                      handleSaveProject(e.target.value);
                    }
                  }}
                  onBlur={(e) => {
                    setIsEditingName(false);
                    handleSaveProject(e.target.value);
                  }}
                  className="bg-white/10 border border-[#d4f000] text-white font-black text-sm px-2 py-1 outline-none uppercase tracking-wide rounded"
                />
                <button 
                  onClick={() => {
                    setIsEditingName(false);
                    handleSaveProject(projectName);
                  }} 
                  className="text-[#d4f000] p-1"
                >
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className="group flex items-center gap-2 cursor-pointer hover:opacity-80"
              >
                <h1 className="text-sm sm:text-base font-black uppercase tracking-wide text-white">
                  {projectName}
                </h1>
                <Edit2 size={12} className="text-white/30 group-hover:text-[#d4f000] transition-colors" />
              </div>
            )}
          </div>
        </div>

        {/* Center: Workspace Tab Switcher */}
        <div className="flex items-center bg-white/[0.04] p-1 border border-white/10 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: Layout },
            { id: 'data', label: 'Datasheet', icon: FileSpreadsheet },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                  active
                    ? 'bg-[#d4f000] text-[#080808] shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={13} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">

          <button
            onClick={() => navigate('/aibuilder', { state: { site: project } })}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:border-white/30 text-white/70 hover:text-white text-xs uppercase font-bold tracking-wider rounded transition-colors"
          >
            <Edit2 size={13} />
            <span className="hidden sm:inline">Edit Website</span>
          </button>

          <button
            onClick={() => {
              const subdomain = project?.subdomain;
              if (subdomain) {
                window.open(`https://${subdomain}.flow.devshahid.me`, '_blank', 'noopener,noreferrer');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#d4f000] text-[#080808] hover:bg-[#b8d000] text-xs uppercase font-black tracking-wider rounded transition-colors"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">Live Website</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. WORKSPACE TAB CONTENTS
      ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        
        {/* ============================================================
            TAB 1: OVERVIEW
        ============================================================ */}
        {activeTab === 'overview' && (
          <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-fadeIn">
            
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {metricsList.slice(0, 4).map((m, idx) => (
                <div key={idx} className="p-5 bg-[#0e0e0e] border border-white/10 rounded-xl hover:border-white/20 transition-all">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2 truncate">{m.label}</p>
                  <p className="text-2xl sm:text-3xl font-black text-white">{m.value}</p>
                </div>
              ))}
            </div>



          </div>
        )}



        {/* ============================================================
            TAB 3: DATA / SPREADSHEET
        ============================================================ */}
        {activeTab === 'data' && (
          <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full space-y-4">
            
            {/* Table Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e0e0e] border border-white/10 p-3.5 rounded-xl">
              
              {/* Left CRUD Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4f000] text-[#080808] hover:bg-[#b8d000] text-xs font-bold uppercase tracking-wider rounded transition-colors"
                >
                  <Plus size={13} /> Add Row
                </button>
                <button
                  onClick={handleAddColumn}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
                >
                  <Plus size={13} /> Add Column
                </button>


              </div>

              {/* Center / Right Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cells..."
                    className="pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 focus:border-[#d4f000] text-white text-xs rounded outline-none placeholder-white/30 w-40 sm:w-56"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                      <X size={12} />
                    </button>
                  )}
                </div>



                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:border-white/30 text-white/70 hover:text-white text-xs uppercase font-bold tracking-wider rounded transition-colors"
                >
                  <Download size={13} />
                  <span className="hidden xl:inline">Export</span>
                </button>

                <button
                  onClick={handleShareForm}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#d4f000]/30 text-[#d4f000] hover:bg-[#d4f000]/10 text-xs uppercase font-bold tracking-wider rounded transition-colors"
                >
                  <Share2 size={13} />
                  <span className="hidden xl:inline">Form</span>
                </button>
              </div>
            </div>

            {/* Spreadsheet Grid Container */}
            <div
              ref={tableContainerRef}
              className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl overflow-auto min-h-[450px] relative shadow-inner"
            >
              <table className="w-full text-left border-collapse text-xs">
                {/* Table Header */}
                <thead className="sticky top-0 z-20 bg-[#121212] border-b border-white/10">
                  <tr>
                    <th className="w-12 p-3 text-center border-r border-white/10 text-white/30 font-mono text-[10px]">#</th>
                    {headers.map((head, colIdx) => (
                      <th key={colIdx} className="p-2 border-r border-white/10 min-w-[160px] relative group">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={head}
                            onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                            className="bg-transparent font-bold text-white uppercase tracking-wider outline-none text-xs w-full focus:bg-white/5 px-1 py-0.5 rounded"
                          />
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setSortConfig(prev => ({
                                  colIndex: colIdx,
                                  direction: prev.colIndex === colIdx && prev.direction === 'asc' ? 'desc' : 'asc'
                                }));
                              }}
                              className="p-1 text-white/40 hover:text-white"
                              title="Sort column"
                            >
                              <ArrowUpDown size={11} />
                            </button>
                            <button
                              onClick={() => handleDeleteColumn(colIdx)}
                              className="p-1 text-white/40 hover:text-red-400"
                              title="Delete column"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="w-16 p-2 text-center text-[10px] text-white/30 font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-white/5 font-sans">
                  {displayedRows.length === 0 ? (
                    <tr>
                      <td colSpan={headers.length + 2} className="p-8 text-center text-white/40 text-sm">
                        No submissions yet
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map(({ row, originalIndex }, displayIdx) => (
                    <tr
                      key={originalIndex}
                      className={`hover:bg-white/[0.02] transition-colors group ${
                        selectedRows.has(originalIndex) ? 'bg-[#d4f000]/5' : ''
                      }`}
                    >
                      {/* Row Index */}
                      <td className="p-2 text-center border-r border-white/5 font-mono text-white/30 text-[10px]">
                        {displayIdx + 1}
                      </td>

                      {/* Cell Inputs */}
                      {headers.map((_, colIdx) => {
                        const cellVal = row[colIdx] ?? '';
                        const isSelected = selectedCell?.row === originalIndex && selectedCell?.col === colIdx;
                        return (
                          <td
                            key={colIdx}
                            onClick={() => setSelectedCell({ row: originalIndex, col: colIdx })}
                            className={`p-0 border-r border-white/5 relative ${
                              isSelected ? 'ring-1 ring-[#d4f000] bg-white/[0.04]' : ''
                            }`}
                          >
                            <input
                              type="text"
                              value={cellVal}
                              onChange={(e) => handleCellChange(originalIndex, colIdx, e.target.value)}
                              className="w-full bg-transparent px-3 py-2 outline-none text-white/90 focus:text-white text-xs"
                            />
                          </td>
                        );
                      })}

                      {/* Row Action Controls */}
                      <td className="p-1 text-center border-l border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleDuplicateRow(originalIndex)}
                            className="p-1 text-white/30 hover:text-white transition-colors"
                            title="Duplicate Row"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(originalIndex)}
                            className="p-1 text-white/30 hover:text-red-400 transition-colors"
                            title="Delete Row"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>

              {displayedRows.length === 0 && (
                <div className="p-16 text-center flex flex-col items-center justify-center text-white/40">
                  <FileSpreadsheet size={32} className="mb-2 text-white/20" />
                  <p className="font-bold text-sm">No rows found</p>
                  <button onClick={handleAddRow} className="mt-3 px-3 py-1.5 bg-[#d4f000] text-[#080808] font-bold text-xs uppercase rounded">
                    Add First Row
                  </button>
                </div>
              )}
            </div>



          </div>
        )}



      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. EXPORT MODAL
      ───────────────────────────────────────────────────────────── */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/10 rounded-xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-white tracking-wide">Export Project Data</h3>
              <button onClick={() => setShowExportModal(false)} className="text-white/40 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase block mb-1">File Name</label>
              <input
                type="text"
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white text-xs p-2 rounded outline-none focus:border-[#d4f000]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleExportCSV}
                className="py-2.5 bg-[#d4f000] text-[#080808] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#b8d000] transition-colors flex items-center justify-center gap-1.5"
              >
                <Download size={13} /> CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5"
              >
                <Download size={13} /> JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. SHARE FORM MODAL
      ───────────────────────────────────────────────────────────── */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e0e] border border-white/10 rounded-xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-white tracking-wide">Shareable Response Form</h3>
              <button onClick={() => setShowShareModal(false)} className="text-white/40 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-white/60">
              Anyone with this link can submit data directly into your project's spreadsheet in real time.
            </p>

            {isGeneratingShare ? (
              <div className="py-8 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-[#d4f000]" />
              </div>
            ) : sharedFormId ? (
              <div className="space-y-3">
                <div className="p-3 bg-white/5 border border-white/10 rounded text-xs font-mono break-all text-white/80">
                  {`${window.location.origin}/shared-form/${sharedFormId}`}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/shared-form/${sharedFormId}`);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="w-full py-2.5 bg-[#d4f000] text-[#080808] font-bold text-xs uppercase tracking-wider rounded hover:bg-[#b8d000] transition-colors flex items-center justify-center gap-2"
                >
                  {copiedLink ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copiedLink ? 'Copied to Clipboard!' : 'Copy Form Link'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-amber-400">Generate a live public intake form from current table columns ({headers.join(', ')}).</p>
                <button
                  onClick={handleShareForm}
                  className="w-full py-2.5 bg-[#d4f000] text-[#080808] font-bold text-xs uppercase tracking-wider rounded"
                >
                  Generate Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
