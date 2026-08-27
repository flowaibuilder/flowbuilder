require('dotenv').config();
const { Groq } = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  try {
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: 'You are an expert Data Analyst that only outputs valid JSON.' },
        { role: 'user', content: 'Hello, please output a JSON with a test message.' }
      ],
      temperature: 0.1,
    });
    console.log("Response:", completion.choices[0].message.content);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
