import { readFileSync, writeFileSync } from 'node:fs';
const src = readFileSync(process.argv[2], 'utf8');
const out = [];
const re = /(['"])((?:\\.|(?!\1)[^\\])*)\1/g;
let m;
while ((m = re.exec(src))) {
  const s = m[2];
  if (/[\u4e00-\u9fff]/.test(s) && s.length > 3) out.push(s);
}
const uniq = [...new Set(out)];
writeFileSync(process.argv[3], uniq.map((s, i) => i + '\t' + s).join('\n\n'), 'utf8');
console.log('count', uniq.length);
