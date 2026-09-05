/* =====================================================================
   API Mock Generator Pro — app.js
   Generate realistic fake JSON records from a hand-written type-spec or
   an inferred example object. Classic script (no modules).
   Depends on window.WUS (core.js). No network calls, no dependencies.
   ===================================================================== */
(function () {
  'use strict';

  var WUS = window.WUS;
  var STORE_KEY = 'apimock.state';

  /* ----------------------------- DOM refs ---------------------------- */
  var schemaInput   = document.getElementById('schemaInput');
  var outputCode    = document.getElementById('outputCode');
  var emptyState    = document.getElementById('emptyState');
  var countInput    = document.getElementById('countInput');

  var tabTypeSpec   = document.getElementById('tabTypeSpec');
  var tabExample    = document.getElementById('tabExample');
  var inputPaneTitle= document.getElementById('inputPaneTitle');
  var btnInfer      = document.getElementById('btnInfer');

  var statusBadge   = document.getElementById('statusBadge');
  var statusText    = document.getElementById('statusText');

  var errorPanel    = document.getElementById('errorPanel');
  var errorMsg      = document.getElementById('errorMsg');

  var actionsBar    = document.getElementById('actionsBar');
  var outputStats   = document.getElementById('outputStats');
  var statFields    = document.getElementById('statFields');
  var statRecords   = document.getElementById('statRecords');

  var lastOutput = '';
  var lastSchema = null; // parsed/inferred type-spec used for the last generation
  var mode = 'typespec'; // 'typespec' | 'example'

  /* =================================================================
     DATA BANKS — hand-built, no external faker library
     ================================================================= */
  var FIRST_NAMES = [
    'Ada','Grace','Alan','Linus','Margaret','Donald','Barbara','Dennis','Karen','Ken',
    'Radia','Vint','Tim','Brian','John','Katherine','Hedy','Claude','Edsger','Frances',
    'Steve','Bill','Elon','Satya','Sundar','Lisa','Marissa','Sheryl','Jack','Larry',
    'Marc','Kai','Nina','Omar','Priya','Yusuf','Elena','Noah','Mia','Leo'
  ];
  var LAST_NAMES = [
    'Lovelace','Hopper','Turing','Torvalds','Hamilton','Knuth','Liskov','Ritchie','Sparks','Thompson',
    'Perlman','Cerf','Berners-Lee','Kernighan','Carmack','Johnson','Lamarr','Shannon','Dijkstra','Allen',
    'Jobs','Gates','Musk','Nadella','Pichai','Su','Mayer','Sandberg','Dorsey','Page',
    'Benioff','Fu','Petrova','Haddad','Sharma','Demir','Volkov','Kim','Rossi','Silva'
  ];
  var WORDS = [
    'quantum','cascade','vector','harbor','ember','lattice','nimbus','cobalt','falcon','meridian',
    'orbit','pixel','summit','tundra','velocity','wander','zenith','anchor','beacon','cipher',
    'delta','echo','fusion','glacier','horizon','ion','jungle','kernel','lumen','matrix'
  ];
  var DOMAINS = ['example.com','mailbox.dev','workhub.io','cloudnest.net','datapoint.co','swiftmail.org','coreapp.dev','pixelforge.io'];
  var CITIES = ['Austin','Berlin','Lisbon','Nairobi','Osaka','Toronto','Warsaw','Lima','Hanoi','Perth'];
  var TLDS_PATH = ['docs','api','blog','status','app','dashboard','login','pricing'];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function randFloat(min, max, decimals) {
    var v = Math.random() * (max - min) + min;
    var d = decimals == null ? 2 : decimals;
    return Number(v.toFixed(d));
  }
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function fakeFirstName() { return pick(FIRST_NAMES); }
  function fakeLastName() { return pick(LAST_NAMES); }
  function fakeFullName() { return fakeFirstName() + ' ' + fakeLastName(); }
  function fakeEmail() {
    var f = fakeFirstName().toLowerCase();
    var l = fakeLastName().toLowerCase().replace(/[^a-z]/g, '');
    return f + '.' + l + (Math.random() < 0.3 ? randInt(1, 99) : '') + '@' + pick(DOMAINS);
  }
  function fakeWord() { return pick(WORDS); }
  function fakeSentence() {
    var len = randInt(6, 11);
    var words = [];
    for (var i = 0; i < len; i++) words.push(fakeWord());
    return capitalize(words.join(' ')) + '.';
  }
  function fakeParagraph() {
    var sentences = randInt(3, 5);
    var out = [];
    for (var i = 0; i < sentences; i++) out.push(fakeSentence());
    return out.join(' ');
  }
  function fakeUuid() {
    if (window.crypto && crypto.getRandomValues) {
      var bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      var hex = [];
      for (var i = 0; i < 16; i++) hex.push(bytes[i].toString(16).padStart(2, '0'));
      return hex.slice(0, 4).join('') + '-' + hex.slice(4, 6).join('') + '-' + hex.slice(6, 8).join('') + '-' + hex.slice(8, 10).join('') + '-' + hex.slice(10, 16).join('');
    }
    var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return template.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  function fakeUrl() { return 'https://' + pick(DOMAINS) + '/' + pick(TLDS_PATH); }
  function fakePhone() {
    return '+1-' + randInt(200, 999) + '-' + randInt(100, 999) + '-' + randInt(1000, 9999);
  }
  function fakeDate() {
    var d = new Date(Date.now() - randInt(0, 365 * 5) * 86400000);
    return d.toISOString().slice(0, 10);
  }
  function fakeDatetime() {
    var d = new Date(Date.now() - randInt(0, 365 * 5) * 86400000 - randInt(0, 86400) * 1000);
    return d.toISOString();
  }
  function fakeCity() { return pick(CITIES); }
  function fakeBoolean() { return Math.random() < 0.5; }
  function fakeNumber() { return randInt(1, 10000); }

  /* =================================================================
     SCALAR TYPE RESOLUTION — maps a type token to a generator function
     ================================================================= */
  function scalarGenerator(rawType) {
    var t = String(rawType).trim().toLowerCase();
    switch (t) {
      case 'string': return fakeWord;
      case 'number': return fakeNumber;
      case 'int':
      case 'integer': return function () { return randInt(1, 10000); };
      case 'float':
      case 'decimal': return function () { return randFloat(0, 1000, 2); };
      case 'boolean':
      case 'bool': return fakeBoolean;
      case 'email': return fakeEmail;
      case 'name':
      case 'fullname': return fakeFullName;
      case 'firstname': return fakeFirstName;
      case 'lastname': return fakeLastName;
      case 'date': return fakeDate;
      case 'datetime': return fakeDatetime;
      case 'uuid': return fakeUuid;
      case 'url': return fakeUrl;
      case 'phone': return fakePhone;
      case 'city': return fakeCity;
      case 'word': return fakeWord;
      case 'sentence': return fakeSentence;
      case 'paragraph': return fakeParagraph;
      case 'null': return function () { return null; };
      default: return fakeWord;
    }
  }

  /* =================================================================
     GENERATOR — walk a type-spec (object / array / string token) and
     produce one fake value matching its shape.
     ================================================================= */
  function generateFromSpec(spec) {
    if (Array.isArray(spec)) {
      if (spec.length === 0) return [];
      var n = randInt(2, 5);
      var out = [];
      for (var i = 0; i < n; i++) out.push(generateFromSpec(spec[0]));
      return out;
    }
    if (spec && typeof spec === 'object') {
      var obj = {};
      Object.keys(spec).forEach(function (key) {
        obj[key] = generateFromSpec(spec[key]);
      });
      return obj;
    }
    if (typeof spec === 'string') {
      var m = /^(.*)\[\]$/.exec(spec.trim());
      if (m) {
        var elType = m[1];
        var count = randInt(1, 5);
        var gen = scalarGenerator(elType);
        var arr = [];
        for (var j = 0; j < count; j++) arr.push(gen());
        return arr;
      }
      return scalarGenerator(spec)();
    }
    return null;
  }

  function generateRecords(spec, count) {
    var records = [];
    for (var i = 0; i < count; i++) records.push(generateFromSpec(spec));
    return records;
  }

  /* =================================================================
     INFERENCE — derive a type-spec from a real example object
     ================================================================= */
  var RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  var RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var RE_URL = /^https?:\/\/[^\s]+$/i;
  var RE_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  var RE_DATE = /^\d{4}-\d{2}-\d{2}$/;

  function keyHeuristic(keyName) {
    var k = String(keyName || '');
    if (/email/i.test(k)) return 'email';
    if (/^id$|_id$|Id$/.test(k)) return 'uuid';
    if (/name/i.test(k)) return 'name';
    if (/(date|_at$|At$|time)/i.test(k)) return 'date';
    if (/(url|link|website)/i.test(k)) return 'url';
    return null;
  }

  function inferSpec(value, keyName) {
    if (Array.isArray(value)) {
      if (value.length === 0) return ['string'];
      return [inferSpec(value[0], keyName)];
    }
    if (value !== null && typeof value === 'object') {
      var out = {};
      Object.keys(value).forEach(function (k) { out[k] = inferSpec(value[k], k); });
      return out;
    }
    if (typeof value === 'string') {
      if (RE_UUID.test(value)) return 'uuid';
      if (RE_EMAIL.test(value)) return 'email';
      if (RE_URL.test(value)) return 'url';
      if (RE_DATETIME.test(value)) return 'datetime';
      if (RE_DATE.test(value)) return 'date';
      // Value itself doesn't look like a recognizable type — fall back to
      // a key-name heuristic (a field called "name"/"id"/"date"/"url"...)
      // before defaulting to a generic string.
      return keyHeuristic(keyName) || 'string';
    }
    if (typeof value === 'number') return Number.isInteger(value) ? 'number' : 'float';
    if (typeof value === 'boolean') return 'boolean';
    // null / undefined — can't infer from the value alone, try the key name.
    return keyHeuristic(keyName) || 'string';
  }

  /* =================================================================
     STATS — count fields (top-level keys of the resolved shape) + bytes
     ================================================================= */
  function countFields(spec) {
    if (Array.isArray(spec)) return spec.length ? countFields(spec[0]) : 0;
    if (spec && typeof spec === 'object') return Object.keys(spec).length;
    return 1;
  }
  function humanBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(2) + ' MB';
  }
  function byteLength(str) {
    try { return new Blob([str]).size; } catch (e) { return new TextEncoder().encode(str).length; }
  }

  /* =================================================================
     SYNTAX HIGHLIGHTING (same tokenizer approach as other suite apps)
     ================================================================= */
  function highlight(jsonText) {
    var re = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}\[\],:])/g;
    var out = '';
    var lastIndex = 0;
    var m;
    while ((m = re.exec(jsonText)) !== null) {
      if (m.index > lastIndex) out += WUS.escapeHtml(jsonText.slice(lastIndex, m.index));
      lastIndex = re.lastIndex;
      if (m[1] !== undefined) {
        var isKey = m[2] !== undefined;
        out += '<span class="' + (isKey ? 'tok-key' : 'tok-string') + '">' + WUS.escapeHtml(m[1]) + '</span>';
        if (isKey) out += '<span class="tok-punct">' + WUS.escapeHtml(m[2]) + '</span>';
      } else if (m[3] !== undefined) {
        out += '<span class="tok-boolean">' + m[3] + '</span>';
      } else if (m[4] !== undefined) {
        out += '<span class="tok-null">' + m[4] + '</span>';
      } else if (m[5] !== undefined) {
        out += '<span class="tok-number">' + WUS.escapeHtml(m[5]) + '</span>';
      } else if (m[6] !== undefined) {
        var cls = (m[6] === '{' || m[6] === '}' || m[6] === '[' || m[6] === ']') ? 'tok-brace' : 'tok-punct';
        out += '<span class="' + cls + '">' + WUS.escapeHtml(m[6]) + '</span>';
      }
    }
    if (lastIndex < jsonText.length) out += WUS.escapeHtml(jsonText.slice(lastIndex));
    return out;
  }

  /* =================================================================
     STATUS / UI helpers
     ================================================================= */
  function setStatus(state, text) {
    statusBadge.classList.remove('is-valid', 'is-error');
    if (state === 'valid') statusBadge.classList.add('is-valid');
    else if (state === 'error') statusBadge.classList.add('is-error');
    statusText.textContent = text;
  }

  function showError(message) {
    errorMsg.textContent = message;
    errorPanel.hidden = false;
    actionsBar.hidden = true;
    setStatus('error', 'Invalid schema');
  }
  function clearError() { errorPanel.hidden = true; }

  function renderOutput(records, spec) {
    var text = JSON.stringify(records, null, 2);
    lastOutput = text;
    outputCode.innerHTML = highlight(text);
    emptyState.classList.add('is-hidden');

    var bytes = byteLength(text);
    outputStats.textContent = records.length + ' record' + (records.length === 1 ? '' : 's') + ' · ' + humanBytes(bytes);

    statFields.textContent = countFields(spec);
    statRecords.textContent = records.length;
    actionsBar.hidden = false;
  }

  function clearOutput() {
    lastOutput = '';
    outputCode.textContent = '';
    emptyState.classList.remove('is-hidden');
    outputStats.textContent = '';
    actionsBar.hidden = true;
  }

  /* =================================================================
     CORE ACTIONS
     ================================================================= */
  function parseSchemaText() {
    var text = schemaInput.value.trim();
    if (!text) throw new Error('Schema is empty — write a type-spec or example object first.');
    var value;
    try { value = JSON.parse(text); }
    catch (e) { throw new Error('That isn\u2019t valid JSON: ' + e.message); }
    if (value === null || typeof value !== 'object') {
      throw new Error('Schema must be a JSON object, e.g. {"id":"number","name":"string"}');
    }
    return value;
  }

  function resolveSpec() {
    var parsed = parseSchemaText();
    if (mode === 'example') return inferSpec(parsed);
    return parsed; // already a type-spec
  }

  function currentCount() {
    var n = parseInt(countInput.value, 10);
    if (!Number.isFinite(n) || n < 1) n = 1;
    if (n > 500) n = 500;
    countInput.value = n;
    return n;
  }

  function generate() {
    try {
      var spec = resolveSpec();
      lastSchema = spec;
      var count = currentCount();
      var records = generateRecords(spec, count);
      clearError();
      renderOutput(records, spec);
      setStatus('valid', 'Generated');
      WUS.toast('Generated ' + count + ' record' + (count === 1 ? '' : 's'));
    } catch (err) {
      showError(err.message);
      WUS.toast('Could not generate — see error panel', 'error');
    }
    persist();
  }

  function regenerate() {
    if (!lastSchema) { generate(); return; }
    var count = currentCount();
    var records = generateRecords(lastSchema, count);
    renderOutput(records, lastSchema);
    setStatus('valid', 'Regenerated');
    WUS.toast('Regenerated');
  }

  function inferAndFill() {
    try {
      var example = parseSchemaText();
      var spec = inferSpec(example);
      schemaInput.value = JSON.stringify(spec, null, 2);
      setMode('typespec'); // the textarea now holds a type-spec, not an example
      clearError();
      WUS.toast('Schema inferred — now editable');
      generate();
    } catch (err) {
      showError(err.message);
      WUS.toast('Could not infer schema', 'error');
    }
  }

  function copyOutput() {
    if (!lastOutput) { WUS.toast('No output to copy yet', 'error'); return; }
    WUS.copy(lastOutput, 'Output copied to clipboard');
  }

  function downloadOutput() {
    if (!lastOutput) { WUS.toast('Nothing to download', 'error'); return; }
    var name = 'mock-data-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.json';
    WUS.download(name, lastOutput, 'application/json;charset=utf-8');
    WUS.toast('Downloaded ' + name);
  }

  /* ------------------------------ Mode -------------------------------- */
  var TYPE_SPEC_SAMPLE = {
    id: 'uuid',
    name: 'name',
    email: 'email',
    active: 'boolean',
    signupDate: 'date',
    tags: 'string[]',
    address: { city: 'city', zip: 'number' }
  };
  var EXAMPLE_SAMPLE = {
    id: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
    name: 'Ada Lovelace',
    email: 'ada.lovelace@example.com',
    active: true,
    signupDate: '2024-03-14',
    tags: ['engineer', 'admin'],
    address: { city: 'Austin', zip: 73301 }
  };

  function setMode(next) {
    mode = next;
    var isExample = mode === 'example';
    tabTypeSpec.classList.toggle('is-active', !isExample);
    tabTypeSpec.setAttribute('aria-selected', String(!isExample));
    tabExample.classList.toggle('is-active', isExample);
    tabExample.setAttribute('aria-selected', String(isExample));
    inputPaneTitle.textContent = isExample ? 'Example object' : 'Type-spec';
    btnInfer.hidden = !isExample;
    persist();
  }

  function loadSample() {
    if (mode === 'example') schemaInput.value = JSON.stringify(EXAMPLE_SAMPLE, null, 2);
    else schemaInput.value = JSON.stringify(TYPE_SPEC_SAMPLE, null, 2);
    generate();
  }

  function clearAll() {
    schemaInput.value = '';
    lastSchema = null;
    clearOutput();
    clearError();
    setStatus('', 'Ready');
    WUS.store.remove(STORE_KEY);
    schemaInput.focus();
  }

  /* =================================================================
     PERSISTENCE
     ================================================================= */
  function persist() {
    WUS.store.set(STORE_KEY, {
      schema: schemaInput.value,
      count: countInput.value,
      mode: mode
    });
  }
  var persistDebounced = WUS.debounce(persist, 400);

  function restore() {
    var saved = WUS.store.get(STORE_KEY, null);
    if (!saved) { loadSample(); return; }
    if (typeof saved.schema === 'string') schemaInput.value = saved.schema;
    if (saved.count) countInput.value = saved.count;
    setMode(saved.mode === 'example' ? 'example' : 'typespec');
    if (schemaInput.value.trim()) generate();
  }

  /* =================================================================
     SHORTCUTS HELP MODAL
     ================================================================= */
  var helpBackdrop = document.getElementById('helpBackdrop');
  var helpClose    = document.getElementById('helpClose');
  var shortcutRows = document.getElementById('shortcutRows');

  var SHORTCUTS = [
    { keys: ['mod', '\u21b5'], desc: 'Generate records' },
    { keys: ['mod', 'R'], desc: 'Regenerate' },
    { keys: ['mod', 'S'], desc: 'Download as .json' },
    { keys: ['?'], desc: 'Show this help' },
    { keys: ['Esc'], desc: 'Close dialog' }
  ];

  function buildShortcutTable() {
    var html = '';
    SHORTCUTS.forEach(function (s) {
      var kbds = s.keys.map(function (k) { return '<kbd>' + WUS.escapeHtml(k) + '</kbd>'; }).join('');
      html += '<tr><td>' + WUS.escapeHtml(s.desc) + '</td><td>' + kbds + '</td></tr>';
    });
    shortcutRows.innerHTML = html;
  }

  function openHelp() { helpBackdrop.hidden = false; helpClose.focus(); }
  function closeHelp() { helpBackdrop.hidden = true; }

  helpClose.addEventListener('click', closeHelp);
  helpBackdrop.addEventListener('click', function (e) { if (e.target === helpBackdrop) closeHelp(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !helpBackdrop.hidden) closeHelp(); });

  var helpBtns = document.querySelectorAll('[data-shortcut-help]');
  for (var i = 0; i < helpBtns.length; i++) helpBtns[i].addEventListener('click', openHelp);

  /* =================================================================
     WIRING
     ================================================================= */
  document.getElementById('btnGenerate').addEventListener('click', generate);
  document.getElementById('btnRegenerate').addEventListener('click', regenerate);
  document.getElementById('btnCopy').addEventListener('click', copyOutput);
  document.getElementById('btnDownload').addEventListener('click', downloadOutput);
  document.getElementById('btnSampleEmpty').addEventListener('click', loadSample);
  document.getElementById('btnSample').addEventListener('click', loadSample);
  document.getElementById('btnClear').addEventListener('click', clearAll);
  btnInfer.addEventListener('click', inferAndFill);

  tabTypeSpec.addEventListener('click', function () { setMode('typespec'); });
  tabExample.addEventListener('click', function () { setMode('example'); });

  schemaInput.addEventListener('input', persistDebounced);
  countInput.addEventListener('change', persist);

  schemaInput.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); generate(); }
  });

  WUS.registerShortcut('mod+enter', function () { generate(); }, 'Generate records');
  WUS.registerShortcut('mod+r', function () { regenerate(); }, 'Regenerate');
  WUS.registerShortcut('mod+s', function () { downloadOutput(); }, 'Download .json');
  WUS.registerShortcut('?', function () { openHelp(); }, 'Show shortcuts');

  /* =================================================================
     INIT
     ================================================================= */
  buildShortcutTable();
  restore();
})();
