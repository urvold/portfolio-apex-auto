import { readdir, readFile } from 'node:fs/promises';
import { extname, join, basename } from 'node:path';

const ignored = new Set(['node_modules', 'dist', '.ssr', 'artifacts', '.git']);
const textExtensions = new Set(['.ts', '.tsx', '.css', '.html', '.mjs', '.json', '.md', '.txt', '.yml', '.yaml', '.py']);
const rules = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['GitHub credential', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/],
  ['AWS access identifier', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['API credential', /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/],
  ['credential in URL', /https?:\/\/[^\s/@:]+:[^\s/@]+@/],
  ['literal credential assignment', /(?:api[_-]?key|access[_-]?token|password|client[_-]?secret)\s*[:=]\s*["'][A-Za-z0-9_./+=-]{16,}["']/i],
];
const findings = [];
let inspected = 0;
async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const file = join(dir, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symlink in publication inputs: ${file}`);
    if (entry.isDirectory()) { await scan(file); continue; }
    if (/^(?:\.env(?:\..*)?|id_rsa|id_ed25519|credentials)$/i.test(entry.name) && entry.name !== '.env.example') {
      findings.push({ file, rule: 'sensitive filename' });
    }
    if (/\.(?:pem|key|p12|pfx)$/i.test(entry.name)) findings.push({ file, rule: 'key material filename' });
    if (!textExtensions.has(extname(file)) && !['.gitignore', '.nojekyll'].includes(basename(file))) continue;
    const text = await readFile(file, 'utf8');
    inspected++;
    for (const [name, pattern] of rules) {
      if (pattern.test(text)) findings.push({ file, rule: name });
    }
  }
}
await scan('.');
// Report filenames and rule names only; never print matched credential values.
console.log(JSON.stringify({ inspectedTextFiles: inspected, findings }, null, 2));
if (findings.length) process.exitCode = 1;
