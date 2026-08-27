import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { Plus, Trash2, Download, RefreshCw } from 'lucide-react';

export default function DataEditor({ initialCsvContent, onReanalyze, dashboardName = "Data Dashboard" }) {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isParsing, setIsParsing] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileName, setExportFileName] = useState('edited_data');
  const tableContainerRef = useRef(null);

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
    </div>
  );
}
