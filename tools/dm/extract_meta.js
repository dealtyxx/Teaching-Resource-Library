// 从各页面提取 window.SECTION_META 对象字面量（容忍 JS 字面量写法），输出 JSON：{ 相对路径: { meta } }
// 用法：node extract_meta.js <站点目录> <输出.json>
const fs = require('fs'), path = require('path'), vm = require('vm');

function walk(d, out = []) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    f.isDirectory() ? walk(p, out) : p.endsWith('.html') && out.push(p);
  }
  return out;
}

// 从 key 之后的第一个 "{" 起，按括号配对（跳过字符串与注释）截取对象字面量
function extract(text, key) {
  const i = text.indexOf(key);
  if (i < 0) return null;
  const start = text.indexOf('{', i);
  let depth = 0, quote = null, escaped = false, k = start;
  for (; k < text.length; k++) {
    const c = text[k];
    if (quote) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '/' && text[k + 1] === '/') { k = text.indexOf('\n', k); if (k < 0) break; continue; }
    if (c === '/' && text[k + 1] === '*') { k = text.indexOf('*/', k) + 1; continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) { k++; break; }
  }
  return text.slice(start, k);
}

const root = path.resolve(process.argv[2]), out = {};
for (const file of walk(root).sort()) {
  const literal = extract(fs.readFileSync(file, 'utf8'), 'window.SECTION_META');
  if (!literal) continue;
  const rel = path.relative(root, file).split(path.sep).join('/');
  try { out[rel] = { meta: vm.runInNewContext('(' + literal + ')') }; }
  catch (e) { out[rel] = { error: String(e) }; }
}
fs.writeFileSync(process.argv[3], JSON.stringify(out));
console.log(Object.keys(out).length, 'metas;', Object.values(out).filter(v => v.error).length, 'errors');
