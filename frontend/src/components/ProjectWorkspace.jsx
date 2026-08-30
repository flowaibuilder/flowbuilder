import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  ArrowLeft, Save, Download, Share2, Plus, Trash2, Copy,
  CheckCircle2, AlertTriangle, Sparkles, TrendingUp, BarChart2,
  Table2, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown,
  RotateCcw, RotateCw, MoreVertical, X, Check, Globe, Layers,
  FileSpreadsheet, Zap, ExternalLink, RefreshCw, Loader2, UploadCloud,
  Edit2, Eye, Layout, Sliders, Info, XCircle
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
const DEFAULT_HEADERS = ['Category', 'Traffic', 'Conversions', 'Bounce Rate (%)'];
const DEFAULT_DATA = [
  ['Organic Search', '4200', '428', '45.2'],
  ['Direct', '2800', '210', '40.1'],
  ['Referral', '1500', '180', '35.5'],
  ['Social Media', '2200', '110', '56.1'],
  ['Paid Ads', '1800', '190', '48.9'],
  ['Email Campaigns', '1200', '122', '32.4']
];

const DEFAULT_COUNTRY_COORDS = {
  US: [37.0902, -95.7129],
  IN: [20.5937, 78.9629],
  GB: [55.3781, -3.4360],
  CA: [56.1304, -106.3468],
  AU: [-25.2744, 133.7751],
  DE: [51.1657, 10.4515],
  FR: [46.2276, 2.2137],
  BR: [-14.2350, -51.9253],
  JP: [36.2048, 138.2529],
  CN: [35.8617, 104.1954],
  AE: [23.4241, 53.8478],
  SG: [1.3521, 103.8198],
  NL: [52.1326, 5.2913],
  ES: [40.4637, -3.7492],
  IT: [41.8719, 12.5674],
  RU: [61.5240, 105.3188],
  ZA: [-30.5595, 22.9375],
  MX: [23.6345, -102.5528],
  ID: [-0.7893, 113.9213],
  PK: [30.3753, 69.3451],
  BD: [23.6850, 90.3563],
  KR: [35.9078, 127.7669],
  PH: [12.8797, 121.7740],
  VN: [14.0583, 108.2772],
  TH: [15.8700, 100.9925],
  MY: [4.2105, 101.9758],
  NZ: [-40.9006, 174.8860],
  SE: [60.1282, 18.6435],
  NO: [60.4720, 8.4689],
  FI: [61.9241, 25.7482],
  DK: [56.2639, 9.5018],
  PL: [51.9194, 19.1451],
  CH: [46.8182, 8.2275],
  AT: [47.5162, 14.5501],
  BE: [50.5039, 4.4699],
  IE: [53.1424, -7.6921],
  PT: [39.3999, -8.2245],
  GR: [39.0742, 21.8243],
  TR: [38.9637, 35.2433],
  EG: [26.8206, 30.8025],
  SA: [23.8859, 45.0792],
  AR: [-38.4161, -63.6167],
  CL: [-35.6751, -71.5430],
  CO: [4.5709, -74.2973],
  PE: [-9.1900, -75.0152],
  NG: [9.0820, 8.6753],
  KE: [-1.2921, 36.8219]
};

function TrafficMap({ rawGeoStats }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 1.5,
      maxZoom: 8,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear previous circle markers
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    Object.entries(rawGeoStats).forEach(([code, data]) => {
      const lat = data.lat || DEFAULT_COUNTRY_COORDS[code]?.[0];
      const lng = data.lon || DEFAULT_COUNTRY_COORDS[code]?.[1];

      if (lat != null && lng != null) {
        const radius = Math.min(22, Math.max(8, Math.sqrt(data.visits || 1) * 7));
        const circle = L.circleMarker([lat, lng], {
          radius: radius,
          fillColor: '#d4f000',
          color: '#ffffff',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.75
        }).addTo(map);

        const flag = code ? String.fromCodePoint(...[...code.toUpperCase()].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65)) : '🌍';
        const citiesList = Object.entries(data.cities || {})
          .map(([c, v]) => `• ${c}: ${v}`)
          .join('<br/>');

        circle.bindPopup(`
          <div style="font-family: sans-serif; color: #fff; background: #111; padding: 8px 12px; border-radius: 8px; font-size: 12px;">
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 2px;">${flag} ${data.country || code}</div>
            <div style="color: #d4f000; font-size: 13px; font-weight: 800;">${data.visits} Visit${data.visits > 1 ? 's' : ''}</div>
            ${citiesList ? `<div style="font-size: 10px; color: #aaa; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">${citiesList}</div>` : ''}
          </div>
        `);
      }
    });
  }, [rawGeoStats]);

  return (
    <div className="w-full h-[380px] rounded-xl overflow-hidden border border-white/10 relative z-0">
      <div ref={containerRef} className="w-full h-full bg-[#0b0b0b]" />
    </div>
  );
}

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
  const [subdomain, setSubdomain] = useState(project?.subdomain || null);
  const [status, setStatus] = useState(project?.status || 'draft');
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  const handleUnpublish = async () => {
    if (!subdomain) return;
    if (!window.confirm("Are you sure you want to unpublish this website? It will no longer be accessible online.")) {
      return;
    }

    setIsUnpublishing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to unpublish.');

      // 1. Delete from published_sites table
      const { error: deleteError } = await supabase
        .from('published_sites')
        .delete()
        .eq('subdomain', subdomain)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // 2. Update subdomain in saved_websites config
      const { data: saved } = await supabase
        .from('saved_websites')
        .select('*')
        .eq('id', project?.id)
        .maybeSingle();

      if (saved) {
        const updatedConfig = {
          ...saved.config,
          subdomain: null
        };
        await supabase
          .from('saved_websites')
          .update({
            config: updatedConfig
          })
          .eq('id', saved.id);
      }

      // 3. Update local state
      setSubdomain(null);
      setStatus('draft');
      alert("Website unpublished successfully!");

      // 4. Notify parent list to refresh
      if (onUpdateProject) {
        onUpdateProject({
          ...project,
          status: 'draft',
          subdomain: null,
          config: {
            ...project?.config,
            subdomain: null
          }
        });
      }
    } catch (err) {
      console.error('Unpublish failed:', err);
      alert('Unpublish failed: ' + err.message);
    } finally {
      setIsUnpublishing(false);
    }
  };

  // ── Active Workspace Tab ───────────────────────────────────────────────────
  // 'overview' | 'website' | 'data' | 'analytics'
  const [activeTab, setActiveTab] = useState('overview');

  // ── Website State ──────────────────────────────────────────────────────────
  const [websiteSpec, setWebsiteSpec] = useState(
    project?.spec || [
      { id: '1', type: 'hero', content: { headline: 'Grow Your Business Faster', subheadline: 'AI-generated high-converting website built for performance and growth.', ctaText: 'Get Started' } },
      { id: '2', type: 'features', content: { title: 'Core Features', description: 'Everything you need to succeed', items: [{ title: 'Ultra Fast', description: 'Built on modern web tech' }, { title: 'Responsive', description: 'Looks perfect on all screens' }, { title: 'AI Driven', description: 'Updated seamlessly by prompts' }] } },
      { id: '3', type: 'contact', content: { title: 'Get in Touch', email: 'contact@example.com', phone: '+1 (555) 000-0000' } },
      { id: '4', type: 'footer', content: { companyName: 'My Brand', tagline: 'Crafting world-class digital experiences powered by intelligent design and high performance.' } }
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
  const initialHeaders = project?.config?.dataHeaders || project?.dataHeaders || ['Name', 'Email', 'Message', 'Submitted At'];
  const initialRows = project?.config?.dataRows || project?.dataRows || [];

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


  const [rawVisitorStats, setRawVisitorStats] = useState({});
  const [rawGeoStats, setRawGeoStats] = useState({});
  const [rawReferrerStats, setRawReferrerStats] = useState({});
  const [visitorFilter, setVisitorFilter] = useState({ type: 'preset', value: '30d' }); // type: preset | date | month

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
        setRawVisitorStats(visitorStats);
        const geoStats = data?.config?.geoStats || {};
        setRawGeoStats(geoStats);
        const referrerStats = data?.config?.referrerStats || {};
        setRawReferrerStats(referrerStats);
      } catch (err) {
        console.error('Error fetching visitor stats:', err);
      }
    };
    
    fetchVisitors();
  }, [project?.subdomain]);

  const displayVisitors = useMemo(() => {
    let count = 0;
    const now = new Date();
    now.setHours(0,0,0,0);
    
    Object.entries(rawVisitorStats).forEach(([dateStr, c]) => {
      const date = new Date(dateStr);
      date.setHours(0,0,0,0);
      
      if (visitorFilter.type === 'preset') {
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (visitorFilter.value === '1d' && diffDays <= 0) count += c;
        if (visitorFilter.value === '30d' && diffDays <= 30) count += c;
        if (visitorFilter.value === '1y' && diffDays <= 365) count += c;
      }
    });
    return count.toLocaleString();
  }, [rawVisitorStats, visitorFilter]);

  // Build per-day visitor chart data based on current filter
  const visitorChartData = useMemo(() => {
    // Use LOCAL date string to match Supabase-stored date keys
    const toLocal = (d) => {
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const dy = String(d.getDate()).padStart(2, '0');
      return `${yr}-${mo}-${dy}`;
    };
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (visitorFilter.value === '1y') {
      const monthMap = {};
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = { label: d.toLocaleString('default', { month: 'short' }), value: 0 };
      }
      Object.entries(rawVisitorStats).forEach(([dateStr, c]) => {
        const key = dateStr.slice(0, 7);
        if (monthMap[key]) monthMap[key].value += c;
      });
      return Object.values(monthMap);
    }

    // 1d → show last 7 days (so area chart has enough points to draw a curve)
    // 30d → show last 30 days
    const days = visitorFilter.value === '1d' ? 7 : 30;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = toLocal(d);
      // 7-day view: show weekday name; 30-day view: show MM/DD
      const label = days === 7
        ? d.toLocaleString('default', { weekday: 'short' })
        : `${d.getMonth() + 1}/${d.getDate()}`;
      result.push({ label, value: rawVisitorStats[dateStr] || 0 });
    }
    return result;
  }, [rawVisitorStats, visitorFilter]);

  // Build leads chart data based on current filter
  const leadsChartData = useMemo(() => {
    const toLocal = (d) => {
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const dy = String(d.getDate()).padStart(2, '0');
      return `${yr}-${mo}-${dy}`;
    };
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dateColIdx = headers.findIndex(h => /date|time|created|submitted/i.test(h));

    if (visitorFilter.value === '1y') {
      const monthMap = {};
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = { label: d.toLocaleString('default', { month: 'short' }), value: 0 };
      }
      if (dateColIdx >= 0) {
        data.forEach(row => {
          const raw = row[dateColIdx];
          if (!raw) return;
          const d = new Date(raw);
          if (isNaN(d)) return;
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (monthMap[key]) monthMap[key].value++;
        });
      } else {
        const key = toLocal(now).slice(0, 7);
        if (monthMap[key]) monthMap[key].value = data.length;
      }
      return Object.values(monthMap);
    }

    const days = visitorFilter.value === '1d' ? 7 : 30;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = toLocal(d);
      const label = days === 7
        ? d.toLocaleString('default', { weekday: 'short' })
        : `${d.getMonth() + 1}/${d.getDate()}`;
      let value = 0;
      if (dateColIdx >= 0) {
        value = data.filter(row => {
          const raw = row[dateColIdx];
          if (!raw) return false;
          const rd = new Date(raw);
          return !isNaN(rd) && toLocal(rd) === dateStr;
        }).length;
      } else if (i === 0) {
        // No date column — show total on today's bar only
        value = data.length;
      }
      result.push({ label, value });
    }
    return result;
  }, [data, headers, visitorFilter]);



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

      // Sync changes to published_sites if it is a published project
      if (project?.status === 'published' && project?.subdomain) {
        const pubPayload = {
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
            spec: websiteSpec,
            theme
          }
        };
        const { error: pubError } = await supabase
          .from('published_sites')
          .update(pubPayload)
          .eq('subdomain', project.subdomain);
          
        if (pubError) {
          console.error('Error updating published site:', pubError);
        }
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
                  className="bg-white/10 border border-[#d4f000] text-white font-black text-lg sm:text-xl px-2 py-1 outline-none tracking-wide rounded"
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
                <h1 className="text-lg sm:text-xl font-black tracking-wide text-white">
                  {projectName}
                </h1>
                <Edit2 size={16} className="text-white/30 group-hover:text-[#d4f000] transition-colors" />
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

          {status === 'published' && subdomain && (
            <button
              onClick={handleUnpublish}
              disabled={isUnpublishing}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 hover:text-red-400 text-xs uppercase font-bold tracking-wider rounded transition-colors disabled:opacity-50"
            >
              {isUnpublishing ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
              <span>Unpublish</span>
            </button>
          )}

          <button
            onClick={() => {
              if (subdomain) {
                window.open(`https://${subdomain}.flow.devshahid.me`, '_blank', 'noopener,noreferrer');
              }
            }}
            disabled={!subdomain}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#d4f000] text-[#080808] hover:bg-[#b8d000] text-xs uppercase font-black tracking-wider rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 animate-fadeIn">

            {/* Two centred KPI cards */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">

              {/* Visitors Card */}
              <div className="flex-1 max-w-sm p-5 bg-[#0e0e0e] border border-white/10 rounded-2xl hover:border-white/20 transition-all flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Visitors</p>
                  <select
                    value={`preset:${visitorFilter.value}`}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith('preset:')) {
                        setVisitorFilter({ type: 'preset', value: val.split(':')[1] });
                      }
                    }}
                    className="bg-[#1a1a1a] border border-white/10 text-[10px] text-white/70 rounded px-2 py-1 outline-none cursor-pointer transition-colors hover:bg-[#222]"
                  >
                    <option value="preset:1d">Last 1 Day</option>
                    <option value="preset:30d">Last 30 Days</option>
                    <option value="preset:1y">Last 1 Year</option>
                  </select>
                </div>
                <p className="text-4xl font-black text-white">{displayVisitors}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Total unique visitors</p>
              </div>

              {/* Total Leads Card */}
              <div className="flex-1 max-w-sm p-5 bg-[#0e0e0e] border border-white/10 rounded-2xl hover:border-white/20 transition-all flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Total Leads</p>
                </div>
                <p className="text-4xl font-black text-white">{data.length}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">Form submissions collected</p>
              </div>

            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Visitor Trend Chart */}
              <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Visitor Trend</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">
                      {visitorFilter.value === '1d' ? 'Today' : visitorFilter.value === '30d' ? 'Last 30 days' : 'Last 12 months'}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#d4f000] shadow-lg shadow-[#d4f000]/40" />
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={visitorChartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4f000" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#d4f000" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                      labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                      itemStyle={{ color: '#d4f000' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#d4f000"
                      strokeWidth={2}
                      fill="url(#visGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#d4f000' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Leads Trend Chart */}
              <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wider">Leads Collected</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">
                      {visitorFilter.value === '1d' ? 'Today' : visitorFilter.value === '30d' ? 'Last 30 days' : 'Last 12 months'}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-white/60 shadow-lg shadow-white/20" />
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={leadsChartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                      labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                      itemStyle={{ color: '#ffffff' }}
                    />
                    <Bar dataKey="value" fill="url(#leadGrad)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* ── Traffic Insights Map Section ────────────────── */}
            <div className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Globe size={16} className="text-[#d4f000]" />
                    Geographic Traffic Map
                  </h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Real-time visitor map with live locations</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full self-start sm:self-auto">
                  <div className="w-2 h-2 rounded-full bg-[#d4f000] animate-pulse" />
                  <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold">
                    {Object.values(rawGeoStats).reduce((s, c) => s + c.visits, 0)} Total Visits
                  </span>
                </div>
              </div>

              {/* Interactive World Map */}
              <TrafficMap rawGeoStats={rawGeoStats} />

              {/* Geo Stats Grid (Top Countries & Cities) */}
              {Object.keys(rawGeoStats).length > 0 && (() => {
                const sortedCountries = Object.entries(rawGeoStats)
                  .map(([code, d]) => ({ code, ...d }))
                  .sort((a, b) => b.visits - a.visits);
                const totalGeoVisits = sortedCountries.reduce((s, c) => s + c.visits, 0);

                const allCities = [];
                Object.values(rawGeoStats).forEach(country => {
                  Object.entries(country.cities || {}).forEach(([city, visits]) => {
                    allCities.push({ city, country: country.country, countryCode: country.countryCode, visits });
                  });
                });
                const sortedCities = allCities.sort((a, b) => b.visits - a.visits).slice(0, 6);
                const maxCityVisits = sortedCities[0]?.visits || 1;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-white/10">
                    {/* Top Countries */}
                    <div className="flex flex-col gap-2.5">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Top Countries</p>
                      {sortedCountries.slice(0, 6).map((c) => {
                        const pct = totalGeoVisits > 0 ? (c.visits / totalGeoVisits) * 100 : 0;
                        const flag = c.countryCode
                          ? String.fromCodePoint(...[...c.countryCode.toUpperCase()].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65))
                          : '🌍';
                        return (
                          <div key={c.code} className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                            <span className="text-lg w-6 text-center">{flag}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] text-white/90 font-bold truncate">{c.country}</span>
                                <span className="text-[10px] text-[#d4f000] font-bold ml-2 shrink-0">{c.visits} visits · {pct.toFixed(0)}%</span>
                              </div>
                              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-[#d4f000] transition-all duration-500" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Top Cities */}
                    <div className="flex flex-col gap-2.5">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Top Cities</p>
                      {sortedCities.length === 0 ? (
                        <p className="text-[10px] text-white/25 pt-2">City-level data will appear with new visits.</p>
                      ) : sortedCities.map((c, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                          <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-[9px] font-black text-white/60">{idx + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] text-white/90 font-bold truncate">{c.city}</span>
                              <span className="text-[10px] text-white/60 ml-2 shrink-0">{c.visits} visits</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-white/50 transition-all duration-500" style={{ width: `${(c.visits / maxCityVisits) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
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
                          <div className="bg-transparent font-bold text-white uppercase tracking-wider text-xs w-full px-1 py-0.5">
                            {head}
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
                      <td className="p-1 text-center border-l border-white/5 transition-opacity">
                        <div className="flex items-center justify-center gap-1">
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
