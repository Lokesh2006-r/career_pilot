const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(dirPath);
  });
}

function stripAiStyles(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Remove all custom shadows like shadow-[0_10px_...]
  content = content.replace(/\bshadow-\[[^\]]+\]\s*/g, '');
  content = content.replace(/\bhover:shadow-\[[^\]]+\]\s*/g, '');
  content = content.replace(/\bdark:shadow-\[[^\]]+\]\s*/g, '');
  content = content.replace(/\bhover:dark:shadow-\[[^\]]+\]\s*/g, '');

  // 2. Remove default tailwind shadows
  content = content.replace(/\bshadow-(sm|md|lg|xl|2xl|inner|none)\s*/g, '');
  content = content.replace(/\bhover:shadow-(sm|md|lg|xl|2xl|inner|none)\s*/g, '');
  content = content.replace(/\bshadow\s+/g, ' '); // bare 'shadow' class

  // 3. Remove float hover effects
  content = content.replace(/\bhover:-translate-y-[\d\.]+\s*/g, '');
  content = content.replace(/\bhover:scale-[\d\.]+\s*/g, '');
  content = content.replace(/\bactive:scale-[\d\.]+\s*/g, '');

  // 4. Replace 3-color gradients (from-via-to)
  content = content.replace(/\bbg-gradient-to-[a-z]{1,2}\s+from-[a-z]+-\d+\s+via-[a-z]+-\d+\s+to-[a-z]+-\d+\s*/g, 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 ');

  // 5. Replace 2-color gradients (from-to)
  content = content.replace(/\bbg-gradient-to-[a-z]{1,2}\s+from-[a-z]+-\d+\s+to-[a-z]+-\d+\s*/g, 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 ');
  
  // 6. Replace hover gradients
  content = content.replace(/\bhover:from-[a-z]+-\d+\s+hover:to-[a-z]+-\d+\s*/g, 'hover:bg-zinc-800 dark:hover:bg-zinc-200 ');
  content = content.replace(/\bhover:from-[a-z]+-\d+\s+hover:via-[a-z]+-\d+\s+hover:to-[a-z]+-\d+\s*/g, 'hover:bg-zinc-800 dark:hover:bg-zinc-200 ');

  // 7. Cleanup multiple spaces that might result from stripping (preserving newlines)
  content = content.replace(/[ \t]{2,}/g, ' ');

  // 8. Fix empty className attributes resulting from stripping
  content = content.replace(/className="\s+"/g, 'className=""');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

console.log("Starting style stripping...");
walkDir(path.join(__dirname, 'src'), stripAiStyles);
console.log("Done.");
