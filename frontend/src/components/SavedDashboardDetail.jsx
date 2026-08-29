import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import {
  ArrowLeft, Save, Download, Share2, RefreshCw, Plus, Trash2, Copy,
  CheckCircle2, AlertTriangle, Sparkles, TrendingUp, BarChart2,
  Table2, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown,
  RotateCcw, RotateCw, MoreVertical, X, Check, Eye, ChevronDown,
  Sliders, Zap, HelpCircle, FileSpreadsheet, Layers, Info
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import ReactMarkdown from 'react-markdown';

const ACCENT = '#d4f000';
const CHART_COLORS = ['#d4f000', '#a3b800', '#ffffff', '#888888', '#555555', '#333333'];

export default function SavedDashboardDetail({
  dashboard,
  onBack,
  onUpdateDashboard,
  onDeleteDashboard
}) {
  // --- Dashboard Meta State ---
  const [dashboardName, setDashboardName] = useState(dashboard?.name || 'Untitled Dashboard');
  const [isEditingName, setIsEditingName] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'
  const [lastSavedTime, setLastSavedTime] = useState(dashboard?.updatedAt || dashboard?.createdAt || new Date().toISOString());

  // --- Layout & View Mode ---
  const [viewTab, setViewTab] = useState('combined'); // 'combined', 'analytics', 'spreadsheet'
  const [activeChartType, setActiveChartType] = useState('bar'); // 'bar', 'area', 'pie'

  // --- Raw Data State (Spreadsheet) ---
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [isParsing, setIsParsing] = useState(true);

  // --- Selection & Focus ---
  const [selectedCell, setSelectedCell] = useState(null); // { row, col }
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [selectedCols, setSelectedCols] = useState(new Set());

  // --- Undo / Redo Stack ---
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  // --- Filter & Search ---
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ colIndex: null, direction: null }); // 'asc' | 'desc'
  const [columnFilter, setColumnFilter] = useState({ colIndex: null, value: '' });
  const [showFilterBar, setShowFilterBar] = useState(false);

  // --- AI Suggestions state ---
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set());
  const [appliedSuggestions, setAppliedSuggestions] = useState(new Set());

  // --- Modals & Reanalyze ---
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileName, setExportFileName] = useState(dashboard?.name?.toLowerCase().replace(/\s+/g, '_') || 'dashboard_export');
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedFormId, setSharedFormId] = useState(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [colMenuIndex, setColMenuIndex] = useState(null);

  const tableContainerRef = useRef(null);
  const nameInputRef = useRef(null);

  // 1. Initial Parse of CSV Content
  useEffect(() => {
    if (dashboard?.csvContent) {
      setIsParsing(true);
      Papa.parse(dashboard.csvContent, {
        complete: (results) => {
          const parsed = results.data;
          if (parsed && parsed.length > 0) {
            const rawHeaders = parsed[0].map(h => (h || '').trim());
            const rawRows = parsed.slice(1).filter(r => r.some(cell => cell && cell.toString().trim() !== ''));
            setHeaders(rawHeaders);
            setData(rawRows);
          }
          setIsParsing(false);
        },
        error: (err) => {
          console.error("Error parsing CSV:", err);
          setIsParsing(false);
        }
      });
    } else {
      setIsParsing(false);
    }
  }, [dashboard?.id]);

  // Push state to history before changing data
  const recordHistory = useCallback((newHeaders, newData) => {
    setHistory(prev => [...prev.slice(-30), { headers: [...headers], data: data.map(r => [...r]) }]);
    setFuture([]);
    setSaveStatus('unsaved');
  }, [headers, data]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFuture(prev => [{ headers: [...headers], data: data.map(r => [...r]) }, ...prev]);
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

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Escape') {
        setSelectedCell(null);
        setColMenuIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // --- CRUD Operations ---
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
      alert('A dashboard requires at least one column.');
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

  const handleClearSelected = () => {
    recordHistory(headers, data);
    if (selectedRows.size > 0) {
      setData(data.filter((_, idx) => !selectedRows.has(idx)));
      setSelectedRows(new Set());
    } else if (selectedCell) {
      handleCellChange(selectedCell.row, selectedCell.col, '');
    }
  };

  // --- Filtering & Sorting Compute ---
  const displayedRows = useMemo(() => {
    let result = data.map((row, originalIndex) => ({ row, originalIndex }));

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(({ row }) =>
        row.some(cell => String(cell || '').toLowerCase().includes(q))
      );
    }

    // Column Specific Filter
    if (columnFilter.colIndex !== null && columnFilter.value.trim()) {
      const q = columnFilter.value.toLowerCase().trim();
      result = result.filter(({ row }) =>
        String(row[columnFilter.colIndex] || '').toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortConfig.colIndex !== null && sortConfig.direction) {
      result.sort((a, b) => {
        const valA = a.row[sortConfig.colIndex] ?? '';
        const valB = b.row[sortConfig.colIndex] ?? '';
        const numA = parseFloat(String(valA).replace(/[^0-9.-]+/g, ''));
        const numB = parseFloat(String(valB).replace(/[^0-9.-]+/g, ''));

        if (!isNaN(numA) && !isNaN(numB)) {
          return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        }
        return sortConfig.direction === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [data, searchQuery, columnFilter, sortConfig]);

  const handleSort = (colIndex) => {
    setSortConfig(prev => {
      if (prev.colIndex === colIndex) {
        if (prev.direction === 'asc') return { colIndex, direction: 'desc' };
        return { colIndex: null, direction: null };
      }
      return { colIndex, direction: 'asc' };
    });
  };

  // --- Summary Metrics Computation ---
  const summary = useMemo(() => {
    const totalRecords = data.length;
    const totalCols = headers.length;
    let missingCount = 0;
    let numericSums = {};
    let numericCols = [];

    headers.forEach((h, colIdx) => {
      let isNum = true;
      let count = 0;
      let sum = 0;

      data.forEach(row => {
        const cell = row[colIdx];
        if (cell === undefined || cell === null || cell.toString().trim() === '') {
          missingCount++;
        } else {
          const num = parseFloat(String(cell).replace(/[$,]/g, ''));
          if (!isNaN(num)) {
            sum += num;
            count++;
          } else {
            isNum = false;
          }
        }
      });

      if (isNum && count > 0) {
        numericCols.push({ header: h, sum, avg: sum / count, count });
      }
    });

    const totalCells = totalRecords * (totalCols || 1);
    const dataQuality = totalCells > 0 ? Math.round(((totalCells - missingCount) / totalCells) * 100) : 100;

    return {
      totalRecords,
      totalCols,
      missingCount,
      dataQuality,
      numericCols
    };
  }, [headers, data]);

  // --- Dynamic Chart Data Derivation (for instant live visualization updates) ---
  const liveChartData = useMemo(() => {
    if (headers.length < 2 || data.length === 0) return [];
    // Pick first column as label, second (or first numeric) as value
    const labelColIdx = 0;
    let valColIdx = 1;
    for (let c = 1; c < headers.length; c++) {
      const sample = data[0]?.[c];
      if (!isNaN(parseFloat(sample))) {
        valColIdx = c;
        break;
      }
    }

    const map = {};
    data.slice(0, 15).forEach(row => {
      const label = row[labelColIdx] || 'Uncategorized';
      const num = parseFloat(String(row[valColIdx] || 0).replace(/[$,]/g, '')) || 0;
      map[label] = (map[label] || 0) + num;
    });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [headers, data]);

  // --- AI Suggestions (Actionable) ---
  const aiSuggestions = useMemo(() => {
    const suggestions = [];

    if (summary.missingCount > 0) {
      suggestions.push({
        id: 'fix_missing',
        type: 'quality',
        icon: AlertTriangle,
        title: 'Missing values detected',
        desc: `Found ${summary.missingCount} empty cells across your dataset.`,
        actionLabel: 'Fill empty cells with "-"',
        action: () => {
          recordHistory(headers, data);
          setData(data.map(row => row.map(cell => (cell === '' || cell === null || cell === undefined) ? '-' : cell)));
          setAppliedSuggestions(prev => new Set(prev).add('fix_missing'));
        }
      });
    }

    if (summary.numericCols.length > 0) {
      const topNum = summary.numericCols[0];
      suggestions.push({
        id: 'sort_top',
        type: 'insight',
        icon: TrendingUp,
        title: `Sort by ${topNum.header}`,
        desc: `Organize your records in descending order of highest ${topNum.header}.`,
        actionLabel: 'Sort Descending',
        action: () => {
          const colIdx = headers.indexOf(topNum.header);
          if (colIdx !== -1) setSortConfig({ colIndex: colIdx, direction: 'desc' });
          setAppliedSuggestions(prev => new Set(prev).add('sort_top'));
        }
      });
    }

    // Duplicate detection
    const rowStrings = data.map(r => JSON.stringify(r));
    const hasDups = new Set(rowStrings).size < rowStrings.length;
    if (hasDups) {
      suggestions.push({
        id: 'remove_dups',
        type: 'cleaning',
        icon: Zap,
        title: 'Duplicate rows found',
        desc: 'Identified redundant entries that might skew your metrics.',
        actionLabel: 'Remove Duplicates',
        action: () => {
          recordHistory(headers, data);
          const seen = new Set();
          const unique = [];
          data.forEach(r => {
            const key = JSON.stringify(r);
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(r);
            }
          });
          setData(unique);
          setAppliedSuggestions(prev => new Set(prev).add('remove_dups'));
        }
      });
    }

    suggestions.push({
      id: 'add_row_action',
      type: 'workflow',
      icon: Plus,
      title: 'Ready for new records',
      desc: 'Extend this dataset with additional transactional rows.',
      actionLabel: 'Add New Row',
      action: () => {
        handleAddRow();
        setAppliedSuggestions(prev => new Set(prev).add('add_row_action'));
      }
    });

    return suggestions;
  }, [summary, headers, data, recordHistory]);

  // --- Save / Persist Handler ---
  const handleSave = () => {
    setSaveStatus('saving');
    const updatedCsv = Papa.unparse([headers, ...data]);
    const now = new Date().toISOString();

    const updatedDashboard = {
      ...dashboard,
      name: dashboardName,
      csvContent: updatedCsv,
      updatedAt: now
    };

    if (onUpdateDashboard) {
      onUpdateDashboard(updatedDashboard);
    }

    setTimeout(() => {
      setSaveStatus('saved');
      setLastSavedTime(now);
    }, 400);
  };

  // Auto-save debounce
  useEffect(() => {
    if (saveStatus === 'unsaved') {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus, data, headers, dashboardName]);

  // --- Re-analyze with AI ---
  const handleReanalyzeWithAI = async () => {
    setIsReanalyzing(true);
    try {
      const currentCsv = Papa.unparse([headers, ...data]);
      const res = await fetch('/api/data/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: currentCsv, query: `Provide updated KPIs and deep insights for ${dashboardName}` })
      });
      const resData = await res.json();
      if (res.ok && resData.result) {
        onUpdateDashboard({
          ...dashboard,
          name: dashboardName,
          csvContent: currentCsv,
          result: resData.result,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Reanalyze error:', err);
    } finally {
      setIsReanalyzing(false);
    }
  };

  // --- Export CSV ---
  const confirmExport = () => {
    const filename = `${(exportFileName || 'export').trim()}.csv`;
    const csvStr = Papa.unparse([headers, ...data]);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  // --- Share Form ---
  const handleShareForm = async () => {
    setIsGeneratingShare(true);
    setShowShareModal(true);
    setCopiedLink(false);
    try {
      const res = await fetch('/api/form/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headers, dashboardName })
      });
      const json = await res.json();
      if (res.ok) {
        setSharedFormId(json.formId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingShare(false);
    }
  };

  if (isParsing) {
    return (
      <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-[#080808] text-white/40 font-sans">
        <RefreshCw className="animate-spin text-[#d4f000] mb-4" size={32} />
        <p className="text-xs uppercase tracking-widest font-bold">Loading dashboard spreadsheet & analytics...</p>
      </div>
    );
  }

  const aiResult = dashboard?.result?.answer || {};
  const metricsList = aiResult.metrics || [];
  const chartsList = aiResult.charts || [];
  const insightsText = aiResult.insights || '';

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#080808] text-white font-sans selection:bg-[#d4f000] selection:text-black">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP HEADER
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#080808] border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        
        {/* Left: Back + Flow Logo + Title + Status */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onBack}
            className="p-2 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors flex items-center justify-center shrink-0"
            title="Back to Saved Dashboards"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl font-normal text-white shrink-0" style={{ fontFamily: "'Pacifico', cursive" }}>
              flow
            </span>
            <span className="text-white/20 text-sm">/</span>

            {/* Editable Title */}
            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={dashboardName}
                onChange={(e) => {
                  setDashboardName(e.target.value);
                  setSaveStatus('unsaved');
                }}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingName(false);
                }}
                autoFocus
                className="bg-transparent text-lg font-bold text-white border-b border-[#d4f000] outline-none pb-0.5 max-w-[280px]"
              />
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className="group flex items-center gap-2 cursor-pointer"
                title="Click to rename"
              >
                <h1 className="text-lg font-bold text-white tracking-tight truncate max-w-[280px] sm:max-w-md">
                  {dashboardName}
                </h1>
                <span className="text-white/20 group-hover:text-[#d4f000] text-xs transition-colors">
                  ✎
                </span>
              </div>
            )}
          </div>

          {/* Status badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 border border-white/5 bg-white/[0.02] text-[11px] text-white/40">
            <div className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-yellow-400 animate-pulse' : saveStatus === 'unsaved' ? 'bg-orange-400' : 'bg-[#d4f000]'}`} />
            <span className="capitalize">{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'unsaved' ? 'Unsaved edits' : 'Saved'}</span>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* View Mode Switcher */}
          <div className="flex border border-white/10 text-[11px] font-bold uppercase tracking-wider">
            {[
              { id: 'combined', label: 'Overview & Table', icon: Layers },
              { id: 'analytics', label: 'Analytics Only', icon: BarChart2 },
              { id: 'spreadsheet', label: 'Spreadsheet Only', icon: Table2 },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 transition-colors ${
                    viewTab === tab.id
                      ? 'bg-[#d4f000] text-[#080808]'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={13} />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3 py-2 border border-white/10 text-white/70 hover:text-white hover:border-white/30 text-[11px] font-bold uppercase tracking-wider transition-colors"
          >
            {saveStatus === 'saving' ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Export Button */}
          <button
            onClick={() => {
              setExportFileName(dashboardName.toLowerCase().replace(/\s+/g, '_'));
              setShowExportModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 border border-white/10 text-white/70 hover:text-white hover:border-white/30 text-[11px] font-bold uppercase tracking-wider transition-colors"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Share Form Button */}
          <button
            onClick={handleShareForm}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#d4f000]/30 text-[#d4f000] hover:bg-[#d4f000]/10 text-[11px] font-bold uppercase tracking-wider transition-colors"
          >
            <Share2 size={13} />
            <span className="hidden md:inline">Share Form</span>
          </button>

          {/* Re-analyze Button */}
          <button
            onClick={handleReanalyzeWithAI}
            disabled={isReanalyzing}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#d4f000] text-[#080808] hover:bg-[#b8d000] text-[11px] font-black uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles size={13} className={isReanalyzing ? 'animate-spin' : ''} />
            <span>{isReanalyzing ? 'Analyzing...' : 'AI Re-analyze'}</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. DASHBOARD SUMMARY BAR (Top KPIs & Data Health)
      ───────────────────────────────────────────────────────────── */}
      {(viewTab === 'combined' || viewTab === 'analytics') && (
        <section className="border-b border-white/10 bg-[#0c0c0c] px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            
            {/* Total Records */}
            <div className="p-3.5 border border-white/5 bg-white/[0.01]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Total Records</p>
              <p className="text-xl font-black text-white">{summary.totalRecords.toLocaleString()}</p>
            </div>

            {/* Total Columns */}
            <div className="p-3.5 border border-white/5 bg-white/[0.01]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Columns</p>
              <p className="text-xl font-black text-white">{summary.totalCols}</p>
            </div>

            {/* Data Quality */}
            <div className="p-3.5 border border-white/5 bg-white/[0.01]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Data Completeness</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-black text-[#d4f000]">{summary.dataQuality}%</p>
                <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden hidden xl:block">
                  <div className="h-full bg-[#d4f000]" style={{ width: `${summary.dataQuality}%` }} />
                </div>
              </div>
            </div>

            {/* Missing Values */}
            <div className="p-3.5 border border-white/5 bg-white/[0.01]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Missing Cells</p>
              <p className={`text-xl font-black ${summary.missingCount > 0 ? 'text-amber-400' : 'text-white/60'}`}>
                {summary.missingCount}
              </p>
            </div>

            {/* Primary Numeric KPI 1 */}
            {summary.numericCols[0] && (
              <div className="p-3.5 border border-white/5 bg-white/[0.01]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 truncate" title={summary.numericCols[0].header}>
                  Total {summary.numericCols[0].header}
                </p>
                <p className="text-xl font-black text-white truncate">
                  {summary.numericCols[0].sum.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </p>
              </div>
            )}

            {/* Primary Numeric KPI 2 */}
            {summary.numericCols[1] ? (
              <div className="p-3.5 border border-white/5 bg-white/[0.01]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 truncate" title={summary.numericCols[1].header}>
                  Avg {summary.numericCols[1].header}
                </p>
                <p className="text-xl font-black text-[#d4f000] truncate">
                  {summary.numericCols[1].avg.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </p>
              </div>
            ) : (
              <div className="p-3.5 border border-white/5 bg-white/[0.01]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Last Updated</p>
                <p className="text-xs font-semibold text-white/70 mt-1">
                  {new Date(lastSavedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}

          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. ANALYTICS & AI INSIGHTS SECTION
      ───────────────────────────────────────────────────────────── */}
      {(viewTab === 'combined' || viewTab === 'analytics') && (
        <section className="px-6 py-6 border-b border-white/10 bg-[#080808] space-y-6">
          
          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border border-[#d4f000]/30 text-[#d4f000] flex items-center justify-center">
                <BarChart2 size={13} />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/80">
                Visual Analytics & Intelligence
              </h2>
            </div>

            {/* Chart Type Selector */}
            <div className="flex border border-white/10 text-[10px] font-bold uppercase tracking-wider">
              {['bar', 'area', 'pie'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveChartType(t)}
                  className={`px-3 py-1.5 transition-colors ${
                    activeChartType === t
                      ? 'bg-white/10 text-[#d4f000]'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Analytics Grid: Left Charts + Right AI Insights & Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Charts Area (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Main Live Visualization */}
              <div className="p-6 border border-white/10 bg-[#0a0a0a]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{headers[0] || 'Categories'}</span>
                      <span className="text-white/30 font-normal">vs</span>
                      <span className="text-[#d4f000]">{headers[1] || 'Values'}</span>
                    </h3>
                    <p className="text-[11px] text-white/40 mt-0.5">Live visualization updated dynamically from spreadsheet edits</p>
                  </div>
                </div>

                <div className="h-72 w-full">
                  {liveChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      {activeChartType === 'pie' ? (
                        <PieChart>
                          <Pie
                            data={liveChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={95}
                            paddingAngle={4}
                            dataKey="value"
                            nameKey="name"
                            stroke="none"
                          >
                            {liveChartData.map((_, index) => (
                              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: '#111',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: '#fff',
                              fontSize: '12px'
                            }}
                            itemStyle={{ color: ACCENT }}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }} iconType="circle" />
                        </PieChart>
                      ) : activeChartType === 'area' ? (
                        <AreaChart data={liveChartData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                          <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} dy={8} tick={{ fill: 'rgba(255,255,255,0.4)' }} />
                          <YAxis fontSize={10} tickLine={false} axisLine={false} dx={-5} tick={{ fill: 'rgba(255,255,255,0.4)' }} />
                          <Tooltip
                            contentStyle={{
                              background: '#111',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: '#fff',
                              fontSize: '12px'
                            }}
                            itemStyle={{ color: ACCENT }}
                          />
                          <Area type="monotone" dataKey="value" stroke={ACCENT} fill="rgba(212,240,0,0.15)" strokeWidth={2} />
                        </AreaChart>
                      ) : (
                        <BarChart data={liveChartData} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
                          <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} dy={8} tick={{ fill: 'rgba(255,255,255,0.4)' }} />
                          <YAxis fontSize={10} tickLine={false} axisLine={false} dx={-5} tick={{ fill: 'rgba(255,255,255,0.4)' }} />
                          <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                            contentStyle={{
                              background: '#111',
                              border: '1px solid rgba(255,255,255,0.1)',
                              color: '#fff',
                              fontSize: '12px'
                            }}
                            itemStyle={{ color: ACCENT }}
                          />
                          <Bar dataKey="value" fill={ACCENT} barSize={28} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-white/30 text-xs">
                      Enter records into the spreadsheet to preview charts.
                    </div>
                  )}
                </div>
              </div>

              {/* Secondary AI Metric Cards if available */}
              {metricsList.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {metricsList.slice(0, 3).map((metric, i) => (
                    <div key={i} className="p-4 border border-white/5 bg-[#0a0a0a]">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 truncate">{metric.label}</p>
                      <p className="text-lg font-black text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Insights & Assistant (5 cols on desktop) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* AI Insights Box */}
              <div className="p-6 border border-[#d4f000]/20 bg-[#d4f000]/[0.02]">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-6 h-6 border border-[#d4f000]/40 text-[#d4f000] flex items-center justify-center">
                    <Sparkles size={13} />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#d4f000]">
                    AI Insights & Observations
                  </h3>
                </div>

                <div className="text-xs leading-relaxed text-white/70 space-y-2 max-h-48 overflow-y-auto pr-2">
                  {insightsText ? (
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h4 className="text-sm font-bold text-white mt-2 mb-1">{children}</h4>,
                        h2: ({ children }) => <h5 className="text-xs font-bold text-white mt-2 mb-1">{children}</h5>,
                        p: ({ children }) => <p className="mb-2">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                        strong: ({ children }) => <strong className="text-[#d4f000] font-semibold">{children}</strong>
                      }}
                    >
                      {insightsText}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-white/40 italic">
                      Click "AI Re-analyze" to generate deep statistical interpretations, category breakdowns, and growth forecasts for this dataset.
                    </p>
                  )}
                </div>
              </div>

              {/* AI Assistant Suggestions */}
              <div className="p-5 border border-white/10 bg-[#0a0a0a]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap size={13} className="text-[#d4f000]" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white/80">
                      Flow Assistant Actions
                    </h3>
                  </div>
                  <span className="text-[10px] text-white/30 font-medium">One-click actions</span>
                </div>

                <div className="space-y-2.5">
                  {aiSuggestions.map(sug => {
                    const Icon = sug.icon;
                    const isApplied = appliedSuggestions.has(sug.id);
                    if (dismissedSuggestions.has(sug.id)) return null;

                    return (
                      <div
                        key={sug.id}
                        className="p-3 border border-white/5 bg-white/[0.01] hover:border-white/20 transition-all flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <Icon size={14} className="text-[#d4f000] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-white/90">{sug.title}</p>
                            <p className="text-[11px] text-white/40 mt-0.5 leading-tight">{sug.desc}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isApplied ? (
                            <span className="text-[10px] font-bold text-[#d4f000] flex items-center gap-1">
                              <Check size={12} /> Applied
                            </span>
                          ) : (
                            <button
                              onClick={sug.action}
                              className="px-2.5 py-1 bg-[#d4f000]/10 border border-[#d4f000]/30 text-[#d4f000] hover:bg-[#d4f000] hover:text-[#080808] text-[10px] font-bold uppercase tracking-wider transition-all"
                            >
                              {sug.actionLabel}
                            </button>
                          )}
                          <button
                            onClick={() => setDismissedSuggestions(prev => new Set(prev).add(sug.id))}
                            className="p-1 text-white/20 hover:text-white/60 transition-colors"
                            title="Dismiss"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. SPREADSHEET TOOLBAR & DATA TABLE
      ───────────────────────────────────────────────────────────── */}
      {(viewTab === 'combined' || viewTab === 'spreadsheet') && (
        <section className="flex-1 flex flex-col bg-[#080808] px-6 py-6 overflow-hidden">
          
          {/* Section Header & Title */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border border-white/20 text-white/70 flex items-center justify-center">
                <Table2 size={13} />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/80">
                Dataset Spreadsheet Workspace
              </h2>
              <span className="text-[11px] text-white/30 font-medium ml-2">
                ({displayedRows.length} of {data.length} rows showing)
              </span>
            </div>

            {/* Quick shortcuts / info */}
            <div className="hidden xl:flex items-center gap-4 text-[11px] text-white/30">
              <span><kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-white/50 text-[10px]">Ctrl+Z</kbd> Undo</span>
              <span><kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-white/50 text-[10px]">Ctrl+Y</kbd> Redo</span>
              <span>Click cells to edit directly</span>
            </div>
          </div>

          {/* ────────────────── TOOLBAR ────────────────── */}
          <div className="p-3 border border-white/10 bg-[#0c0c0c] flex flex-wrap items-center justify-between gap-3 mb-3">
            
            {/* Left Toolbar Controls */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Add Row */}
              <button
                onClick={handleAddRow}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-white/70 hover:text-white hover:border-white/30 text-[11px] font-bold uppercase tracking-wider transition-colors"
                title="Append a new empty row"
              >
                <Plus size={13} /> Add Row
              </button>

              {/* Add Column */}
              <button
                onClick={handleAddColumn}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 text-white/70 hover:text-white hover:border-white/30 text-[11px] font-bold uppercase tracking-wider transition-colors"
                title="Append a new column"
              >
                <Plus size={13} /> Add Column
              </button>

              <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />

              {/* Undo Button */}
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="p-1.5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 disabled:opacity-20 transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <RotateCcw size={13} />
              </button>

              {/* Redo Button */}
              <button
                onClick={handleRedo}
                disabled={future.length === 0}
                className="p-1.5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 disabled:opacity-20 transition-colors"
                title="Redo (Ctrl+Y)"
              >
                <RotateCw size={13} />
              </button>

              {/* Delete / Clear Selected */}
              {(selectedRows.size > 0 || selectedCell) && (
                <button
                  onClick={handleClearSelected}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-[11px] font-bold uppercase tracking-wider transition-colors ml-1"
                  title="Delete selected rows or clear cell"
                >
                  <Trash2 size={12} />
                  <span>Delete Selected ({selectedRows.size || 1})</span>
                </button>
              )}

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilterBar(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  showFilterBar || columnFilter.value
                    ? 'border-[#d4f000]/40 bg-[#d4f000]/10 text-[#d4f000]'
                    : 'border-white/10 text-white/60 hover:text-white'
                }`}
                title="Toggle column filter controls"
              >
                <Filter size={13} />
                <span>Filter</span>
              </button>

              {/* Clear Sort if active */}
              {sortConfig.colIndex !== null && (
                <button
                  onClick={() => setSortConfig({ colIndex: null, direction: null })}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-wider hover:text-white"
                >
                  <span>Sort: {headers[sortConfig.colIndex]} ({sortConfig.direction})</span>
                  <X size={11} />
                </button>
              )}
            </div>

            {/* Right Search Input */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search across all cells..."
                  className="w-full bg-[#080808] border border-white/10 pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/25 outline-none focus:border-[#d4f000] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Optional Column Filter Sub-bar */}
          {showFilterBar && (
            <div className="p-3 border border-white/10 bg-[#0a0a0a] flex flex-wrap items-center gap-3 mb-3 text-xs">
              <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">Filter by Column:</span>
              <select
                value={columnFilter.colIndex ?? ''}
                onChange={(e) => setColumnFilter(prev => ({ ...prev, colIndex: e.target.value === '' ? null : parseInt(e.target.value) }))}
                className="bg-[#111] border border-white/10 text-white text-xs px-2.5 py-1 outline-none"
              >
                <option value="">Select a column...</option>
                {headers.map((h, idx) => (
                  <option key={idx} value={idx}>{h}</option>
                ))}
              </select>

              {columnFilter.colIndex !== null && (
                <input
                  type="text"
                  value={columnFilter.value}
                  onChange={(e) => setColumnFilter(prev => ({ ...prev, value: e.target.value }))}
                  placeholder={`Filter values in ${headers[columnFilter.colIndex]}...`}
                  className="bg-[#111] border border-white/10 text-white text-xs px-3 py-1 outline-none flex-1 max-w-xs"
                />
              )}

              {(columnFilter.colIndex !== null || columnFilter.value) && (
                <button
                  onClick={() => setColumnFilter({ colIndex: null, value: '' })}
                  className="text-white/40 hover:text-white text-[11px] uppercase tracking-wider"
                >
                  Reset Filter
                </button>
              )}
            </div>
          )}

          {/* ────────────────── SPREADSHEET TABLE GRID ────────────────── */}
          <div
            ref={tableContainerRef}
            className="flex-1 overflow-auto border border-white/10 bg-[#0a0a0a] relative max-h-[600px] scroll-smooth"
          >
            <table className="w-full text-left border-collapse text-xs select-none">
              
              {/* Sticky Table Header */}
              <thead className="sticky top-0 z-30 bg-[#121212] border-b border-white/10 shadow-sm">
                <tr>
                  
                  {/* Select All Checkbox / Row # Corner */}
                  <th className="p-2.5 w-12 text-center border-r border-white/10 bg-[#141414] text-white/30 text-[10px] font-bold uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={displayedRows.length > 0 && selectedRows.size === displayedRows.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(displayedRows.map(r => r.originalIndex)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                      className="accent-[#d4f000] cursor-pointer"
                      title="Select All Rows"
                    />
                  </th>

                  {/* Column Headers */}
                  {headers.map((header, colIndex) => {
                    const isSorted = sortConfig.colIndex === colIndex;
                    const isColSelected = selectedCols.has(colIndex);

                    return (
                      <th
                        key={colIndex}
                        className={`p-0 border-r border-white/10 font-bold text-white/80 relative min-w-[150px] group/header ${
                          isColSelected ? 'bg-[#d4f000]/10' : 'hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center justify-between px-3 py-2">
                          
                          {/* Column Title Input */}
                          <input
                            type="text"
                            value={header}
                            onChange={(e) => handleHeaderChange(colIndex, e.target.value)}
                            className="bg-transparent font-bold text-white/90 text-xs outline-none border-b border-transparent focus:border-[#d4f000] w-full pr-6 truncate"
                            title="Click to rename column header"
                          />

                          {/* Sort Indicator / Trigger */}
                          <button
                            onClick={() => handleSort(colIndex)}
                            className="p-1 text-white/30 hover:text-[#d4f000] transition-colors shrink-0"
                            title={`Sort by ${header}`}
                          >
                            {isSorted ? (
                              sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-[#d4f000]" /> : <ArrowDown size={12} className="text-[#d4f000]" />
                            ) : (
                              <ArrowUpDown size={11} className="opacity-0 group-hover/header:opacity-100" />
                            )}
                          </button>

                          {/* Column Context Menu Trigger */}
                          <div className="relative">
                            <button
                              onClick={() => setColMenuIndex(colMenuIndex === colIndex ? null : colIndex)}
                              className="p-1 text-white/30 hover:text-white transition-colors opacity-0 group-hover/header:opacity-100"
                              title="Column Options"
                            >
                              <MoreVertical size={12} />
                            </button>

                            {colMenuIndex === colIndex && (
                              <div
                                className="absolute right-0 top-7 z-50 w-44 bg-[#111] border border-white/10 py-1 shadow-2xl text-[11px] font-medium"
                                onMouseLeave={() => setColMenuIndex(null)}
                              >
                                <button
                                  onClick={() => { handleSort(colIndex); setColMenuIndex(null); }}
                                  className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2 text-white/70 hover:text-white"
                                >
                                  <ArrowUp size={12} /> Sort Ascending
                                </button>
                                <button
                                  onClick={() => {
                                    setSortConfig({ colIndex, direction: 'desc' });
                                    setColMenuIndex(null);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2 text-white/70 hover:text-white"
                                >
                                  <ArrowDown size={12} /> Sort Descending
                                </button>
                                <button
                                  onClick={() => handleClearColumn(colIndex)}
                                  className="w-full text-left px-3 py-2 hover:bg-white/5 flex items-center gap-2 text-white/70 hover:text-white"
                                >
                                  <RotateCcw size={12} /> Clear Column Cells
                                </button>
                                <div className="border-t border-white/10 my-1" />
                                <button
                                  onClick={() => handleDeleteColumn(colIndex)}
                                  className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-400 flex items-center gap-2"
                                >
                                  <Trash2 size={12} /> Delete Column
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      </th>
                    );
                  })}

                  {/* Row Actions Header */}
                  <th className="p-2 w-16 text-center bg-[#141414] border-l border-white/10"></th>
                </tr>
              </thead>

              {/* Table Rows Body */}
              <tbody>
                {displayedRows.map(({ row, originalIndex }, displayIdx) => {
                  const isRowSelected = selectedRows.has(originalIndex);

                  return (
                    <tr
                      key={originalIndex}
                      className={`border-b border-white/5 group transition-colors ${
                        isRowSelected ? 'bg-[#d4f000]/[0.06]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      {/* Row Checkbox & Number */}
                      <td className="p-2 text-center border-r border-white/10 bg-[#0d0d0d] text-white/30 text-[11px] font-mono select-none">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="checkbox"
                            checked={isRowSelected}
                            onChange={(e) => {
                              setSelectedRows(prev => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(originalIndex);
                                else next.delete(originalIndex);
                                return next;
                              });
                            }}
                            className="accent-[#d4f000] cursor-pointer"
                          />
                          <span>{displayIdx + 1}</span>
                        </div>
                      </td>

                      {/* Cell Inputs */}
                      {headers.map((_, colIndex) => {
                        const cellVal = row[colIndex] ?? '';
                        const isCellSelected = selectedCell?.row === originalIndex && selectedCell?.col === colIndex;

                        return (
                          <td
                            key={colIndex}
                            onClick={() => setSelectedCell({ row: originalIndex, col: colIndex })}
                            className={`p-0 border-r border-white/5 relative ${
                              isCellSelected ? 'ring-1 ring-[#d4f000] bg-white/[0.04]' : ''
                            }`}
                          >
                            <input
                              type="text"
                              value={cellVal}
                              onChange={(e) => handleCellChange(originalIndex, colIndex, e.target.value)}
                              className="w-full bg-transparent px-3 py-2 outline-none text-white/80 focus:text-white text-xs transition-colors"
                            />
                          </td>
                        );
                      })}

                      {/* Row Action Buttons (Duplicate, Delete) */}
                      <td className="p-1 text-center border-l border-white/5 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0d0d0d]">
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
                  );
                })}
              </tbody>

            </table>

            {/* Empty Table State */}
            {displayedRows.length === 0 && (
              <div className="p-16 text-center flex flex-col items-center justify-center">
                <FileSpreadsheet className="text-white/20 mb-3" size={32} />
                <p className="text-sm font-bold text-white/60 mb-1">No matching rows</p>
                <p className="text-xs text-white/30 mb-4">
                  {searchQuery || columnFilter.value ? 'Try clearing your search filters.' : 'Click "Add Row" to begin inserting data.'}
                </p>
                {(searchQuery || columnFilter.value) ? (
                  <button
                    onClick={() => { setSearchQuery(''); setColumnFilter({ colIndex: null, value: '' }); }}
                    className="px-3 py-1.5 border border-white/10 text-white/70 hover:text-white text-xs uppercase tracking-wider font-bold"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={handleAddRow}
                    className="px-4 py-2 bg-[#d4f000] text-[#080808] text-xs font-bold uppercase tracking-wider hover:bg-[#b8d000]"
                  >
                    Add First Row
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Table Footer Stats */}
          <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-white/30 px-1">
            <div className="flex items-center gap-4">
              <span>{data.length} total rows</span>
              <span>{headers.length} columns</span>
              {selectedRows.size > 0 && (
                <span className="text-[#d4f000] font-semibold">{selectedRows.size} rows selected</span>
              )}
            </div>
            <div>
              <span>Auto-saved to local workspace</span>
            </div>
          </div>

        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. MODALS (Export & Share)
      ───────────────────────────────────────────────────────────── */}
      
      {/* Export CSV Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Export Dataset</h3>
            <p className="text-xs text-white/40 mb-6">Download your edited spreadsheet as a standard CSV file.</p>

            <div className="flex items-center mb-6 border border-white/10 focus-within:border-[#d4f000] bg-black/50">
              <input
                type="text"
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmExport();
                  if (e.key === 'Escape') setShowExportModal(false);
                }}
                className="flex-1 bg-transparent px-3 py-2.5 text-xs text-white outline-none"
                placeholder="File name"
                autoFocus
              />
              <span className="px-3 py-2.5 bg-white/5 border-l border-white/10 text-white/40 text-xs font-mono">
                .csv
              </span>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={confirmExport}
                className="px-4 py-2 bg-[#d4f000] text-[#080808] hover:bg-[#b8d000] text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <Download size={14} /> Download CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Form Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 p-8 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute right-4 top-4 text-white/40 hover:text-white"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold text-white mb-2">Share Data Collection Form</h3>
            <p className="text-xs text-white/40 mb-6">
              Anyone with this link can submit new rows directly into your dataset.
            </p>

            {isGeneratingShare ? (
              <div className="py-10 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="animate-spin text-[#d4f000]" size={24} />
                <p className="text-xs uppercase tracking-widest text-white/40">Generating secure form link...</p>
              </div>
            ) : sharedFormId ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-black/50 border border-white/10">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/shared-form/${sharedFormId}`}
                    className="flex-1 bg-transparent text-xs text-white/90 outline-none px-1"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/shared-form/${sharedFormId}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="px-3 py-1.5 bg-[#d4f000] text-[#080808] hover:bg-[#b8d000] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    {copiedLink ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-white/30">
                  Form submissions will automatically populate new rows into this spreadsheet.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-white/5 border border-white/10 text-xs text-white/60">
                Backend connection unavailable. Offline share link format:
                <div className="mt-2 font-mono text-[11px] text-[#d4f000]">{window.location.origin}/shared-form/demo-preview</div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
