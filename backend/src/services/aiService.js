const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'missing-key',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.novita.ai/v3/openai',
});

const MODEL_NAME = process.env.MODEL_NAME || 'openai/gpt-oss-120b';

async function generateWebsiteSpec(businessDetails) {
  const { name, industry, description, pages, feel, cta, fontStyle } = businessDetails;

  const pagesList = (pages && pages.length > 0 ? pages : ['home', 'about', 'services', 'contact']);
  const ctaLabel = cta || 'Get Started';

  const sectionSchemas = {
    home: `{ "headline": "...", "subheadline": "...", "ctaText": "${ctaLabel}" }`,
    hero: `{ "headline": "...", "subheadline": "...", "ctaText": "${ctaLabel}" }`,
    about: `{ "tagline": "...", "title": "...", "description": "...", "mission": "..." }`,
    services: `{ "tagline": "...", "title": "...", "description": "...", "items": [{"title":"...","description":"..."},{"title":"...","description":"..."},{"title":"...","description":"..."}] }`,
    features: `{ "tagline": "...", "title": "...", "description": "...", "items": [{"title":"...","description":"..."},{"title":"...","description":"..."},{"title":"...","description":"..."}] }`,
    portfolio: `{ "title": "...", "items": [{"title":"...","description":"..."},{"title":"...","description":"..."},{"title":"...","description":"..."}] }`,
    testimonials: `{ "title": "...", "items": [{"quote":"...","author":"...","role":"..."},{"quote":"...","author":"...","role":"..."}] }`,
    pricing: `{ "title": "...", "description": "...", "plans": [{"name":"Starter","price":"$29","description":"...","popular":false,"ctaText":"${ctaLabel}"},{"name":"Pro","price":"$79","description":"...","popular":true,"ctaText":"${ctaLabel}"},{"name":"Enterprise","price":"$199","description":"...","popular":false,"ctaText":"Contact Us"}] }`,
    products: `{ "title": "...", "description": "...", "plans": [{"name":"Basic","price":"$29","description":"...","popular":false,"ctaText":"Buy Now"},{"name":"Standard","price":"$79","description":"...","popular":true,"ctaText":"Buy Now"},{"name":"Premium","price":"$199","description":"...","popular":false,"ctaText":"Contact Us"}] }`,
    faq: `{ "title": "...", "items": [{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."}] }`,
    contact: `{ "title": "...", "email": "hello@example.com", "phone": "+1 (555) 000-0000", "address": "123 Main St, Your City" }`,
    footer: `{ "companyName": "${name}" }`,
    blog: `{ "title": "Latest Articles", "items": [{"title":"...","excerpt":"..."},{"title":"...","excerpt":"..."}] }`,
  };

  const prompt = `You are an expert AI website designer and copywriter.
Generate a complete website content specification for the following business:

Business Name: ${name}
Industry: ${industry}
${description ? `Context: ${description}` : ''}
${feel ? `Website personality/feel: ${feel}` : ''}
${fontStyle && fontStyle !== 'ai' ? `Font preference: ${fontStyle}` : ''}

Required pages (in order): ${pagesList.join(', ')}

Return a JSON array with exactly ${pagesList.length} section objects, one per required page.
The sections must appear in the exact order listed above.

Content schemas per section type:
${pagesList.map(p => `- "${p}": ${sectionSchemas[p] || '{ "title": "...", "description": "..." }'}`).join('\n')}

Rules:
1. Return ONLY a valid JSON array, no markdown, no commentary
2. All text content must be specific and compelling for this business, NOT generic placeholder text
3. Use vivid, professional language appropriate for the "${feel || 'professional'}" style
4. IDs must be sequential strings: "1", "2", "3", etc.
5. The "type" field must exactly match the required page name

Example output format:
[
  { "id": "1", "type": "${pagesList[0]}", "content": ${sectionSchemas[pagesList[0]] || '{ "title": "..." }'} }${pagesList.length > 1 ? `,
  { "id": "2", "type": "${pagesList[1]}", "content": ${sectionSchemas[pagesList[1]] || '{ "title": "..." }'} }` : ''}
]`;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: 'You are a JSON-only API. Output ONLY a valid JSON array with no markdown fences, no comments, and no extra text.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    let content = completion.choices[0].message.content.trim();
    // Strip markdown code fences if present
    if (content.startsWith('```')) {
      content = content.replace(/^```(json)?\s*/i, '').replace(/\s*```$/, '');
    }
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating website spec:', error);
    throw error;
  }
}

async function refineWebsiteSpec(currentSpec, instruction, context = {}) {
  const { currentTheme, currentFeel, chatHistory, businessName, siteImages } = context;
  const knownTypes = ['home', 'hero', 'about', 'services', 'features', 'portfolio', 'testimonials', 'pricing', 'products', 'faq', 'contact', 'footer', 'blog'];

  const sectionSchemas = {
    hero: `{ "headline": "...", "subheadline": "...", "ctaText": "...", "buttons": [{"text": "Get Started", "isSecondary": false}, {"text": "Book Call", "isSecondary": true}, {"text": "Watch Demo", "isSecondary": true}] }`,
    about: `{ "tagline": "...", "title": "...", "description": "...", "mission": "..." }`,
    services: `{ "tagline": "...", "title": "...", "description": "...", "items": [{"title":"...","description":"..."},{"title":"...","description":"..."}] }`,
    features: `{ "tagline": "...", "title": "...", "description": "...", "items": [{"title":"...","description":"..."},{"title":"...","description":"..."}] }`,
    pricing: `{ "title": "...", "description": "...", "plans": [{"name":"Starter","price":"$29","description":"...","popular":false,"ctaText":"Buy Now"},{"name":"Pro","price":"$79","description":"...","popular":true,"ctaText":"Buy Now"}] }`,
    products: `{ "title": "...", "description": "...", "plans": [{"name":"Basic","price":"$29","description":"...","popular":false,"ctaText":"Buy Now"}] }`,
    testimonials: `{ "title": "...", "items": [{"quote":"...","author":"...","role":"..."}] }`,
    faq: `{ "title": "...", "items": [{"question":"...","answer":"..."}] }`,
    portfolio: `{ "title": "...", "items": [{"title":"...","description":"..."}] }`,
    contact: `{ "title": "...", "email": "hello@example.com", "phone": "+1 (555) 000-0000", "address": "123 Main St" }`,
    footer: `{ "companyName": "${businessName || 'Company'}" }`
  };

  const systemPrompt = `You are Flow AI Bot, an all-powerful, autonomous website designer and front-end architect.
You have PRECISE CONTROL over every single aspect of the website canvas, including:
1. Section content & copy (headlines, text, buttons, CTA links, lists, items).
2. Canvas Floating Images (adding floating image layers, position xPercent (0-100), y pixels (0-2000), widthPercent (10-80), borderRadius (0-50), or deleting images).
3. Section background & text colors (bgColor: "#hexcode", textColor: "#hexcode").
4. Global Theme Palette (primary: "#hex", secondary: "#hex", background: "#hex").
5. Layout personality/feel ("professional", "minimal", "luxury", "friendly", "bold", "futuristic", "playful").

Tasks:
1. Interpret the user's instruction in light of the FULL conversation history.
   - If asked to modify copy/text, update headlines, titles, descriptions, buttons, etc.
   - If text values in currentSpec are styled objects like {"text": "...", "fontSize": 24, "fontFamily": "Inter"}, preserve the object structure and update the "text" field!
   - If asked to add extra buttons or multiple CTAs (e.g. 2, 3, 4, 5+ buttons), ALWAYS populate the "buttons" array in that section's content object with as many button objects as requested!
     Example: "buttons": [
       { "text": "Main CTA", "isSecondary": false },
       { "text": "Secondary CTA 1", "isSecondary": true },
       { "text": "Secondary CTA 2", "isSecondary": true },
       { "text": "Secondary CTA 3", "isSecondary": true }
     ]
   - If asked to change background to black and white or monochrome, return theme: {"primary": "#ffffff", "secondary": "#888888", "background": "#000000"} or {"primary": "#000000", "secondary": "#555555", "background": "#ffffff"} and set feel: "bold" or "minimal"!
   - If asked to change background color of a specific section, add "bgColor": "#hexcode" or "textColor": "#hexcode" inside that section's content object!
   - If asked to add, move, resize, or delete floating images, update the "siteImages" array: [{"id": "float-1", "url": "...", "xPercent": 60, "y": 100, "widthPercent": 25, "borderRadius": 12}].
   - If asked to add a new section, pick a valid section type (${knownTypes.join(', ')}) and use its schema below.
   - If asked to delete a section, remove it from the spec array.
   - If asked to reorder sections, change their array position.

Section Content Schemas:
${Object.entries(sectionSchemas).map(([k, v]) => `- "${k}": ${v}`).join('\n')}

Output Requirement:
Return ONLY a valid JSON object matching this exact structure (no markdown fences, no extra text):
{
  "spec": [
    {
      "id": "1",
      "type": "hero",
      "content": { ... }
    }
  ],
  "theme": { "primary": "#...", "secondary": "#...", "background": "#..." },
  "feel": "one of: professional, minimal, luxury, friendly, bold, futuristic",
  "siteImages": [
    { "id": "float-1", "url": "https://...", "xPercent": 60, "y": 100, "widthPercent": 25, "borderRadius": 12 }
  ],
  "summary": "Detailed summary of precise actions executed."
}`;

  // Format conversational history for Novita AI
  const historyMessages = (chatHistory || [])
    .filter(m => m.text && m.sender)
    .slice(-10)
    .map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.sender === 'assistant'
        ? (typeof m.text === 'string' ? m.text : 'Applied updates.')
        : String(m.text)
    }));

  const userTurnContent = `User Instruction: "${instruction}"

Current Layout Specification:
${JSON.stringify(currentSpec, null, 2)}

Current Floating Canvas Images:
${JSON.stringify(siteImages || [], null, 2)}

Current Theme Colors: ${JSON.stringify(currentTheme || { primary: '#d4f000', secondary: '#ffffff', background: '#080808' })}
Current Layout Personality/Feel: "${currentFeel || 'professional'}"`;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: userTurnContent }
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    let content = completion.choices[0].message.content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/^```(json)?\s*/i, '').replace(/\s*```$/, '');
    }
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed)) {
      return { spec: parsed, summary: 'Refined website layout successfully.' };
    }
    return {
      spec: parsed.spec || currentSpec,
      theme: parsed.theme,
      feel: parsed.feel,
      siteImages: parsed.siteImages !== undefined ? parsed.siteImages : siteImages,
      summary: parsed.summary || 'Refined website layout successfully.'
    };
  } catch (error) {
    console.error('Error refining website spec:', error);
    throw error;
  }
}

async function suggestBusinessProfile({ name, industry }) {
  const prompt = `You are a branding and startup copywriter expert.
Suggest a creative, high-converting business profile for this business:
Business Name: ${name}
Industry: ${industry}

You must return ONLY a JSON object matching this structure (no markdown fences, no extra text):
{
  "description": "A compelling 2-3 sentence business description.",
  "goal": "One of: leads, sell, services, portfolio, appointments, info",
  "audience": "A description of the target audience (e.g. Tech startups in USA, Local homeowners).",
  "cta": "One of: contact, buy, consult, quote, signup, call",
  "feel": "One of: professional, minimal, luxury, friendly, bold, futuristic",
  "themeId": "One of: dark, modern, brutalism, elegant, cyberpunk",
  "fontStyle": "One of: modern, elegant, bold, minimal",
  "differentiator": "A short, sharp statement explaining what makes the business unique."
}

Rules:
- The values for 'goal', 'cta', 'feel', 'themeId', and 'fontStyle' MUST be selected from the lists above.
- Make the description and differentiator very specific and catchy for the business.`;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: 'You are a JSON-only assistant. Output ONLY a valid JSON object and nothing else.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    let content = completion.choices[0].message.content.trim();
    if (content.startsWith('```')) {
      content = content.replace(/^```(json)?\s*/i, '').replace(/\s*```$/, '');
    }
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error suggesting business profile:', error);
    throw error;
  }
}

module.exports = { generateWebsiteSpec, refineWebsiteSpec, suggestBusinessProfile };
