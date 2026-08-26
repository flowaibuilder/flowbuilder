import React, { useState } from 'react';
import { UploadCloud, MessageSquare, Loader2, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#ff90e8', '#ffc900', '#23a094', '#fff0d4', '#ffffff'];

export default function DataDashboard() {
  const [csvContent, setCsvContent] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!csvContent) {
      setError('Please upload a CSV file first.');
      return;
    }
    if (!query) {
      setError('Please ask a question.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/data/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent, query }),
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

  return (
    <div className="max-w-5xl mx-auto p-6 mt-10">
      <div className="bg-bg-base border-4 border-black p-8 shadow-[8px_8px_0_0_#000]">
        <h2 className="text-4xl font-black text-black mb-2 uppercase tracking-tight">AI Data Agent</h2>
        <p className="text-black font-bold mb-8 border-b-4 border-black pb-4">Upload a CSV or Excel file and let the AI generate a dashboard.</p>

        <div className="mb-8 p-6 bg-white border-4 border-black text-center hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] transition-all cursor-pointer relative">
          <UploadCloud className="mx-auto h-12 w-12 text-black mb-4" />
          <div className="flex text-lg font-black text-black justify-center uppercase">
            <label className="relative cursor-pointer">
              <span className="bg-primary border-2 border-black px-4 py-2 hover:bg-secondary transition-colors inline-block">Select a file</span>
              <input type="file" className="sr-only" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />
            </label>
          </div>
          <p className="text-sm font-bold text-gray-700 mt-4">CSV, XLSX, XLS up to 10MB</p>
          {csvContent && (
            <div className="absolute top-4 right-4 bg-accent text-white border-2 border-black px-3 py-1 font-black uppercase text-sm shadow-[2px_2px_0_0_#000] rotate-[3deg]">
              ✓ Uploaded
            </div>
          )}
        </div>

        <form onSubmit={handleQuerySubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-black text-black mb-2 uppercase">Ask a question about your data</label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Give me a dashboard showing the top 5 items and a breakdown of stock by category."
                className="w-full px-4 py-4 pl-12 border-4 border-black font-bold text-black focus:outline-none focus:ring-0 shadow-[4px_4px_0_0_#000] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0_0_#000] transition-all"
              />
              <BarChart2 className="absolute left-4 top-4 h-6 w-6 text-black" strokeWidth={3} />
            </div>
          </div>

          {error && (
            <div className="bg-white border-4 border-black p-4 text-red-600 font-black shadow-[4px_4px_0_0_#000]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !csvContent}
            className="w-full bg-black text-white text-xl font-black uppercase py-4 px-4 border-4 border-transparent hover:border-black hover:bg-white hover:text-black transition-all flex items-center justify-center disabled:opacity-50 shadow-[6px_6px_0_0_rgba(0,0,0,0.3)] hover:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-3" size={24} />
                Building Dashboard...
              </>
            ) : (
              'Generate Statistical Dashboard'
            )}
          </button>
        </form>

        {result && typeof result.answer === 'object' && !result.answer.error ? (
          <div className="mt-16 space-y-12">
            <h3 className="text-4xl font-black text-black border-b-8 border-black pb-4 uppercase tracking-tight">Your Dashboard</h3>
            
            {/* Metrics */}
            {result.answer.metrics && result.answer.metrics.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {result.answer.metrics.map((metric, i) => (
                  <div key={i} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_#000] transition-all">
                    <p className="text-sm font-black text-gray-600 uppercase tracking-widest">{metric.label}</p>
                    <p className="text-4xl font-black text-black mt-3">{metric.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Charts */}
            {result.answer.charts && result.answer.charts.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {result.answer.charts.map((chart, i) => (
                  <div key={i} className="bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000]">
                    <h4 className="text-xl font-black text-black uppercase mb-6 bg-secondary inline-block px-3 py-1 border-2 border-black shadow-[2px_2px_0_0_#000] rotate-[-1deg]">
                      {chart.title}
                    </h4>
                    <div className="h-80 w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        {chart.type === 'pie' ? (
                          <PieChart>
                            <Pie
                              data={chart.data}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              dataKey="value"
                              nameKey="name"
                              label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                              labelLine={{ stroke: '#000', strokeWidth: 2 }}
                              stroke="#000"
                              strokeWidth={3}
                            >
                              {chart.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ border: '4px solid black', borderRadius: 0, boxShadow: '6px 6px 0 0 #000', fontWeight: '900', backgroundColor: '#fff' }} />
                          </PieChart>
                        ) : (
                          <BarChart data={chart.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#000" tick={{fill: '#000', fontWeight: '900'}} axisLine={{ strokeWidth: 3 }} tickLine={{ strokeWidth: 3 }} />
                            <YAxis stroke="#000" tick={{fill: '#000', fontWeight: '900'}} axisLine={{ strokeWidth: 3 }} tickLine={{ strokeWidth: 3 }} />
                            <Tooltip cursor={{fill: '#fff0d4'}} contentStyle={{ border: '4px solid black', borderRadius: 0, boxShadow: '6px 6px 0 0 #000', fontWeight: '900', backgroundColor: '#fff' }} />
                            <Bar dataKey="value" fill="#ff90e8" stroke="#000" strokeWidth={3} />
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
              <div className="bg-accent border-4 border-black p-8 shadow-[10px_10px_0_0_#000]">
                <div className="flex items-center gap-3 mb-6 text-white font-black uppercase text-2xl">
                  <div className="bg-black p-2"><MessageSquare size={28} className="text-white" /></div>
                  <span>AI Insights & Recommendations</span>
                </div>
                <div className="bg-white p-6 border-4 border-black font-bold text-black text-lg leading-relaxed whitespace-pre-wrap shadow-[6px_6px_0_0_#000]">
                  {result.answer.insights}
                </div>
              </div>
            )}
          </div>
        ) : result && (
          <div className="mt-16 space-y-6">
            <h3 className="text-3xl font-black text-black border-b-4 border-black pb-4 uppercase">Raw Output</h3>
            <div className="bg-white p-6 border-4 border-black font-bold text-black text-lg leading-relaxed whitespace-pre-wrap shadow-[8px_8px_0_0_#000]">
              {typeof result.answer === 'string' ? result.answer : JSON.stringify(result.answer, null, 2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
