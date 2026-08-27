import React, { useState } from 'react';
import { UploadCloud, MessageSquare, Loader2, BarChart2, CheckCircle2, X, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import DataEditor from './DataEditor';
import ReactMarkdown from 'react-markdown';

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function DataDashboard() {
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [dashboardName, setDashboardName] = useState('Data Dashboard');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const clearFile = () => {
    setCsvContent('');
    setFileName('');
    setDashboardName('Data Dashboard');
    setResult(null);
    setQuery('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    
    // Create a nice default dashboard name from the file name
    const baseName = file.name.replace(/\.[^/.]+$/, ""); // Strip extension
    // Capitalize first letters and replace dashes/underscores with spaces
    const cleanName = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    setDashboardName(`${cleanName} Dashboard`);

    const extension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = async (evt) => {
      if (extension === 'csv') {
        setCsvContent(evt.target.result);
      } else if (extension === 'xlsx' || extension === 'xls') {
        try {
          const XLSX = await import('xlsx');
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csv = XLSX.utils.sheet_to_csv(worksheet);
          setCsvContent(csv);
        } catch (err) {
          setError('Failed to parse Excel file: ' + err.message);
        }
      } else {
        setError('Unsupported file type');
      }
    };

    if (extension === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const handleReanalyze = async (newCsvContent) => {
    setCsvContent(newCsvContent);
    await analyzeData(newCsvContent, query);
  };

  const analyzeData = async (dataToAnalyze, queryToUse) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/data/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: dataToAnalyze, query: queryToUse }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze data');
      }

      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!csvContent) {
      setError('Please upload a CSV file first.');
      return;
    }
    await analyzeData(csvContent, query);
  };

  // FULL SCREEN DASHBOARD VIEW
  if (result && typeof result.answer === 'object' && !result.answer.error) {
    return (
      <div className="min-h-screen font-sans bg-slate-50 p-6">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 mr-4">
            <input 
              type="text"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              className="text-4xl font-black text-slate-900 tracking-tight bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 outline-none w-full max-w-3xl transition-all pb-2 placeholder:text-slate-300"
              placeholder="Enter Dashboard Name"
              title="Click to edit dashboard name"
            />
          </div>
          <button 
            onClick={() => setResult(null)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-sm font-semibold shrink-0"
          >
            <ArrowLeft size={16} />
            Start Over
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Left Panel: Dashboard (70%) */}
          <div className="lg:col-span-2 space-y-10 overflow-y-auto pr-2 h-[85vh] pb-20 custom-scrollbar">
            
            {/* Metrics */}
            {result.answer.metrics && result.answer.metrics.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {result.answer.metrics.map((metric, i) => (
                  <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-md transition-all group">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-blue-500 transition-colors">{metric.label}</p>
                    <p className="text-2xl lg:text-3xl font-extrabold text-slate-900 break-words">{metric.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Charts */}
            {result.answer.charts && result.answer.charts.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {result.answer.charts.map((chart, i) => (
                  <div key={i} className="bg-white border border-slate-100 p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-md transition-shadow">
                    <h4 className="text-lg font-bold text-slate-800 mb-8 border-l-4 border-blue-500 pl-4">
                      {chart.title}
                    </h4>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {chart.type === 'pie' ? (
                          <PieChart>
                            <Pie
                              data={chart.data}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={6}
                              dataKey="value"
                              nameKey="name"
                              stroke="none"
                              labelLine={false}
                            >
                              {chart.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', fontSize: '13px', fontWeight: '600', color: '#1e293b', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                              itemStyle={{ color: '#0f172a' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '500', color: '#64748b' }} iconType="circle" />
                          </PieChart>
                        ) : (
                          <BarChart data={chart.data} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontFamily="inherit" tickLine={false} axisLine={false} dy={10} interval="preserveStartEnd" />
                            <YAxis stroke="#94a3b8" fontSize={11} fontFamily="inherit" tickLine={false} axisLine={false} dx={-10} />
                            <Tooltip 
                              cursor={{ fill: '#f8fafc' }} 
                              contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', fontSize: '13px', fontWeight: '600', color: '#1e293b', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '500', color: '#64748b', paddingTop: '10px' }} iconType="circle" />
                            <Bar dataKey="value" name="Value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} className="hover:opacity-80 transition-opacity" />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Insights */}
            {result.answer.insights && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-8 md:p-10 rounded-[2rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm border border-blue-100">
                      <MessageSquare size={24} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">AI Insights & Analysis</h4>
                  </div>
                  <div className="text-slate-700 text-base leading-relaxed font-medium [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:mt-6 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-4 [&>li]:mb-1 [&>strong]:text-slate-900">
                    <ReactMarkdown>{result.answer.insights}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Panel: Data Editor (30%) */}
          <div className="lg:col-span-1 h-[85vh]">
            <DataEditor 
              initialCsvContent={csvContent} 
              onReanalyze={handleReanalyze}
              dashboardName={dashboardName}
            />
          </div>

        </div>
      </div>
    );
  }

  // Raw Error output if JSON parsing failed
  if (result) {
    return (
      <div className="min-h-screen font-sans bg-slate-50 py-10 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900">Analysis Results</h2>
            <button onClick={() => setResult(null)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-sm font-semibold"><ArrowLeft size={16} /> Start Over</button>
          </div>
          <div className="bg-white border border-slate-200 p-8 rounded-3xl text-slate-600 text-sm font-mono overflow-auto shadow-sm">
            {typeof result.answer === 'string' ? result.answer : JSON.stringify(result.answer, null, 2)}
          </div>
        </div>
      </div>
    );
  }

  // MAIN UPLOAD FORM VIEW
  return (
    <div className="min-h-screen font-sans bg-slate-50 py-12 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/50 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative max-w-4xl mx-auto w-full rounded-[2.5rem] bg-white/80 backdrop-blur-2xl p-8 md:p-14 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white">
        
        {/* Subtle light grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, #000 40px, #000 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, #000 40px, #000 41px)`
          }}
        />

        <div className="relative z-10">
          
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6 border border-blue-100 shadow-sm">
              <BarChart2 size={16} />
              AI Data Agent
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight">Data Intelligence</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">Upload an Excel or CSV file. We'll instantly analyze the entire dataset and build a comprehensive dashboard for you.</p>
          </div>

          {/* Upload Box */}
          {csvContent && fileName ? (
            <div className="mb-10 p-6 bg-white border border-blue-100 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-green-50 text-green-600 p-3 rounded-xl">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-slate-900 font-semibold text-sm">{fileName}</p>
                  <p className="text-slate-500 text-xs mt-0.5">Ready for analysis</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.preventDefault(); clearFile(); }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Remove file"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <label className="block mb-10 p-10 bg-white/50 border border-dashed border-blue-200 rounded-3xl text-center hover:bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 cursor-pointer relative group w-full">
              <UploadCloud className="mx-auto h-12 w-12 text-slate-300 mb-5 group-hover:text-blue-500 transition-colors duration-300" />
              <div className="flex justify-center mb-3">
                <span className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-6 py-3 rounded-xl shadow-sm group-hover:bg-slate-50 group-hover:text-blue-600 transition-colors inline-block">
                  Browse files
                </span>
                <input type="file" className="sr-only" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">Supports .csv, .xlsx up to 10MB</p>
            </label>
          )}

          <form onSubmit={handleQuerySubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Specific requirements? (Optional)</label>
              <div className="relative group">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Show me a breakdown of revenue by product category"
                  className="w-full px-5 py-4 pl-14 rounded-2xl border border-slate-200 text-slate-900 text-base bg-white focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm group-hover:border-blue-300 placeholder:text-slate-400"
                />
                <BarChart2 className="absolute left-5 top-4 h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-1">If left blank, the AI will automatically find the most important trends for you.</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-5 py-4 rounded-2xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !csvContent}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-lg py-4 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 disabled:shadow-none disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-3" size={22} />
                  Analyzing entire dataset...
                </>
              ) : (
                'Generate Full Dashboard'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
