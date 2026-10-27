(function (root) {
  'use strict';
  let locale = 'zh-CN';
  try { locale = new URLSearchParams(root.location.search).get('lang') === 'en' || root.localStorage.getItem('leo-portfolio-language') === 'en' ? 'en' : 'zh-CN'; } catch (_) {}
  let messages = {}, fragments = null;
  const listeners = new Set();
  const notify = () => listeners.forEach(callback => callback());
  function t(value) {
    if (typeof value !== 'string' || locale !== 'en' || !/[\u3400-\u9fff，。；：（）、]/.test(value)) return value;
    if (messages[value] !== undefined) return messages[value];
    return (fragments ? value.replace(fragments, key => messages[key]) : value)
      .replace(/(20\d{2})\s*年/g, '$1')
      .replace(/（/g, ' (').replace(/）/g, ')').replace(/：/g, ': ').replace(/、/g, ', ').replace(/，/g, ', ').replace(/。/g, '.').replace(/；/g, '; ');
  }
  function setLocale(next) { if (next !== 'en' && next !== 'zh-CN') return; locale = next; document.documentElement.lang = locale; notify(); }
  root.ZMD_I18N = { t, get locale() { return locale; }, onChange(callback) { listeners.add(callback); return () => listeners.delete(callback); } };
  root.addEventListener('message', event => {
    if (event.source === root.parent && event.origin === root.location.origin && event.data?.type === 'portfolio-language') setLocale(event.data.locale);
  });
  fetch('./messages.en.json').then(response => { if (!response.ok) throw new Error('Translation unavailable'); return response.json(); }).then(data => {
    messages = data;
    fragments = new RegExp(Object.keys(data).filter(key => key.trim() && !/^\s+[\u3400-\u9fff]\s*$/.test(key)).sort((a, b) => b.length - a.length).map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
    document.documentElement.lang = locale;
    notify();
  }).catch(() => {});
})(window);
