/**
 * Pyodide Web Worker（classic worker）
 * - 主线程 UI 永不阻塞；死循环可由主线程 terminate 兜底
 * - 协议：
 *   收 { type:'run', id, code, packages?: string[] }
 *   发 { type:'status', id, text }        —— 加载进度
 *     { type:'stream', id, text }         —— stdout/stderr 增量
 *     { type:'done', id }                 —— 运行结束
 *     { type:'error', id, text, offline } —— 出错（offline=true 表示 CDN 加载失败）
 */
const PYODIDE_VERSION = 'v0.26.4';
const CDN = 'https://cdn.jsdelivr.net/pyodide/' + PYODIDE_VERSION + '/full/';

let pyodideReady = null;
const loadedPackages = new Set();

function boot(id) {
  if (pyodideReady) return pyodideReady;
  pyodideReady = (async () => {
    postMessage({ type: 'status', id, text: '正在加载 Python 运行环境（约 10 MB，首次较慢）…' });
    try {
      importScripts(CDN + 'pyodide.js');
    } catch (e) {
      pyodideReady = null;
      const err = new Error('OFFLINE');
      err.offline = true;
      throw err;
    }
    const py = await self.loadPyodide({ indexURL: CDN });
    return py;
  })();
  pyodideReady.catch(() => { pyodideReady = null; });
  return pyodideReady;
}

self.onmessage = async (ev) => {
  const { type, id, code, packages } = ev.data || {};
  if (type !== 'run') return;
  try {
    const py = await boot(id);

    if (Array.isArray(packages) && packages.length) {
      const need = packages.filter((p) => !loadedPackages.has(p));
      if (need.length) {
        postMessage({ type: 'status', id, text: '正在加载扩展库：' + need.join('、') + ' …' });
        await py.loadPackage(need);
        need.forEach((p) => loadedPackages.add(p));
      }
    }

    py.setStdout({ batched: (s) => postMessage({ type: 'stream', id, text: s }) });
    py.setStderr({ batched: (s) => postMessage({ type: 'stream', id, text: s }) });
    await py.runPythonAsync(code);
    postMessage({ type: 'done', id });
  } catch (err) {
    if (err && err.offline) {
      postMessage({ type: 'error', id, offline: true, text: '无法加载 Python 运行环境（需要联网）。' });
      return;
    }
    const msg = String((err && err.message) || err);
    const tail = msg.split('\n').filter(Boolean).slice(-6).join('\n');
    postMessage({ type: 'error', id, offline: false, text: tail });
  }
};
