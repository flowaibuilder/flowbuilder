const { Groq } = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'missing-key',
});

// Using the model the user provided
const MODEL_NAME = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

async function generateWebsiteSpec(businessDetails) {
  const prompt = `You are an expert AI website designer.
Create a website layout specification for this business:
Name: ${businessDetails.name}
Industry: ${businessDetails.industry}
Description: ${businessDetails.description}

You must return ONLY a JSON array of section objects. 
Allowed section types are 'hero', 'features', 'pricing', 'footer'. 
Provide relevant, catchy 'content' for each section.

Example format:
[
  {
    "id": "1",
    "type": "hero",
    "content": {
      "headline": "...",
      "subheadline": "...",
      "ctaText": "..."
    }
  }
]`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: 'You are a JSON-only API. You must output a valid JSON array and nothing else.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating website spec:', error);
    throw error;
  }
}

async function refineWebsiteSpec(currentSpec, instruction) {
  const prompt = `You are an expert AI website designer.
The user has an existing website layout specification and wants to make changes to it.
Instruction: "${instruction}"

Current Specification:
${JSON.stringify(currentSpec, null, 2)}

Modify the current specification according to the instruction. 
You must return ONLY a JSON array of section objects. 
Keep the exact same format and section types ('hero', 'features', 'pricing', 'footer').
Make sure to keep the "id" fields exactly the same for existing sections, unless you are removing them.

Example format:
[
  {
    "id": "1",
    "type": "hero",
    "content": { ... }
  }
]`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: 'You are a JSON-only API. You must output a valid JSON array and nothing else.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error refining website spec:', error);
    throw error;
  }
}

module.exports = { generateWebsiteSpec, refineWebsiteSpec };
