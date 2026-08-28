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
    return <div className="h-full flex items-center justify-center text-slate-400">Loading data...</div>;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col h-[85vh] overflow-hidden">
      
      {/* Header Actions */}
      <div className="p-4 border-b border-slate-100 flex flex-col gap-3 bg-slate-50">
        <h3 className="font-bold text-slate-800 text-sm">Data Editor</h3>
        <div className="flex gap-2">
          <button 
            onClick={addRow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Plus size={14} /> Add Row
          </button>
          <button 
            onClick={addColumn}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Plus size={14} /> Add Column
          </button>
          <button 
            onClick={handleShareForm}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors shadow-sm"
          >
            <Share2 size={14} /> Share Form
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={14} /> Export
          </button>
          <button 
            onClick={handleReanalyze}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
          >
            <RefreshCw size={14} /> Re-analyze
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div ref={tableContainerRef} className="flex-1 overflow-auto bg-white p-4 scroll-smooth">
        <div className="min-w-max border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-2 w-10 text-center border-r border-slate-200 text-slate-400 font-medium">#</th>
                {headers.map((header, colIndex) => (
                  <th key={colIndex} className="p-0 border-r border-slate-200 font-semibold text-slate-700 relative min-w-[120px] group/header">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => handleHeaderChange(colIndex, e.target.value)}
                      className="w-full bg-transparent px-3 py-2 outline-none focus:bg-blue-50 focus:ring-inset focus:ring-2 focus:ring-blue-500 font-semibold pr-8"
                    />
                    <button 
                      onClick={() => deleteColumn(colIndex)}
                      className="absolute right-1 top-1.5 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover/header:opacity-100"
                      title="Delete Column"
                    >
                      <Trash2 size={12} />
                    </button>
                  </th>
                ))}
                <th className="p-2 w-10 text-center bg-slate-50"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-slate-100 hover:bg-slate-50/50 group transition-colors">
                  <td className="p-2 text-center border-r border-slate-200 text-slate-400 text-xs">
                    {rowIndex + 1}
                  </td>
                  {headers.map((_, colIndex) => (
                    <td key={colIndex} className="p-0 border-r border-slate-200 relative">
                      <input
                        type="text"
                        value={row[colIndex] !== undefined ? row[colIndex] : ''}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className="w-full bg-transparent px-3 py-2 outline-none focus:bg-blue-50 focus:ring-inset focus:ring-2 focus:ring-blue-500 text-slate-600"
                      />
                    </td>
                  ))}
                  <td className="p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => deleteRow(rowIndex)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
            <div className="p-8 text-center text-slate-500 text-sm">
              No data available. Click "Add Row" to start building a dataset.
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm border border-slate-100">
            <h4 className="text-lg font-bold text-slate-800 mb-2">Export Data</h4>
            <p className="text-sm text-slate-500 mb-5">Give your file a name before downloading.</p>
            
            <div className="flex items-center mb-6 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden bg-slate-50">
              <input 
                type="text" 
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmExport();
                  if (e.key === 'Escape') setShowExportModal(false);
                }}
                className="flex-1 bg-transparent px-4 py-3 text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="File name"
                autoFocus
              />
              <div className="px-4 py-3 bg-slate-100 border-l border-slate-200 text-slate-500 text-sm font-semibold">
                .csv
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmExport}
                className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center gap-2"
              >
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-lg border border-slate-100 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Share Data Form</h4>
                <p className="text-sm text-slate-500 font-medium mt-1">Send this link to others to collect data directly into your editor.</p>
              </div>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors self-start mt-1 shrink-0 ml-4">
                <X size={20} />
              </button>
            </div>
            
            {isGeneratingLink ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="animate-spin text-blue-500" size={24} />
                <p className="text-sm font-semibold text-slate-500">Generating secure link...</p>
              </div>
            ) : sharedFormId ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/shared-form/${sharedFormId}`}
                    className="flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/shared-form/${sharedFormId}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
                  >
                    {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-red-500 text-sm font-semibold text-center py-4">Failed to generate link. Make sure backend is running and connected.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
