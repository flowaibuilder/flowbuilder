import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { Plus, Trash2, Download, RefreshCw, Share2, X, Copy, CheckCircle2 } from 'lucide-react';

export default function DataEditor({ initialCsvContent, onReanalyze, dashboardName = "Data Dashboard" }) {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isParsing, setIsParsing] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedFormId, setSharedFormId] = useState(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportFileName, setExportFileName] = useState('edited_data');
  const tableContainerRef = useRef(null);
  const lastFetchedRef = useRef(new Date().toISOString());

  // Polling for new submissions
  useEffect(() => {
    if (!sharedFormId) return;
    
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/form/${sharedFormId}/submissions?since=${encodeURIComponent(lastFetchedRef.current)}`);
        const result = await res.json();
        
        if (result.success && result.submissions && result.submissions.length > 0) {
          lastFetchedRef.current = result.submissions[result.submissions.length - 1].created_at;
          const newRows = result.submissions.map(sub => sub.data);
          setData(prev => {
            const newData = [...prev];
            const rowsToAdd = [...newRows];
            
            for (let i = 0; i < newData.length; i++) {
              if (rowsToAdd.length === 0) break;
              
              const isEmpty = newData[i].every(cell => !cell || cell.toString().trim() === '');
              if (isEmpty) {
                newData[i] = rowsToAdd.shift();
              }
            }
            
            return [...newData, ...rowsToAdd];
          });
          
          if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
          }
        }
      } catch (err) {
        console.error("Failed to poll submissions:", err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [sharedFormId]);

  const handleShareForm = async () => {
    setIsGeneratingLink(true);
    setShowShareModal(true);
    setCopied(false);
    try {
      const res = await fetch('/api/form/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headers, dashboardName })
      });
      const data = await res.json();
      if (res.ok) {
        setSharedFormId(data.formId);
        lastFetchedRef.current = data.createdAt || new Date().toISOString();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  useEffect(() => {
    if (initialCsvContent) {
      setIsParsing(true);
      Papa.parse(initialCsvContent, {
        complete: (results) => {
          const parsed = results.data;
          // Papa Parse returns an array of arrays
          if (parsed.length > 0) {
            setHeaders(parsed[0]);
            setData(parsed.slice(1).filter(row => row.length === parsed[0].length || row.some(cell => cell))); 
          }
          setIsParsing(false);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          setIsParsing(false);
        }
      });
    }
  }, [initialCsvContent]);

  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...data];
    if (!newData[rowIndex]) return;
    
    // Create a new copy of the row to ensure React detects the change
    const newRow = [...newData[rowIndex]];
    newRow[colIndex] = value;
    newData[rowIndex] = newRow;
    
    setData(newData);
  };

  const handleHeaderChange = (colIndex, value) => {
    const newHeaders = [...headers];
    newHeaders[colIndex] = value;
    setHeaders(newHeaders);
  };

  const addRow = () => {
    const newRow = new Array(headers.length).fill('');
    setData([...data, newRow]);
    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
      }
    }, 50);
  };

  const addColumn = () => {
    setHeaders([...headers, `New Column ${headers.length + 1}`]);
    const newData = data.map(row => [...row, '']);
    setData(newData);
    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollLeft = tableContainerRef.current.scrollWidth;
      }
    }, 50);
  };

  const deleteRow = (rowIndex) => {
    const newData = data.filter((_, idx) => idx !== rowIndex);
    setData(newData);
  };

  const deleteColumn = (colIndex) => {
    const newHeaders = headers.filter((_, idx) => idx !== colIndex);
    setHeaders(newHeaders);
    const newData = data.map(row => row.filter((_, idx) => idx !== colIndex));
    setData(newData);
  };

  const generateCsvString = () => {
    return Papa.unparse([headers, ...data]);
  };

  const handleExport = () => {
    // Make sure we strip any potential ' Dashboard' suffix for the clean export filename, or just use it raw
    const cleanDefault = dashboardName.toLowerCase().replace(/\s+/g, '_');
    setExportFileName(cleanDefault);
    setShowExportModal(true);
  };

  const confirmExport = () => {
    if (!exportFileName.trim()) return;
    
    const finalFileName = `${exportFileName.trim()}.csv`;

    const csvStr = generateCsvString();
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", finalFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setShowExportModal(false);
  };

  const handleReanalyze = () => {
    const csvStr = generateCsvString();
    onReanalyze(csvStr);
  };

  if (isParsing) {
    return <div className="h-full flex items-center justify-center text-white/40 text-[11px] uppercase tracking-widest font-bold">Loading data...</div>;
  }

  return (
    <div className="bg-[#0a0a0a] border border-white/10 flex flex-col h-full min-h-[500px] overflow-hidden">
      
      {/* Header Actions */}
      <div className="p-5 border-b border-white/10 flex flex-col gap-4 bg-white/5">
        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Data Editor</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={addRow}
            className="flex items-center gap-1.5 px-4 py-2 bg-transparent border border-white/10 text-white/40 hover:text-white/80 hover:border-white/30 text-[11px] font-bold uppercase tracking-widest transition-colors"
          >
            <Plus size={14} /> Add Row
          </button>
          <button 
            onClick={addColumn}
            className="flex items-center gap-1.5 px-4 py-2 bg-transparent border border-white/10 text-white/40 hover:text-white/80 hover:border-white/30 text-[11px] font-bold uppercase tracking-widest transition-colors"
          >
            <Plus size={14} /> Add Column
          </button>
          <button 
            onClick={handleShareForm}
            className="flex items-center gap-1.5 px-4 py-2 bg-transparent border border-[#d4f000]/30 text-[#d4f000] hover:bg-[#d4f000]/10 text-[11px] font-bold uppercase tracking-widest transition-colors"
          >
            <Share2 size={14} /> Share Form
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 bg-transparent border border-white/10 text-white/40 hover:text-white/80 hover:border-white/30 text-[11px] font-bold uppercase tracking-widest transition-colors"
          >
            <Download size={14} /> Export
          </button>
          <button 
            onClick={handleReanalyze}
            className="group relative flex items-center gap-2 px-5 py-2 bg-transparent text-[#d4f000] border border-[#d4f000] hover:bg-[#d4f000] hover:text-[#080808] hover:shadow-[0_0_20px_rgba(212,240,0,0.4)] text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ml-auto overflow-hidden"
          >
            <div className="absolute inset-0 w-0 bg-white/20 transition-all duration-[400ms] ease-out group-hover:w-full"></div>
            <RefreshCw size={14} className="relative z-10 transition-transform duration-500 group-hover:rotate-180" />
            <span className="relative z-10">Re-analyze</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div ref={tableContainerRef} className="flex-1 overflow-auto bg-[#0a0a0a] p-4 scroll-smooth">
        <div className="min-w-max border border-white/10 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-2 w-10 text-center border-r border-white/10 text-white/30 text-[10px] font-bold uppercase tracking-wider">#</th>
                {headers.map((header, colIndex) => (
                  <th key={colIndex} className="p-0 border-r border-white/10 font-semibold text-white/80 relative min-w-[120px] group/header">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => handleHeaderChange(colIndex, e.target.value)}
                      className="w-full bg-transparent px-3 py-2 outline-none focus:bg-white/5 focus:ring-inset focus:ring-1 focus:ring-[#d4f000] font-semibold text-white/90 text-xs pr-8 transition-all"
                    />
                    <button 
                      onClick={() => deleteColumn(colIndex)}
                      className="absolute right-1 top-1.5 p-1 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors opacity-0 group-hover/header:opacity-100"
                      title="Delete Column"
                    >
                      <Trash2 size={12} />
                    </button>
                  </th>
                ))}
                <th className="p-2 w-10 text-center bg-white/5"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-white/5 hover:bg-white/5 group transition-colors">
                  <td className="p-2 text-center border-r border-white/10 text-white/30 text-[10px] font-medium">
                    {rowIndex + 1}
                  </td>
                  {headers.map((_, colIndex) => (
                    <td key={colIndex} className="p-0 border-r border-white/10 relative">
                      <input
                        type="text"
                        value={row[colIndex] !== undefined ? row[colIndex] : ''}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className="w-full bg-transparent px-3 py-2 outline-none focus:bg-white/5 focus:ring-inset focus:ring-1 focus:ring-[#d4f000] text-white/60 focus:text-white/90 text-sm transition-all"
                      />
                    </td>
                  ))}
                  <td className="p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => deleteRow(rowIndex)}
                      className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Delete Row"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {data.length === 0 && (
            <div className="p-12 text-center text-white/30 text-[11px] font-bold uppercase tracking-widest">
              No data available. Click "Add Row" to start building a dataset.
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] p-8 shadow-2xl w-full max-w-sm border border-white/10">
            <h4 className="text-lg font-bold text-white/90 mb-2">Export Data</h4>
            <p className="text-sm text-white/40 mb-6">Give your file a name before downloading.</p>
            
            <div className="flex items-center mb-8 border border-white/10 focus-within:border-[#d4f000] overflow-hidden bg-black/50 transition-colors">
              <input 
                type="text" 
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmExport();
                  if (e.key === 'Escape') setShowExportModal(false);
                }}
                className="flex-1 bg-transparent px-4 py-3 text-sm font-semibold text-white/90 outline-none placeholder:text-white/30"
                placeholder="File name"
                autoFocus
              />
              <div className="px-4 py-3 bg-white/5 border-l border-white/10 text-white/40 text-sm font-semibold">
                .csv
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowExportModal(false)}
                className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white/90 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmExport}
                className="px-5 py-3 text-[11px] font-bold uppercase tracking-widest bg-[#d4f000] text-[#080808] hover:bg-[#b8d000] transition-colors flex items-center gap-2"
              >
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111] p-6 md:p-8 shadow-2xl w-full max-w-lg border border-white/10 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h4 className="text-2xl font-black text-white/90 tracking-tight">Share Data Form</h4>
                <p className="text-sm text-white/40 font-medium mt-2">Send this link to others to collect data directly into your editor.</p>
              </div>
              <button onClick={() => setShowShareModal(false)} className="text-white/30 hover:text-white/90 bg-transparent hover:bg-white/5 p-2 rounded-full transition-colors self-start mt-1 shrink-0 ml-4">
                <X size={20} />
              </button>
            </div>
            
            {isGeneratingLink ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <RefreshCw className="animate-spin text-[#d4f000]" size={28} />
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Generating secure link...</p>
              </div>
            ) : sharedFormId ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-black/50 border border-white/10">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/shared-form/${sharedFormId}`}
                    className="flex-1 bg-transparent text-sm font-medium text-white/90 outline-none px-2"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/shared-form/${sharedFormId}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white/90"
                  >
                    {copied ? <CheckCircle2 size={18} className="text-[#d4f000]" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            ) : (
               <p className="text-red-400 text-sm font-semibold text-center py-6">Failed to generate link. Make sure backend is running and connected.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
