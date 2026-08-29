const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'missing-key',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.novita.ai/v3/openai',
});

// Use a model with large context window that can handle 100+ rows
const MODEL_NAME = process.env.MODEL_NAME || 'openai/gpt-oss-120b';

async function analyzeDataWithLLM(csvContent, userQuery) {
  const rows = csvContent.split('\n').filter(r => r.trim() !== '');
  const totalRows = rows.length > 0 ? rows.length - 1 : 0;
  const headers = rows[0] || '';
  const columnCount = headers.split(',').length;

  // Build a statistical summary from the raw data to send to the LLM
  // instead of raw CSV so we don't hit token limits
  const columnNames = headers.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  // Parse all data rows
  const dataRows = rows.slice(1).map(row => {
    const vals = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    columnNames.forEach((col, i) => { obj[col] = vals[i] || ''; });
    return obj;
  });

  // For each column, compute summary stats
  const columnSummaries = columnNames.map(col => {
    const values = dataRows.map(r => r[col]).filter(v => v !== '' && v !== undefined);
    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
    
    if (numericValues.length > 0) {
      const sum = numericValues.reduce((a, b) => a + b, 0);
      const avg = (sum / numericValues.length).toFixed(2);
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      return `${col} (numeric): count=${numericValues.length}, sum=${sum.toFixed(2)}, avg=${avg}, min=${min}, max=${max}`;
    } else {
      // Categorical — get top 5 value counts
      const freq = {};
      values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
      const top5 = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([k, v]) => `${k}:${v}`)
        .join(', ');
      return `${col} (categorical): unique=${Object.keys(freq).length}, top values=[${top5}]`;
    }
  });

  const dataSummary = `
Dataset Summary:
- Total Rows: ${totalRows}
- Total Columns: ${columnCount}
- Columns: ${columnNames.join(', ')}

Column Statistics:
${columnSummaries.join('\n')}
`.trim();

  const queryText = userQuery
    ? `User Query: "${userQuery}"\n\nAnalyze the data summary and answer the user's query`
    : `Perform a comprehensive analysis of this dataset. Identify the most important KPIs, trends, and distributions. Analyze the data`;

  const prompt = `You are a Data Analyst and Visualization Expert. The user has uploaded a dataset with ${totalRows} rows and ${columnCount} columns.

Here is a statistical summary of the full dataset:

${dataSummary}

${queryText} by providing a JSON object with EXACTLY this structure (no extra keys, no comments):
{
  "metrics": [
    { "label": "Total Records", "value": "${totalRows}" },
    { "label": "...", "value": "..." }
  ],
  "charts": [
    {
      "title": "...",
      "type": "bar",
      "data": [
        { "name": "...", "value": 0 }
      ]
    }
  ],
  "insights": "## Summary\n\nMarkdown formatted analysis here..."
}

Rules:
- Return ONLY the JSON object, no markdown code fences, no extra text
- Include 4-6 meaningful metrics
- Include 2-4 relevant charts (type must be "bar" or "pie")
- For chart data, use the actual statistics from the summary above
- insights must be a single string with markdown formatting`;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: 'You are an expert Data Analyst. You ONLY output raw valid JSON, never markdown code fences or extra text.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 4096,
    });

    let answer = completion.choices[0].message.content;
    const finishReason = completion.choices[0].finish_reason;
    console.log('LLM Finish Reason:', finishReason);
    console.log('Raw LLM Answer Length:', answer ? answer.length : 'null');

    if (!answer || answer.trim() === '') {
      throw new Error('Empty response from LLM');
    }

    // Strip markdown code fences if present
    answer = answer.trim();
    if (answer.startsWith('```')) {
      answer = answer.replace(/^```(json)?\s*/i, '').replace(/\s*```$/, '');
    }

    // Extract just the JSON object if there's trailing text
    const jsonMatch = answer.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      answer = jsonMatch[0];
    }

    try {
      const parsed = JSON.parse(answer);
      const normalized = {
        metrics: parsed.metrics || parsed.Metrics || [],
        charts: parsed.charts || parsed.Charts || [],
        insights: parsed.insights || parsed.Insights || 'No detailed insights generated.',
      };

      // Ensure Total Rows metric is always present
      const hasRowMetric = normalized.metrics.some(m => 
        m.label.toLowerCase().includes('record') || m.label.toLowerCase().includes('row')
      );
      if (!hasRowMetric) {
        normalized.metrics.unshift({ label: 'Total Records', value: String(totalRows) });
      }

      return { answer: normalized };
    } catch (parseError) {
      console.warn('Failed to parse LLM JSON output:', parseError.message);
      console.warn('Raw answer was:', answer.substring(0, 500));
      return {
        answer: {
          insights: `### Analysis\nSuccessfully processed **${totalRows} rows** and **${columnCount} columns**.\n\n${columnSummaries.map(s => '- ' + s).join('\n')}`,
          metrics: [
            { label: 'Total Records', value: String(totalRows) },
            { label: 'Total Columns', value: String(columnCount) },
          ],
          charts: [],
        },
      };
    }
  } catch (error) {
    console.error('Data analysis failed:', error.message);
    throw error;
  }
}

module.exports = { analyzeDataWithLLM };
