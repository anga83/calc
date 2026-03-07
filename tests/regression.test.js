'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

function createClassList() {
  const classes = new Set();
  return {
    add: (...names) => names.forEach((name) => classes.add(name)),
    remove: (...names) => names.forEach((name) => classes.delete(name)),
    toggle: (name, force) => {
      if (typeof force === 'boolean') {
        if (force) {
          classes.add(name);
        } else {
          classes.delete(name);
        }
        return force;
      }
      if (classes.has(name)) {
        classes.delete(name);
        return false;
      }
      classes.add(name);
      return true;
    },
    contains: (name) => classes.has(name),
  };
}

function createElementStub(id = '') {
  return {
    id,
    value: '',
    textContent: '',
    innerHTML: '',
    hidden: false,
    checked: false,
    wrap: 'off',
    scrollTop: 0,
    scrollLeft: 0,
    clientWidth: 1000,
    style: {},
    options: [],
    classList: createClassList(),
    appendChild: () => {},
    replaceChildren: () => {},
    remove: () => {},
    click: () => {},
    focus: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    addEventListener: () => {},
    closest: () => null,
  };
}

function setupBrowserStubs() {
  const elementCache = new Map();
  const localStore = new Map();

  const documentStub = {
    documentElement: { lang: 'de' },
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    getElementById(id) {
      if (!elementCache.has(id)) {
        const el = createElementStub(id);
        if (id === 'setting-decimal-separator') {
          el.options = [{ value: ',' }, { value: '.' }];
        }
        if (id === 'setting-thousands-separator') {
          el.options = [{ value: '.' }, { value: ',' }, { value: "'" }, { value: '' }];
        }
        if (id === 'setting-language') {
          el.options = [{ value: 'auto' }, { value: 'de' }, { value: 'en' }];
        }
        elementCache.set(id, el);
      }
      return elementCache.get(id);
    },
    querySelector: () => null,
    createElement(tag) {
      if (tag === 'canvas') {
        return {
          getContext: () => ({
            font: '',
            measureText: () => ({ width: 8 }),
          }),
        };
      }
      return createElementStub(tag);
    },
    createDocumentFragment() {
      return { appendChild: () => {} };
    },
    addEventListener: () => {},
  };

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    writable: true,
    value: documentStub,
  });
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    writable: true,
    value: {
    language: 'de-DE',
    serviceWorker: { register: async () => {} },
    },
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: {
    localStorage: {
      getItem: (key) => (localStore.has(key) ? localStore.get(key) : null),
      setItem: (key, value) => {
        localStore.set(key, String(value));
      },
    },
    addEventListener: () => {},
    getComputedStyle: () => ({
      fontSize: '16px',
      fontFamily: 'monospace',
      fontWeight: '500',
      paddingLeft: '0',
      paddingRight: '0',
    }),
    math: null,
    },
  });
}

setupBrowserStubs();

const DEFAULT_TEST_SETTINGS = Object.freeze({
  useMathJs: false,
  decimalPlaces: 4,
  fixedDecimals: false,
  integerNoDecimals: false,
  preciseIntermediates: true,
  syntaxHighlighting: false,
  lineNumbers: false,
  autoWrap: false,
  language: 'de',
  decimalSeparator: ',',
  thousandsSeparator: '.',
});

function loadEvaluateSheet(settings = DEFAULT_TEST_SETTINGS) {
  window.localStorage.setItem('zeilenrechner:settings', JSON.stringify(settings));
  delete require.cache[require.resolve('../app.js')];
  return require('../app.js').evaluateSheet;
}

function rowResult(sheet, lineNo) {
  return sheet.displayRows[lineNo - 1];
}

function assertAlmostEqual(actual, expected, epsilon = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= epsilon, `Expected ${actual} to be within ${epsilon} of ${expected}`);
}

test('Grundrechnen und Zuweisungen', () => {
  const evaluateSheet = loadEvaluateSheet();
  const sheet = evaluateSheet([
    'a = 10',
    'b = 5',
    'a + b',
    'a -= 3',
    'a',
  ].join('\n'));

  assert.equal(rowResult(sheet, 3).value.value, 15);
  assert.equal(rowResult(sheet, 4).value.value, 7);
  assert.equal(rowResult(sheet, 5).value.value, 7);
});

test('Trailing Gleichheitszeichen wird ignoriert', () => {
  const evaluateSheet = loadEvaluateSheet();
  const sheet = evaluateSheet('1 + 2 =');
  assert.equal(rowResult(sheet, 1).value.value, 3);
});

test('Kommentare werden ignoriert', () => {
  const evaluateSheet = loadEvaluateSheet();
  const sheet = evaluateSheet([
    '# Kommentar',
    '// noch ein Kommentar',
    '5 + 5',
  ].join('\n'));

  assert.equal(rowResult(sheet, 1).type, 'comment');
  assert.equal(rowResult(sheet, 2).type, 'comment');
  assert.equal(rowResult(sheet, 3).value.value, 10);
});

test('Prozentabzug mit und ohne Währung liefert denselben Zahlenwert', () => {
  const evaluateSheet = loadEvaluateSheet();
  const withCurrency = evaluateSheet([
    'base = 59,99€',
    'discount = 20%',
    'base - discount',
  ].join('\n'));

  const withoutCurrency = evaluateSheet([
    'base = 59,99',
    'discount = 20%',
    'base - discount',
  ].join('\n'));

  assert.equal(rowResult(withCurrency, 3).value.unit, 'eur');
  assertAlmostEqual(rowResult(withCurrency, 3).value.value, 47.992, 1e-10);
  assert.equal(rowResult(withoutCurrency, 3).value.unit, null);
  assertAlmostEqual(rowResult(withoutCurrency, 3).value.value, 47.992, 1e-10);
});

test('Vergleiche und Ternary', () => {
  const evaluateSheet = loadEvaluateSheet();
  const sheet = evaluateSheet([
    '5 > 3',
    '10 == 2*5 ? 5 : 3',
    '2 > 9 ? 10 : 11',
  ].join('\n'));

  assert.equal(rowResult(sheet, 1).value.isBoolean, true);
  assert.equal(rowResult(sheet, 1).display, 'true');
  assert.equal(rowResult(sheet, 2).value.value, 5);
  assert.equal(rowResult(sheet, 3).value.value, 11);
});

test('Funktionen inkl. Bereichsreferenzen', () => {
  const evaluateSheet = loadEvaluateSheet();
  const sheet = evaluateSheet([
    'x = 1',
    'y = 2',
    '# skip',
    '',
    'z = 4',
    'SUMME(@1:@5)',
    'Mittelwert(x; y; z)',
    'max(x; y; z)',
    'Anzahl(@1:@5)',
  ].join('\n'));

  assert.equal(rowResult(sheet, 6).value.value, 7);
  assertAlmostEqual(rowResult(sheet, 7).value.value, 7 / 3, 1e-12);
  assert.equal(rowResult(sheet, 8).value.value, 4);
  assert.equal(rowResult(sheet, 9).value.value, 3);
});

test('Einheitenumrechnung und Synonyme', () => {
  const evaluateSheet = loadEvaluateSheet();
  const sheet = evaluateSheet([
    'dist = 12,5 km',
    'dist in m',
    'dist zu m',
    '68 °F als °C',
  ].join('\n'));

  assert.equal(rowResult(sheet, 2).value.value, 12500);
  assert.equal(rowResult(sheet, 2).value.unit, 'm');
  assert.equal(rowResult(sheet, 3).value.value, 12500);
  assert.equal(rowResult(sheet, 3).value.unit, 'm');
  assert.ok(Math.abs(rowResult(sheet, 4).value.value - 20) < 1e-10);
  assert.equal(rowResult(sheet, 4).value.unit, 'c');
});

test('@-Referenz auf leere Zeile erzeugt korrekten Fehler', () => {
  const evaluateSheet = loadEvaluateSheet();
  const sheet = evaluateSheet(['1 + 1', '', '@2'].join('\n'));
  assert.equal(rowResult(sheet, 3).type, 'error');
  assert.equal(rowResult(sheet, 3).display, 'Fehler: Zeile 2 leer');
});

test('Punkt als Tausendertrenner oder Dezimalpunkt wird korrekt interpretiert', () => {
  const evaluateSheet = loadEvaluateSheet();
  const sheet = evaluateSheet([
    '3.000.000 * 1,1',
    '300 * 1.1',
  ].join('\n'));

  assertAlmostEqual(rowResult(sheet, 1).value.value, 3300000, 1e-8);
  assert.equal(rowResult(sheet, 2).value.value, 330);
});

test('Operatoren: +, -, *, /, ^ und Klammern', () => {
  const evaluateSheet = loadEvaluateSheet();
  const sheet = evaluateSheet([
    '1 + 2 * 3',
    '(1 + 2) * 3',
    '2 ^ 3 ^ 2',
    '10 / 4',
    '-5 + 2',
    '+5 - 2',
  ].join('\n'));

  assert.equal(rowResult(sheet, 1).value.value, 7);
  assert.equal(rowResult(sheet, 2).value.value, 9);
  assert.equal(rowResult(sheet, 3).value.value, 512);
  assert.equal(rowResult(sheet, 4).value.value, 2.5);
  assert.equal(rowResult(sheet, 5).value.value, -3);
  assert.equal(rowResult(sheet, 6).value.value, 3);
});

test('Wortoperatoren: plus, minus, mal, von, of, on, off', () => {
  const evaluateSheet = loadEvaluateSheet();
  const sheet = evaluateSheet([
    '2 plus 3',
    '5 minus 2',
    '6 mal 7',
    '10% von 200',
    '10% of 300',
    '10% on 200',
    '10% off 200',
  ].join('\n'));

  assert.equal(rowResult(sheet, 1).value.value, 5);
  assert.equal(rowResult(sheet, 2).value.value, 3);
  assert.equal(rowResult(sheet, 3).value.value, 42);
  assert.equal(rowResult(sheet, 4).value.value, 20);
  assert.equal(rowResult(sheet, 5).value.value, 30);
  assertAlmostEqual(rowResult(sheet, 6).value.value, 220, 1e-10);
  assert.equal(rowResult(sheet, 7).value.value, 180);
});

test('Vergleichsoperatoren vollständig', () => {
  const evaluateSheet = loadEvaluateSheet();
  const sheet = evaluateSheet([
    '5 > 4',
    '5 >= 5',
    '4 < 5',
    '5 <= 5',
    '5 == 5',
    '5 != 4',
  ].join('\n'));

  for (let i = 1; i <= 6; i += 1) {
    assert.equal(rowResult(sheet, i).display, 'true');
    assert.equal(rowResult(sheet, i).value.isBoolean, true);
  }
});

test('Gemischte Konstellation: Variablen, Prozent, Vergleich, Ternary, Umrechnung', () => {
  const evaluateSheet = loadEvaluateSheet();
  const sheet = evaluateSheet([
    'base = 120',
    'vat = 19%',
    'gross = base + vat',
    'isHigh = gross > 140',
    'bonus = isHigh ? 10% : 5%',
    'final = gross + bonus',
    'km = final km',
    'km in m',
  ].join('\n'));

  assertAlmostEqual(rowResult(sheet, 3).value.value, 142.8, 1e-12);
  assert.equal(rowResult(sheet, 4).display, 'true');
  assertAlmostEqual(rowResult(sheet, 5).value.value, 0.1, 1e-12);
  assertAlmostEqual(rowResult(sheet, 6).value.value, 157.08, 1e-12);
  assert.equal(rowResult(sheet, 7).value.unit, 'km');
  assertAlmostEqual(rowResult(sheet, 8).value.value, 157080, 1e-8);
  assert.equal(rowResult(sheet, 8).value.unit, 'm');
});

test('Fehlerfälle: Division durch 0, unbekannter Name, Klammerfehler, ungültige Zeilenreferenz', () => {
  const evaluateSheet = loadEvaluateSheet();
  const sheet = evaluateSheet([
    '1 / 0',
    'unknownVar + 1',
    '(1 + 2',
    '@99',
  ].join('\n'));

  assert.equal(rowResult(sheet, 1).type, 'error');
  assert.match(rowResult(sheet, 1).display, /^Fehler: Division durch 0$/u);

  assert.equal(rowResult(sheet, 2).type, 'error');
  assert.match(rowResult(sheet, 2).display, /^Fehler: Unbekannter Name: unknownVar$/u);

  assert.equal(rowResult(sheet, 3).type, 'error');
  assert.match(rowResult(sheet, 3).display, /^Fehler: Schließende Klammer fehlt$/u);

  assert.equal(rowResult(sheet, 4).type, 'error');
  assert.match(rowResult(sheet, 4).display, /^Fehler: Unbekanntes Zeichen: @$/u);
});

test('Fixe Nachkommastellen an/aus wirkt auf Anzeige', () => {
  const evaluateSheetFixed = loadEvaluateSheet({
    ...DEFAULT_TEST_SETTINGS,
    fixedDecimals: true,
    decimalPlaces: 4,
  });

  const fixedSheet = evaluateSheetFixed([
    'a = 25,001',
    'a',
  ].join('\n'));
  assert.equal(rowResult(fixedSheet, 1).display, '25,0010');
  assert.equal(rowResult(fixedSheet, 2).display, '25,0010');

  const evaluateSheetDynamic = loadEvaluateSheet({
    ...DEFAULT_TEST_SETTINGS,
    fixedDecimals: false,
    decimalPlaces: 4,
  });

  const dynamicSheet = evaluateSheetDynamic([
    'a = 25,0010',
    'a',
  ].join('\n'));
  assert.equal(rowResult(dynamicSheet, 1).display, '25,001');
  assert.equal(rowResult(dynamicSheet, 2).display, '25,001');
});

test('Math.js aktiviert: komplexer Ausdruck und Fallback bei Prozent', () => {
  // math.js stub
  window.math = {
    evaluate(expression, scope) {
      if (expression.includes('%')) {
        throw new Error('percent unsupported');
      }
      // einfacher kontrollierter Stub für diesen Testfall
      if (expression === 'sqrt(16) + abs(-3)') {
        return 7;
      }
      if (expression === 'base - discount') {
        return Number(scope.base) - Number(scope.discount);
      }
      throw new Error(`unexpected expression: ${expression}`);
    },
  };

  const evaluateSheet = loadEvaluateSheet({
    ...DEFAULT_TEST_SETTINGS,
    useMathJs: true,
  });

  const sheet = evaluateSheet([
    'sqrt(16) + abs(-3)',
    'base = 59,99',
    'discount = 20%',
    'base - discount',
  ].join('\n'));

  assert.equal(rowResult(sheet, 1).value.value, 7);
  // Prozent soll via Parser korrekt als Prozentabzug behandelt werden.
  assertAlmostEqual(rowResult(sheet, 4).value.value, 47.992, 1e-10);
});
