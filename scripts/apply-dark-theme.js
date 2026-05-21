/**
 * Bulk-apply dark: Tailwind classes (HomePage / Login zinc palette).
 * Skips lines that already contain "dark:" in the same attribute value when possible.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(js|jsx)$/.test(name) && !name.includes('.test.')) out.push(p);
  }
  return out;
}

function patch(content) {
  let c = content;

  const reps = [
    [/min-h-screen bg-stone-50(?! dark:bg)/g, 'min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors'],
    [
      /bg-white rounded-xl shadow-\[0px_8px_24px_0px_rgba\(0,0,0,0\.04\)\] outline outline-1 outline-offset-\[-0\.50px\] outline-gray-200/g,
      'bg-white dark:bg-zinc-900 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-800',
    ],
    [
      /bg-white rounded-xl outline outline-1 outline-offset-\[-1px\] outline-gray-200/g,
      'bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800',
    ],
    [
      /p-3 bg-white rounded-xl outline outline-1 outline-offset-\[-1px\] outline-gray-200/g,
      'p-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800',
    ],
    [
      /p-1\.5 bg-white rounded-lg outline outline-1 outline-offset-\[-1px\] outline-gray-200/g,
      'p-1.5 bg-white dark:bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800',
    ],
    [
      /self-stretch bg-stone-50 rounded-xl outline outline-1 outline-offset-\[-1px\] outline-gray-200/g,
      'self-stretch bg-stone-50 dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800',
    ],
    [
      /block md:hidden w-full max-w-md mx-auto min-h-screen bg-stone-50 relative/g,
      'block md:hidden w-full max-w-md mx-auto min-h-screen bg-stone-50 dark:bg-zinc-950 relative transition-colors',
    ],
    [/rounded-xl border border-gray-200 bg-white/g, 'rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'],
    [/border border-gray-200 bg-white/g, 'border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'],
    [/border-b border-gray-200 bg-stone-50/g, 'border-b border-gray-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900'],
    [/divide-y divide-gray-100/g, 'divide-y divide-gray-100 dark:divide-zinc-800'],
    [/border-t border-gray-100/g, 'border-t border-gray-100 dark:border-zinc-800'],
    [/border-b border-gray-100/g, 'border-b border-gray-100 dark:border-zinc-800'],
    [/inline-flex flex-wrap gap-1 rounded-xl bg-stone-100 p-1/g, 'inline-flex flex-wrap gap-1 rounded-xl bg-stone-100 dark:bg-zinc-800 p-1'],
    [
      /bg-white text-black shadow-sm ring-1 ring-gray-200\/80/g,
      'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm ring-1 ring-gray-200/80 dark:ring-zinc-700',
    ],
    [/hover:bg-stone-50(?!\/)/g, 'hover:bg-stone-50 dark:hover:bg-zinc-800'],
    [/hover:bg-stone-50\/80/g, 'hover:bg-stone-50/80 dark:hover:bg-zinc-800/80'],
    [/bg-stone-50\/60/g, 'bg-stone-50/60 dark:bg-zinc-800/60'],
    [/bg-stone-50\/80/g, 'bg-stone-50/80 dark:bg-zinc-900/80'],
    [/bg-stone-100 text-stone/g, 'bg-stone-100 dark:bg-zinc-800 text-stone'],
    [/\bbg-gray-200\b(?! dark:)/g, 'bg-gray-200 dark:bg-zinc-700'],
    [/\btext-neutral-400\b(?! dark:)/g, 'text-neutral-400 dark:text-zinc-400'],
    [/\btext-neutral-500\b(?! dark:)/g, 'text-neutral-500 dark:text-zinc-400'],
    [/\btext-neutral-600\b(?! dark:)/g, 'text-neutral-600 dark:text-zinc-400'],
    [/\btext-neutral-700\b(?! dark:)/g, 'text-neutral-700 dark:text-zinc-300'],
    [/\btext-neutral-800\b(?! dark:)/g, 'text-neutral-800 dark:text-zinc-200'],
    [/\btext-black\b(?! dark:text)/g, 'text-black dark:text-white'],
    [/\bbg-white\b(?! dark:bg)/g, 'bg-white dark:bg-zinc-900'],
    [
      /outline outline-1 outline-offset-\[-1px\] outline-gray-200(?! dark:)/g,
      'outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800',
    ],
    [
      /outline outline-1 outline-offset-\[-0\.50px\] outline-gray-200(?! dark:)/g,
      'outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-800',
    ],
    [
      /rounded-lg border border-gray-200 bg-white/g,
      'rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800',
    ],
    [
      /rounded-lg border border-gray-200 px-3/g,
      'rounded-lg border border-gray-200 dark:border-zinc-700 px-3',
    ],
    [
      /w-8 h-8 rounded-lg border border-gray-200 flex/g,
      'w-8 h-8 rounded-lg border border-gray-200 dark:border-zinc-700 flex',
    ],
    [
      /border border-gray-200 text-sm font-semibold font-\['Manrope'\] hover:bg-stone-50/g,
      "border border-gray-200 dark:border-zinc-700 text-sm font-semibold font-['Manrope'] hover:bg-stone-50 dark:hover:bg-zinc-800",
    ],
    [
      /: 'border border-gray-200 text-neutral-600 hover:bg-stone-50'/g,
      ": 'border border-gray-200 dark:border-zinc-700 text-neutral-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800'",
    ],
    [
      /px-3 py-2 bg-white flex justify-center/g,
      'px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center',
    ],
    [
      /p-3 bg-stone-50 rounded-lg/g,
      'p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg',
    ],
    [
      /w-full px-3 py-2 bg-white text-neutral-400/g,
      'w-full px-3 py-2 bg-white dark:bg-zinc-900 text-neutral-400 dark:text-zinc-500',
    ],
    [
      /opacity-70" \/>/g,
      'opacity-70 dark:invert" />',
    ],
  ];

  for (const [re, repl] of reps) {
    c = c.replace(re, repl);
  }

  // Fix double dark: from re-running
  c = c.replace(/dark:bg-zinc-900 dark:bg-zinc-900/g, 'dark:bg-zinc-900');
  c = c.replace(/dark:text-white dark:text-white/g, 'dark:text-white');
  c = c.replace(/dark:outline-zinc-800 dark:outline-zinc-800/g, 'dark:outline-zinc-800');
  c = c.replace(/dark:invert dark:invert/g, 'dark:invert');
  c = c.replace(/transition-colors transition-colors/g, 'transition-colors');

  return c;
}

const files = walk(SRC);
let changed = 0;
for (const file of files) {
  const before = fs.readFileSync(file, 'utf8');
  const after = patch(before);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed++;
    console.log('updated:', path.relative(SRC, file));
  }
}
console.log(`Done. ${changed} files updated.`);
