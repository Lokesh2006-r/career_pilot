const fs = require('fs');
const path = require('path');
const controllersDir = 'e:/Projects/student ai twin/server/src/controllers';
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.ts') && !['ai-tools.controller.ts', 'chat.controller.ts'].includes(f));
for (const file of files) {
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  if (content.includes(import { GoogleGenAI } from '@google/genai';)) {
    content = content.replace(import { GoogleGenAI } from '@google/genai';, import { generateContentWithFallback } from '../utils/gemini';);
    changed = true;
  }
  const initRegex = /const\s+ai\s*=\s*new\s+GoogleGenAI\(\{\s*apiKey:\s*process\.env\.GEMINI_API_KEY\s*\|\|\s*''\s*\}\);\r?\n?/g;
  if (initRegex.test(content)) {
    content = content.replace(initRegex, '');
    changed = true;
  }
  const generateRegex = /ai\.models\.generateContent\(/g;
  if (generateRegex.test(content)) {
    content = content.replace(generateRegex, 'generateContentWithFallback(');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated ' + file);
  }
}
