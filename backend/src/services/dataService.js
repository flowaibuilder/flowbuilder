const { Groq } = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'missing-key',
});

const MODEL_NAME = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

async function analyzeDataWithLLM(csvContent, userQuery) {
  // Pass the CSV directly to the LLM
  const prompt = `You are a Data Analyst and Visualization Expert. The user has provided the following CSV data:

${csvContent}

User Query: "${userQuery}"

Analyze the data and answer the user's query by providing a JSON object with the following strict structure:
{
  "metrics": [
    { "label": "string (e.g. Total Units)", "value": "string or number" }
  ],
  "charts": [
    {
      "title": "string (e.g. Top 5 Items)",
      "type": "bar", // must be "bar" or "pie"
      "data": [
        { "name": "string", "value": number }
      ]
    }
  ],
  "insights": "string containing a markdown formatted summary of your findings and recommendations"
}

You MUST return ONLY valid JSON and absolutely no other text, comments, or markdown code blocks (do not wrap in \`\`\`json).`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: 'You are an expert Data Analyst that only outputs valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
    });

    let answer = completion.choices[0].message.content;
    
    // Clean markdown if present just in case
    if (answer.startsWith('```')) {
      answer = answer.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
    }

    try {
      const parsed = JSON.parse(answer);
      return { answer: parsed };
    } catch (parseError) {
      // Fallback if LLM failed to return valid JSON
      console.warn("Failed to parse LLM JSON output. Returning raw text.");
      return { answer: { insights: answer, metrics: [], charts: [] } };
    }
  } catch (error) {
    console.error('Data analysis failed:', error);
    throw error;
  }
}

module.exports = { analyzeDataWithLLM };
