"use strict";

const inputEl = document.getElementById("sheet-input");
const highlightEl = document.getElementById("sheet-highlight");
const inputLineNumbersEl = document.getElementById("sheet-input-line-numbers");
const resultsEl = document.getElementById("sheet-results");
const resultLineNumbersEl = document.getElementById("sheet-result-line-numbers");
const appEl = document.getElementById("app-root");
const helpChipEl = document.getElementById("help-chip");
const helpPopoverEl = document.getElementById("help-popover");
const mathJsHelpEl = document.getElementById("mathjs-help");
const downloadChipEl = document.getElementById("download-chip");
const downloadPopoverEl = document.getElementById("download-popover");
const settingsChipEl = document.getElementById("settings-chip");
const settingsPopoverEl = document.getElementById("settings-popover");
const loadDemoBtnEl = document.getElementById("load-demo-btn");
const exportPdfDividerBtnEl = document.getElementById("export-pdf-divider-btn");
const exportPdfPlainBtnEl = document.getElementById("export-pdf-plain-btn");
const exportMdBtnEl = document.getElementById("export-md-btn");
const exportJsonBtnEl = document.getElementById("export-json-btn");
const exportYamlBtnEl = document.getElementById("export-yaml-btn");
const settingUseMathJsEl = document.getElementById("setting-use-mathjs");
const settingDecimalsEl = document.getElementById("setting-decimals");
const settingFixedDecimalsEl = document.getElementById("setting-fixed-decimals");
const settingIntegerNoDecimalsEl = document.getElementById("setting-integer-no-decimals");
const settingPreciseIntermediateEl = document.getElementById("setting-precise-intermediate");
const settingSyntaxHighlightEl = document.getElementById("setting-syntax-highlighting");
const settingLineNumbersEl = document.getElementById("setting-line-numbers");
const settingAutoWrapEl = document.getElementById("setting-auto-wrap");
const settingLanguageEl = document.getElementById("setting-language");
const settingDecimalSeparatorEl = document.getElementById("setting-decimal-separator");
const settingThousandsSeparatorEl = document.getElementById("setting-thousands-separator");
const separatorStatusEl = document.getElementById("separator-status");
const mathJsStatusEl = document.getElementById("mathjs-status");
const resizeChipEl = document.getElementById("resize-chip");
const resizeFloatEl = document.getElementById("resize-float");

const INITIAL_TEXT = `# Beispiel
netto = 1.250,00
mwst = 19%
brutto = netto + mwst

strecke = 12,5 km
strecke in m

temperatur = 68 °F
temperatur as °C

// Kommentare können mit // beginnen
essen = 22,40
trinkgeld = 10%
gesamt = essen + trinkgeld`;

const STORAGE_KEY = "zeilenrechner:last-sheet";
const VIEW_MODE_STORAGE_KEY = "zeilenrechner:view-mode";
const SETTINGS_STORAGE_KEY = "zeilenrechner:settings";
const VIEW_MODE_STANDARD = "standard";
const VIEW_MODE_FULL = "full";
const MATHJS_CDN_URL = "https://cdn.jsdelivr.net/npm/mathjs@13.2.2/lib/browser/math.js";
const DECIMAL_SEPARATOR_OPTIONS = [",", "."];
const THOUSANDS_SEPARATOR_OPTIONS = [".", ",", "'", ""];
let currentLanguage = detectLanguage();

const DEFAULT_SETTINGS = Object.freeze({
  useMathJs: false,
  decimalPlaces: 4,
  fixedDecimals: false,
  integerNoDecimals: false,
  preciseIntermediates: true,
  syntaxHighlighting: false,
  lineNumbers: false,
  autoWrap: false,
  language: "auto",
  decimalSeparator: ",",
  thousandsSeparator: ".",
});

const I18N = Object.freeze({
  de: {
    appTitle: "Zeilenrechner",
    appSubtitle: "Rechner mit Unterstützung für Kommentare, Variablen und Einheitenumrechnung",
    paneInput: "Eingaben",
    paneOutput: "Ergebnisse",
    settingsHeading: "Einstellungen",
    settingsGroupCalc: "Berechnung",
    settingsGroupDisplay: "Anzeige",
    settingsGroupNumberFormat: "Zahlenformat",
    labelUseMathJs: "math.js verwenden",
    labelPreciseIntermediate: "Mit genauen Zwischenergebnissen rechnen",
    labelDecimals: "Nachkommastellen",
    labelFixedDecimals: "Fixe Nachkommastellen",
    labelIntegerNoDecimals: "Ganzzahlen ohne Nachkommastellen",
    labelSyntaxHighlighting: "Syntax-Highlighting",
    labelLineNumbers: "Zeilennummern",
    labelAutoWrap: "Automatischer Zeilenumbruch",
    labelLanguage: "Sprache",
    labelDecimalSeparator: "Dezimalzeichen",
    labelThousandsSeparator: "Tausendertrennzeichen",
    optionLanguageAuto: "Browser-Standard",
    optionLanguageDe: "Deutsch",
    optionLanguageEn: "English",
    separatorInvalid: "Dezimalzeichen und Tausendertrennzeichen dürfen nicht identisch sein.",
    separatorValid: "Einstellungen für Zahlenformat sind gültig.",
    hintComments: "<strong>Kommentare:</strong> Zeilen mit <code>#</code> oder <code>//</code>",
    hintVariables: "<strong>Variablen:</strong> <code>name = ...</code>, <code>name += ...</code>, <code>name -= ...</code>",
    hintConversions: "<strong>Umrechnung:</strong> <code>10 km in m</code>, <code>32 °F as °C</code>",
    helpSyntaxHeading: "Syntax",
    helpFunctionsHeading: "Funktionen",
    helpConversionsHeading: "Unterstützte Umrechnungen",
    helpMathJsHeading: "Zusätzlich Mit math.js",
    helpSyntax1: "Arithmetik: <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>, <code>^</code>",
    helpSyntax2: "Text-Operatoren: <code>plus</code>, <code>minus</code>, <code>mal</code>, <code>of</code>, <code>von</code>, <code>on</code>, <code>off</code>",
    helpSyntax3: "Umrechnung: <code>in</code>, <code>to</code>/<code>zu</code>, <code>as</code>/<code>als</code>, Kurzform: <code>km m</code>",
    helpSyntax4: "Zuweisung: <code>=</code>, <code>+=</code>, <code>-=</code>",
    helpSyntax5: "Referenzen: <code>@3</code> (Zeile 3), <code>ans</code>/<code>last</code>",
    helpSyntax6: "Vergleiche: <code>&gt;</code>, <code>&gt;=</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>==</code>, <code>!=</code>",
    helpSyntax7: "Kommentare: Zeilen mit <code>#</code> oder <code>//</code>",
    helpSyntax8: "Ein trailing <code>=</code> wird ignoriert: <code>1 + 2 =</code>",
    helpSyntax9: "Variablennamen dürfen Leerzeichen und Umlaute enthalten; sie sind nicht case-sensitiv.",
    helpFunctions1: "<code>min(...)</code>, <code>max(...)</code> (z. B. <code>min(3;5)</code>)",
    helpFunctions2: "<code>Summe(...)</code>/<code>SUM(...)</code> (Excel-ähnlich, z. B. <code>Summe(wert1, wert2)</code>)",
    helpFunctions3: "Bereiche: <code>Summe(@1:@4)</code> summiert Zeilen 1 bis 4 (leere/Kommentarzeilen werden übersprungen)",
    helpFunctions4: "<code>Durchschnitt(...)</code>/<code>Mittelwert(...)</code>/<code>AVG(...)</code>, <code>Anzahl(...)</code>/<code>COUNT(...)</code>",
    helpFunctions5: "Funktionsnamen sind case-insensitiv und funktionieren mit oder ohne führendes <code>=</code>.",
    helpLinkLine: "Weiterführende Syntax: <a id=\"help-link-mathjs\" href=\"https://mathjs.org/docs/expressions/syntax.html\" target=\"_blank\" rel=\"noopener noreferrer\">mathjs.org/docs/expressions/syntax.html</a>",
    helpConv1: "Länge: <code>mm</code>, <code>cm</code>, <code>m</code>, <code>km</code>, <code>in</code>, <code>ft</code>, <code>yd</code>, <code>mi</code>",
    helpConv2: "Masse: <code>mg</code>, <code>g</code>, <code>kg</code>, <code>t</code>, <code>oz</code>, <code>lb</code>",
    helpConv3: "Zeit: <code>ms</code>, <code>s</code>, <code>min</code>, <code>h</code>, <code>d</code>, <code>wk</code>",
    helpConv4: "Volumen: <code>ml</code>, <code>l</code>",
    helpConv5: "Fläche: <code>cm²</code>, <code>m²</code>, <code>km²</code>, <code>ha</code>",
    helpConv6: "Geschwindigkeit: <code>m/s</code>, <code>km/h</code>, <code>mph</code>",
    helpConv7: "Temperatur: <code>°C</code>, <code>°F</code>, <code>K</code>",
    helpConv8: "Währung: <code>€</code>/<code>EUR</code>, <code>USD</code>, <code>CHF</code>, <code>GBP</code>",
    downloadHeading: "Export",
    exportPdfDivider: "PDF mit Trennstrich",
    exportPdfPlain: "PDF ohne Trennstrich",
    exportMarkdown: "Markdown (Tabelle)",
    exportJson: "JSON",
    exportYaml: "YAML",
    demoButton: "Demo",
    mathJsStatusDisabled: "math.js ist deaktiviert.",
    mathJsStatusActive: "math.js ist aktiv.",
    mathJsStatusLoading: "math.js wird geladen ...",
    mathJsStatusError: "math.js konnte nicht geladen werden. Fallback ist aktiv.",
    mathJsStatusPending: "math.js ist eingeschaltet, aber noch nicht geladen.",
    errorPrefix: "Fehler",
    resizeToFull: "Vollansicht umschalten",
    resizeToStandard: "Standardansicht umschalten",
    resizeFloatTitleStandard: "Standardansicht",
    resizeFloatTitleFull: "Vollansicht",
    buttonHelpTitle: "Hilfe",
    buttonDownloadTitle: "Exportieren",
    buttonSettingsTitle: "Einstellungen",
    inputAria: "Rechenzeilen"
  },
  en: {
    appTitle: "Line Calculator",
    appSubtitle: "Calculator with support for comments, variables, and unit conversion",
    paneInput: "Input",
    paneOutput: "Results",
    settingsHeading: "Settings",
    settingsGroupCalc: "Calculation",
    settingsGroupDisplay: "Display",
    settingsGroupNumberFormat: "Number Format",
    labelUseMathJs: "Use math.js",
    labelPreciseIntermediate: "Use precise intermediate values",
    labelDecimals: "Decimal places",
    labelFixedDecimals: "Fixed decimal places",
    labelIntegerNoDecimals: "Hide decimals for integers",
    labelSyntaxHighlighting: "Syntax highlighting",
    labelLineNumbers: "Line numbers",
    labelAutoWrap: "Automatic line wrap",
    labelLanguage: "Language",
    labelDecimalSeparator: "Decimal separator",
    labelThousandsSeparator: "Thousands separator",
    optionLanguageAuto: "Browser default",
    optionLanguageDe: "Deutsch",
    optionLanguageEn: "English",
    separatorInvalid: "Decimal and thousands separators must be different.",
    separatorValid: "Number format settings are valid.",
    hintComments: "<strong>Comments:</strong> Lines starting with <code>#</code> or <code>//</code>",
    hintVariables: "<strong>Variables:</strong> <code>name = ...</code>, <code>name += ...</code>, <code>name -= ...</code>",
    hintConversions: "<strong>Conversion:</strong> <code>10 km in m</code>, <code>32 °F as °C</code>",
    helpSyntaxHeading: "Syntax",
    helpFunctionsHeading: "Functions",
    helpConversionsHeading: "Supported conversions",
    helpMathJsHeading: "Additional With math.js",
    helpSyntax1: "Arithmetic: <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>, <code>^</code>",
    helpSyntax2: "Word operators: <code>plus</code>, <code>minus</code>, <code>mal</code>, <code>of</code>, <code>von</code>, <code>on</code>, <code>off</code>",
    helpSyntax3: "Conversion: <code>in</code>, <code>to</code>/<code>zu</code>, <code>as</code>/<code>als</code>, shorthand: <code>km m</code>",
    helpSyntax4: "Assignment: <code>=</code>, <code>+=</code>, <code>-=</code>",
    helpSyntax5: "References: <code>@3</code> (line 3), <code>ans</code>/<code>last</code>",
    helpSyntax6: "Comparisons: <code>&gt;</code>, <code>&gt;=</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>==</code>, <code>!=</code>",
    helpSyntax7: "Comments: lines starting with <code>#</code> or <code>//</code>",
    helpSyntax8: "A trailing <code>=</code> is ignored: <code>1 + 2 =</code>",
    helpSyntax9: "Variable names may contain spaces and umlauts; matching is case-insensitive.",
    helpFunctions1: "<code>min(...)</code>, <code>max(...)</code> (e.g. <code>min(3;5)</code>)",
    helpFunctions2: "<code>SUM(...)</code>/<code>Summe(...)</code> (Excel-like, e.g. <code>SUM(value1, value2)</code>)",
    helpFunctions3: "Ranges: <code>SUM(@1:@4)</code> sums lines 1 to 4 (empty/comment lines are skipped)",
    helpFunctions4: "<code>AVG(...)</code>/<code>Durchschnitt(...)</code>/<code>Mittelwert(...)</code>, <code>COUNT(...)</code>/<code>Anzahl(...)</code>",
    helpFunctions5: "Function names are case-insensitive and work with or without a leading <code>=</code>.",
    helpLinkLine: "Extended syntax: <a id=\"help-link-mathjs\" href=\"https://mathjs.org/docs/expressions/syntax.html\" target=\"_blank\" rel=\"noopener noreferrer\">mathjs.org/docs/expressions/syntax.html</a>",
    helpConv1: "Length: <code>mm</code>, <code>cm</code>, <code>m</code>, <code>km</code>, <code>in</code>, <code>ft</code>, <code>yd</code>, <code>mi</code>",
    helpConv2: "Mass: <code>mg</code>, <code>g</code>, <code>kg</code>, <code>t</code>, <code>oz</code>, <code>lb</code>",
    helpConv3: "Time: <code>ms</code>, <code>s</code>, <code>min</code>, <code>h</code>, <code>d</code>, <code>wk</code>",
    helpConv4: "Volume: <code>ml</code>, <code>l</code>",
    helpConv5: "Area: <code>cm²</code>, <code>m²</code>, <code>km²</code>, <code>ha</code>",
    helpConv6: "Speed: <code>m/s</code>, <code>km/h</code>, <code>mph</code>",
    helpConv7: "Temperature: <code>°C</code>, <code>°F</code>, <code>K</code>",
    helpConv8: "Currency: <code>€</code>/<code>EUR</code>, <code>USD</code>, <code>CHF</code>, <code>GBP</code>",
    downloadHeading: "Export",
    exportPdfDivider: "PDF with divider",
    exportPdfPlain: "PDF without divider",
    exportMarkdown: "Markdown (Table)",
    exportJson: "JSON",
    exportYaml: "YAML",
    demoButton: "Demo",
    mathJsStatusDisabled: "math.js is disabled.",
    mathJsStatusActive: "math.js is active.",
    mathJsStatusLoading: "Loading math.js ...",
    mathJsStatusError: "Could not load math.js. Fallback parser is active.",
    mathJsStatusPending: "math.js is enabled but not loaded yet.",
    errorPrefix: "Error",
    resizeToFull: "Toggle full view",
    resizeToStandard: "Toggle standard view",
    resizeFloatTitleStandard: "Standard view",
    resizeFloatTitleFull: "Full view",
    buttonHelpTitle: "Help",
    buttonDownloadTitle: "Export",
    buttonSettingsTitle: "Settings",
    inputAria: "Calculation lines"
  }
});

const unitDefs = {
  mm: linearUnit("length", "mm", 0.001),
  cm: linearUnit("length", "cm", 0.01),
  m: linearUnit("length", "m", 1),
  km: linearUnit("length", "km", 1000),
  in: linearUnit("length", "in", 0.0254),
  ft: linearUnit("length", "ft", 0.3048),
  yd: linearUnit("length", "yd", 0.9144),
  mi: linearUnit("length", "mi", 1609.344),

  mg: linearUnit("mass", "mg", 0.000001),
  g: linearUnit("mass", "g", 0.001),
  kg: linearUnit("mass", "kg", 1),
  t: linearUnit("mass", "t", 1000),
  oz: linearUnit("mass", "oz", 0.028349523125),
  lb: linearUnit("mass", "lb", 0.45359237),

  ms: linearUnit("time", "ms", 0.001),
  s: linearUnit("time", "s", 1),
  min: linearUnit("time", "min", 60),
  h: linearUnit("time", "h", 3600),
  d: linearUnit("time", "d", 86400),
  wk: linearUnit("time", "wk", 604800),

  ml: linearUnit("volume", "ml", 0.001),
  l: linearUnit("volume", "l", 1),

  cm2: linearUnit("area", "cm²", 0.0001),
  m2: linearUnit("area", "m²", 1),
  km2: linearUnit("area", "km²", 1000000),
  ha: linearUnit("area", "ha", 10000),

  mps: linearUnit("speed", "m/s", 1),
  kmh: linearUnit("speed", "km/h", 1000 / 3600),
  mph: linearUnit("speed", "mph", 1609.344 / 3600),

  c: affineUnit("temperature", "°C", (v) => v + 273.15, (v) => v - 273.15),
  f: affineUnit("temperature", "°F", (v) => ((v - 32) * 5) / 9 + 273.15, (v) => ((v - 273.15) * 9) / 5 + 32),
  k: affineUnit("temperature", "K", (v) => v, (v) => v),

  eur: linearUnit("currency", "€", 1),
  usd: linearUnit("currency", "$", 0.93),
  chf: linearUnit("currency", "CHF", 0.97),
  gbp: linearUnit("currency", "£", 1.16),
};

const unitAliases = new Map([
  ["millimeter", "mm"],
  ["millimeters", "mm"],
  ["millimetre", "mm"],
  ["millimetres", "mm"],
  ["millimetern", "mm"],
  ["mm", "mm"],

  ["centimeter", "cm"],
  ["centimeters", "cm"],
  ["centimetre", "cm"],
  ["centimetres", "cm"],
  ["zentimeter", "cm"],
  ["zentimetern", "cm"],
  ["cm", "cm"],

  ["meter", "m"],
  ["meters", "m"],
  ["metre", "m"],
  ["metres", "m"],
  ["metern", "m"],
  ["m", "m"],

  ["kilometer", "km"],
  ["kilometers", "km"],
  ["kilometre", "km"],
  ["kilometres", "km"],
  ["kilometern", "km"],
  ["km", "km"],
  ["zoll", "in"],
  ["inch", "in"],
  ["inches", "in"],
  ["fuß", "ft"],
  ["fuss", "ft"],
  ["feet", "ft"],
  ["foot", "ft"],
  ["ft", "ft"],
  ["yard", "yd"],
  ["yards", "yd"],
  ["yd", "yd"],
  ["mile", "mi"],
  ["miles", "mi"],
  ["mi", "mi"],

  ["mg", "mg"],
  ["milligramm", "mg"],
  ["milligramm", "mg"],
  ["g", "g"],
  ["gramm", "g"],
  ["gram", "g"],
  ["kg", "kg"],
  ["kilogramm", "kg"],
  ["kilogram", "kg"],
  ["t", "t"],
  ["tonne", "t"],
  ["tonnen", "t"],
  ["oz", "oz"],
  ["ounce", "oz"],
  ["ounces", "oz"],
  ["lb", "lb"],
  ["lbs", "lb"],
  ["pound", "lb"],
  ["pounds", "lb"],

  ["ms", "ms"],
  ["millisekunde", "ms"],
  ["millisekunden", "ms"],
  ["s", "s"],
  ["sec", "s"],
  ["secs", "s"],
  ["second", "s"],
  ["seconds", "s"],
  ["sekunde", "s"],
  ["sekunden", "s"],
  ["min", "min"],
  ["minute", "min"],
  ["minutes", "min"],
  ["minuten", "min"],
  ["h", "h"],
  ["hr", "h"],
  ["hrs", "h"],
  ["hour", "h"],
  ["hours", "h"],
  ["stunde", "h"],
  ["stunden", "h"],
  ["tag", "d"],
  ["tage", "d"],
  ["day", "d"],
  ["days", "d"],
  ["woche", "wk"],
  ["wochen", "wk"],
  ["week", "wk"],
  ["weeks", "wk"],
  ["wk", "wk"],

  ["ml", "ml"],
  ["milliliter", "ml"],
  ["milliliters", "ml"],
  ["l", "l"],
  ["liter", "l"],
  ["liters", "l"],
  ["litre", "l"],
  ["litres", "l"],

  ["cm2", "cm2"],
  ["cm²", "cm2"],
  ["m2", "m2"],
  ["m²", "m2"],
  ["km2", "km2"],
  ["km²", "km2"],
  ["ha", "ha"],
  ["hectare", "ha"],
  ["hectares", "ha"],
  ["hektar", "ha"],
  ["hektaren", "ha"],

  ["m/s", "mps"],
  ["mps", "mps"],
  ["km/h", "kmh"],
  ["kmh", "kmh"],
  ["kph", "kmh"],
  ["mph", "mph"],

  ["c", "c"],
  ["°c", "c"],
  ["celsius", "c"],
  ["f", "f"],
  ["°f", "f"],
  ["fahrenheit", "f"],
  ["k", "k"],
  ["kelvin", "k"],

  ["eur", "eur"],
  ["€", "eur"],
  ["euro", "eur"],
  ["usd", "usd"],
  ["$", "usd"],
  ["dollar", "usd"],
  ["chf", "chf"],
  ["gbp", "gbp"],
  ["£", "gbp"],
]);

const operatorPrecedence = {
  ">": 1,
  ">=": 1,
  "<": 1,
  "<=": 1,
  "==": 1,
  "!=": 1,
  in: 2,
  to: 2,
  as: 2,
  on: 3,
  off: 3,
  "+": 3,
  "-": 3,
  "*": 4,
  "/": 4,
  of: 4,
  von: 4,
  implicit: 4,
  "^": 5,
};

const constants = {
  pi: { value: Math.PI },
  "π": { value: Math.PI },
  e: { value: Math.E },
  true: { value: 1, isBoolean: true },
  false: { value: 0, isBoolean: true },
  wahr: { value: 1, isBoolean: true },
  falsch: { value: 0, isBoolean: true },
};

const wordOperators = new Set(["in", "to", "as", "zu", "als", "of", "von", "on", "off", "plus", "minus", "mal", "min", "max"]);
const operatorWordTestRegex = /^(?:in|to|as|zu|als|of|von|on|off|plus|minus|mal|min|max)$/iu;
const numberTokenRegex = /^(?:\d[\d.,']*|[.,]\d+)%?$/u;
const booleanTokenRegex = /^(?:true|false|wahr|falsch)$/iu;
const highlightTokenRegex = /(>=|<=|==|!=|[+\-*/^()<>=%;,]|@\d+|\b(?:in|to|as|zu|als|of|von|on|off|plus|minus|mal|min|max)\b|\b(?:true|false|wahr|falsch)\b|(?:\d[\d.,']*|[.,]\d+)%?)/giu;

let lastEvaluation = { lineValues: [] };
let appSettings = loadPersistedSettings();
let mathJsLoadPromise = null;
let mathJsLoadState = "idle";

function linearUnit(dimension, symbol, factorToBase) {
  return {
    dimension,
    symbol,
    toBase: (value) => value * factorToBase,
    fromBase: (value) => value / factorToBase,
  };
}

function affineUnit(dimension, symbol, toBase, fromBase) {
  return {
    dimension,
    symbol,
    toBase,
    fromBase,
  };
}

function detectLanguage() {
  if (typeof navigator === "undefined" || !navigator.language) {
    return "de";
  }
  return String(navigator.language).toLowerCase().startsWith("de") ? "de" : "en";
}

function sanitizeLanguage(value) {
  return value === "de" || value === "en" || value === "auto" ? value : DEFAULT_SETTINGS.language;
}

function resolveLanguage(settingLanguage) {
  return settingLanguage === "auto" ? detectLanguage() : settingLanguage;
}

function t(key) {
  const langTable = I18N[currentLanguage] || I18N.de;
  if (Object.prototype.hasOwnProperty.call(langTable, key)) {
    return langTable[key];
  }
  return I18N.de[key] || key;
}

function localizeErrorMessage(message) {
  if (currentLanguage === "de") {
    return message;
  }

  const text = String(message || "");
  const rules = [
    [/^Ungültige Zahl: (.+)$/u, "Invalid number: $1"],
    [/^Unbekanntes Zeichen: (.+)$/u, "Unknown character: $1"],
    [/^Unbekannter Name: (.+)$/u, "Unknown name: $1"],
    [/^Zeile (\d+) leer$/u, "Line $1 is empty"],
    [/^Es gibt noch kein vorheriges Ergebnis$/u, "There is no previous result yet"],
    [/^Division durch 0$/u, "Division by zero"],
    [/^Schließende Klammer fehlt$/u, "Missing closing parenthesis"],
    [/^Ausdruck konnte nicht vollständig geparst werden$/u, "Expression could not be fully parsed"],
    [/^Unerwartetes Ende$/u, "Unexpected end of expression"],
    [/^Unerwartetes Token: (.+)$/u, "Unexpected token: $1"],
    [/^Einheiten nicht kompatibel \((.+)\)$/u, "Units are not compatible ($1)"],
    [/^Wert hat keine Einheit$/u, "Value has no unit"],
    [/^Umrechnung nur für Werte mit Einheit möglich$/u, "Conversion is only possible for values with units"],
    [/^Unbekannte Funktion: (.+)$/u, "Unknown function: $1"],
    [/^Ungültige Zeilenreferenz: (.+)$/u, "Invalid line reference: $1"]
  ];

  for (const [pattern, replacement] of rules) {
    if (pattern.test(text)) {
      return text.replace(pattern, replacement);
    }
  }
  return text;
}

function setTextById(id, text) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  el.textContent = text;
}

function setHtmlById(id, html) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  el.innerHTML = html;
}

function applyLocalization() {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.lang = currentLanguage === "de" ? "de" : "en";
  document.title = t("appTitle");
  const appleTitleMeta = document.querySelector("meta[name='apple-mobile-web-app-title']");
  if (appleTitleMeta) {
    appleTitleMeta.setAttribute("content", t("appTitle"));
  }

  setTextById("ui-title", t("appTitle"));
  setTextById("ui-subtitle", t("appSubtitle"));
  setTextById("pane-title-input", t("paneInput"));
  setTextById("pane-title-output", t("paneOutput"));
  setTextById("settings-heading", t("settingsHeading"));
  setTextById("settings-group-calc", t("settingsGroupCalc"));
  setTextById("settings-group-display", t("settingsGroupDisplay"));
  setTextById("settings-group-number-format", t("settingsGroupNumberFormat"));
  setTextById("label-use-mathjs", t("labelUseMathJs"));
  setTextById("label-precise-intermediate", t("labelPreciseIntermediate"));
  setTextById("label-decimals", t("labelDecimals"));
  setTextById("label-fixed-decimals", t("labelFixedDecimals"));
  setTextById("label-integer-no-decimals", t("labelIntegerNoDecimals"));
  setTextById("label-syntax-highlighting", t("labelSyntaxHighlighting"));
  setTextById("label-line-numbers", t("labelLineNumbers"));
  setTextById("label-auto-wrap", t("labelAutoWrap"));
  setTextById("label-language", t("labelLanguage"));
  setTextById("label-decimal-separator", t("labelDecimalSeparator"));
  setTextById("label-thousands-separator", t("labelThousandsSeparator"));
  setHtmlById("hint-comments", t("hintComments"));
  setHtmlById("hint-variables", t("hintVariables"));
  setHtmlById("hint-conversions", t("hintConversions"));

  setTextById("help-syntax-heading", t("helpSyntaxHeading"));
  setTextById("help-functions-heading", t("helpFunctionsHeading"));
  setTextById("help-conversions-heading", t("helpConversionsHeading"));
  setTextById("help-mathjs-heading", t("helpMathJsHeading"));
  setHtmlById("help-syntax-1", t("helpSyntax1"));
  setHtmlById("help-syntax-2", t("helpSyntax2"));
  setHtmlById("help-syntax-3", t("helpSyntax3"));
  setHtmlById("help-syntax-4", t("helpSyntax4"));
  setHtmlById("help-syntax-5", t("helpSyntax5"));
  setHtmlById("help-syntax-6", t("helpSyntax6"));
  setHtmlById("help-syntax-7", t("helpSyntax7"));
  setHtmlById("help-syntax-8", t("helpSyntax8"));
  setHtmlById("help-syntax-9", t("helpSyntax9"));
  setHtmlById("help-functions-1", t("helpFunctions1"));
  setHtmlById("help-functions-2", t("helpFunctions2"));
  setHtmlById("help-functions-3", t("helpFunctions3"));
  setHtmlById("help-functions-4", t("helpFunctions4"));
  setHtmlById("help-functions-5", t("helpFunctions5"));
  setHtmlById("help-link-line", t("helpLinkLine"));
  setHtmlById("help-conv-1", t("helpConv1"));
  setHtmlById("help-conv-2", t("helpConv2"));
  setHtmlById("help-conv-3", t("helpConv3"));
  setHtmlById("help-conv-4", t("helpConv4"));
  setHtmlById("help-conv-5", t("helpConv5"));
  setHtmlById("help-conv-6", t("helpConv6"));
  setHtmlById("help-conv-7", t("helpConv7"));
  setHtmlById("help-conv-8", t("helpConv8"));
  setTextById("download-heading", t("downloadHeading"));
  setTextById("export-pdf-divider-btn", t("exportPdfDivider"));
  setTextById("export-pdf-plain-btn", t("exportPdfPlain"));
  setTextById("export-md-btn", t("exportMarkdown"));
  setTextById("export-json-btn", t("exportJson"));
  setTextById("export-yaml-btn", t("exportYaml"));
  setTextById("load-demo-btn", t("demoButton"));

  if (settingDecimalSeparatorEl) {
    for (const option of settingDecimalSeparatorEl.options) {
      if (option.value === ",") {
        option.textContent = currentLanguage === "de" ? "Komma (,)" : "Comma (,)";
      } else if (option.value === ".") {
        option.textContent = currentLanguage === "de" ? "Punkt (.)" : "Dot (.)";
      }
    }
  }
  if (settingThousandsSeparatorEl) {
    for (const option of settingThousandsSeparatorEl.options) {
      if (option.value === ".") {
        option.textContent = currentLanguage === "de" ? "Punkt (.)" : "Dot (.)";
      } else if (option.value === ",") {
        option.textContent = currentLanguage === "de" ? "Komma (,)" : "Comma (,)";
      } else if (option.value === "'") {
        option.textContent = currentLanguage === "de" ? "Hochkomma (')" : "Apostrophe (')";
      } else if (option.value === "") {
        option.textContent = currentLanguage === "de" ? "Keines" : "None";
      }
    }
  }
  if (settingLanguageEl) {
    for (const option of settingLanguageEl.options) {
      if (option.value === "auto") {
        option.textContent = t("optionLanguageAuto");
      } else if (option.value === "de") {
        option.textContent = t("optionLanguageDe");
      } else if (option.value === "en") {
        option.textContent = t("optionLanguageEn");
      }
    }
  }

  if (helpChipEl) {
    helpChipEl.title = t("buttonHelpTitle");
    helpChipEl.setAttribute("aria-label", t("buttonHelpTitle"));
  }
  if (downloadChipEl) {
    downloadChipEl.title = t("buttonDownloadTitle");
    downloadChipEl.setAttribute("aria-label", t("buttonDownloadTitle"));
  }
  if (settingsChipEl) {
    settingsChipEl.title = t("buttonSettingsTitle");
    settingsChipEl.setAttribute("aria-label", t("buttonSettingsTitle"));
  }
  if (inputEl) {
    inputEl.setAttribute("aria-label", t("inputAria"));
  }
}

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripInlineComment(line) {
  const commentIndex = findInlineDoubleSlashIndex(line);
  if (commentIndex === -1) {
    return line;
  }
  return line.slice(0, commentIndex);
}

function findInlineDoubleSlashIndex(line) {
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < line.length - 1; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    const prev = i > 0 ? line[i - 1] : "";
    const isApostropheBetweenDigits = char === "'" && /\d/u.test(prev) && /\d/u.test(next);
    if (char === "'" && !inDouble && !isApostropheBetweenDigits) {
      inSingle = !inSingle;
      continue;
    }

    if (!inSingle && !inDouble && char === "/" && next === "/") {
      return i;
    }
  }

  return -1;
}

function stripTrailingEquals(line) {
  return line.replace(/\s*(?:=\s*)+$/u, "");
}

function clampDecimalPlaces(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return DEFAULT_SETTINGS.decimalPlaces;
  }
  return Math.max(0, Math.min(10, Math.round(numeric)));
}

function sanitizeDecimalSeparator(value) {
  return DECIMAL_SEPARATOR_OPTIONS.includes(value) ? value : DEFAULT_SETTINGS.decimalSeparator;
}

function sanitizeThousandsSeparator(value) {
  return THOUSANDS_SEPARATOR_OPTIONS.includes(value) ? value : DEFAULT_SETTINGS.thousandsSeparator;
}

function ensureValidSeparators(decimalSeparator, thousandsSeparator) {
  if (!thousandsSeparator || decimalSeparator !== thousandsSeparator) {
    return { decimalSeparator, thousandsSeparator, isValid: true };
  }
  return {
    decimalSeparator,
    thousandsSeparator: decimalSeparator === "." ? "," : ".",
    isValid: false
  };
}

function sanitizeSettings(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const decimalSeparator = sanitizeDecimalSeparator(source.decimalSeparator);
  const thousandsSeparator = sanitizeThousandsSeparator(source.thousandsSeparator);
  const validSeparators = ensureValidSeparators(decimalSeparator, thousandsSeparator);
  return {
    useMathJs: Boolean(source.useMathJs),
    decimalPlaces: clampDecimalPlaces(source.decimalPlaces),
    fixedDecimals: Boolean(source.fixedDecimals),
    integerNoDecimals: Boolean(source.integerNoDecimals),
    preciseIntermediates: source.preciseIntermediates !== false,
    syntaxHighlighting: Boolean(source.syntaxHighlighting),
    lineNumbers: Boolean(source.lineNumbers),
    autoWrap: Boolean(source.autoWrap),
    language: sanitizeLanguage(source.language),
    decimalSeparator: validSeparators.decimalSeparator,
    thousandsSeparator: validSeparators.thousandsSeparator,
  };
}

function persistSettings() {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(appSettings));
  } catch (_error) {
    // Storage ist optional; Fehler sollen die App nicht blockieren.
  }
}

function loadPersistedSettings() {
  if (typeof window === "undefined" || !window.localStorage) {
    return { ...DEFAULT_SETTINGS };
  }
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    return sanitizeSettings(JSON.parse(raw));
  } catch (_error) {
    return { ...DEFAULT_SETTINGS };
  }
}

function parseLocaleNumber(raw) {
  const decimalSeparator = appSettings.decimalSeparator;
  const thousandsSeparator = appSettings.thousandsSeparator;
  const validSeparators = ensureValidSeparators(decimalSeparator, thousandsSeparator);
  let candidate = String(raw).trim();

  if (validSeparators.thousandsSeparator) {
    const groupSep = validSeparators.thousandsSeparator;
    if (candidate.includes(groupSep)) {
      const lastGroupIndex = candidate.lastIndexOf(groupSep);
      const tailAfterLast = candidate.slice(lastGroupIndex + groupSep.length);
      const decimalEscaped = escapeRegExp(validSeparators.decimalSeparator);
      const groupedPattern = new RegExp(`^\\d{3}(?:${decimalEscaped}\\d+)?$`, "u");
      const groupLooksLikeThousands = groupedPattern.test(tailAfterLast);

      if (!candidate.includes(validSeparators.decimalSeparator) && !groupLooksLikeThousands) {
        const integerPart = candidate.slice(0, lastGroupIndex).split(groupSep).join("");
        const fractionPart = candidate.slice(lastGroupIndex + groupSep.length);
        candidate = `${integerPart}${validSeparators.decimalSeparator}${fractionPart}`;
      } else {
        candidate = candidate.split(groupSep).join("");
      }
    }
  }

  const decimalCount = validSeparators.decimalSeparator
    ? (candidate.match(new RegExp(escapeRegExp(validSeparators.decimalSeparator), "g")) || []).length
    : 0;
  if (decimalCount > 1) {
    throw new Error(`Ungültige Zahl: ${raw}`);
  }

  const normalized = validSeparators.decimalSeparator === "."
    ? candidate
    : candidate.replace(validSeparators.decimalSeparator, ".");
  const value = Number(normalized);
  if (!Number.isFinite(value)) {
    throw new Error(`Ungültige Zahl: ${raw}`);
  }
  return value;
}

function tokenize(expression) {
  const tokens = [];
  let i = 0;

  while (i < expression.length) {
    const char = expression[i];
    const nextTwo = expression.slice(i, i + 2);

    if (/\s/u.test(char)) {
      i += 1;
      continue;
    }

    if (nextTwo === ">=" || nextTwo === "<=" || nextTwo === "==" || nextTwo === "!=") {
      tokens.push({ type: "op", value: nextTwo });
      i += 2;
      continue;
    }

    if (char === ">" || char === "<") {
      tokens.push({ type: "op", value: char });
      i += 1;
      continue;
    }

    if (char === "(" || char === ")" || char === "+" || char === "-" || char === "*" || char === "/" || char === "^") {
      tokens.push({ type: char === "(" ? "lparen" : char === ")" ? "rparen" : "op", value: char });
      i += 1;
      continue;
    }

    const nextChar = expression[i + 1] || "";
    const prevToken = tokens.length ? tokens[tokens.length - 1] : null;
    const commaFollowedByDigit = /\d/u.test(nextChar);
    const commaActsAsSeparator = char === "," && (
      !commaFollowedByDigit ||
      (commaFollowedByDigit && prevToken && (prevToken.type === "number" || prevToken.type === "ident" || prevToken.type === "rparen"))
    );
    if (char === ";" || commaActsAsSeparator) {
      tokens.push({ type: "sep", value: ";" });
      i += 1;
      continue;
    }

    const isDigit = /\d/u.test(char);
    const startsWithSeparatorNumber = (char === "," || char === ".") && /\d/u.test(nextChar);
    if (isDigit || startsWithSeparatorNumber) {
      const start = i;
      if (char === "," || char === ".") {
        i += 1;
      }

      while (i < expression.length) {
        const c = expression[i];
        if (/\d/u.test(c) || c === "." || c === "," || c === "'") {
          i += 1;
          continue;
        }
        break;
      }

      const numberRaw = expression.slice(start, i);
      let numberValue = parseLocaleNumber(numberRaw);
      let isPercent = false;

      if (expression[i] === "%") {
        isPercent = true;
        numberValue /= 100;
        i += 1;
      }

      tokens.push({ type: "number", value: numberValue, raw: numberRaw, isPercent });
      continue;
    }

    if (char === "€" || char === "$" || char === "£") {
      tokens.push({ type: "ident", value: char });
      i += 1;
      continue;
    }

    if (/[\p{L}_°]/u.test(char)) {
      const start = i;
      i += 1;
      while (i < expression.length && /[\p{L}\p{N}_°/²]/u.test(expression[i])) {
        i += 1;
      }
      const rawWord = expression.slice(start, i);
      const lower = rawWord.toLowerCase();

      if (wordOperators.has(lower) && !["plus", "minus", "mal", "min", "max"].includes(lower)) {
        const canonical = lower === "zu" ? "to" : lower === "als" ? "as" : lower;
        tokens.push({ type: "op", value: canonical });
      } else if (lower === "mal") {
        tokens.push({ type: "op", value: "*" });
      } else if (lower === "plus") {
        tokens.push({ type: "op", value: "+" });
      } else if (lower === "minus") {
        tokens.push({ type: "op", value: "-" });
      } else {
        tokens.push({ type: "ident", value: rawWord });
      }
      continue;
    }

    throw new Error(`Unbekanntes Zeichen: ${char}`);
  }

  return injectImplicitOperators(tokens);
}

function injectImplicitOperators(tokens) {
  const output = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const current = tokens[i];
    const next = tokens[i + 1];
    output.push(current);

    if (!next) {
      continue;
    }

    const currentEndsPrimary = current.type === "number" || current.type === "ident" || current.type === "rparen";
    const nextStartsPrimary = next.type === "number" || next.type === "ident" || next.type === "lparen";
    const isFunctionCallBoundary = current.type === "ident" && next.type === "lparen";

    if (currentEndsPrimary && nextStartsPrimary && !isFunctionCallBoundary) {
      output.push({ type: "op", value: "implicit" });
    }
  }

  output.push({ type: "eof" });
  return output;
}

function parse(tokens) {
  let index = 0;

  function peek() {
    return tokens[index];
  }

  function consume() {
    const token = tokens[index];
    index += 1;
    return token;
  }

  function parseExpression(minPrecedence = 1) {
    let left = parseUnary();

    while (true) {
      const token = peek();
      if (!token || token.type !== "op") {
        break;
      }

      const precedence = operatorPrecedence[token.value];
      if (!precedence || precedence < minPrecedence) {
        break;
      }

      const op = token.value;
      consume();

      const isRightAssociative = op === "^";
      const nextMin = isRightAssociative ? precedence : precedence + 1;
      const right = parseExpression(nextMin);
      left = { type: "binary", op, left, right };
    }

    return left;
  }

  function parseUnary() {
    const token = peek();
    if (token && token.type === "op" && (token.value === "+" || token.value === "-")) {
      consume();
      return { type: "unary", op: token.value, argument: parseUnary() };
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const token = consume();
    if (!token) {
      throw new Error("Unerwartetes Ende");
    }

    if (token.type === "number") {
      return { type: "number", value: token.value, isPercent: token.isPercent };
    }

    if (token.type === "ident") {
      if (peek() && peek().type === "lparen") {
        consume();
        const args = [];

        if (!peek() || peek().type !== "rparen") {
          while (true) {
            args.push(parseExpression());
            if (peek() && peek().type === "sep") {
              consume();
              continue;
            }
            break;
          }
        }

        const closing = consume();
        if (!closing || closing.type !== "rparen") {
          throw new Error("Schließende Klammer fehlt");
        }

        return { type: "call", name: token.value, args };
      }

      return { type: "identifier", name: token.value };
    }

    if (token.type === "lparen") {
      const expr = parseExpression();
      const closing = consume();
      if (!closing || closing.type !== "rparen") {
        throw new Error("Schließende Klammer fehlt");
      }
      return expr;
    }

    throw new Error(`Unerwartetes Token: ${JSON.stringify(token)}`);
  }

  const tree = parseExpression();
  const end = peek();
  if (!end || end.type !== "eof") {
    throw new Error("Ausdruck konnte nicht vollständig geparst werden");
  }

  return tree;
}

function makeQuantity(value, options = {}) {
  return {
    value,
    unit: options.unit || null,
    dimension: options.dimension || null,
    isPercent: options.isPercent || false,
    isBoolean: options.isBoolean || false,
  };
}

function cloneQuantity(quantity) {
  return {
    value: quantity.value,
    unit: quantity.unit,
    dimension: quantity.dimension,
    isPercent: quantity.isPercent,
    isBoolean: quantity.isBoolean || false,
  };
}

function resolveIdentifier(name, context) {
  const lowered = name.toLowerCase();
  const normalizedKey = normalizeName(name);

  if (context.placeholders.has(name)) {
    return cloneQuantity(context.placeholders.get(name));
  }

  if (Object.prototype.hasOwnProperty.call(constants, lowered)) {
    return cloneQuantity(constants[lowered]);
  }

  if (lowered === "ans" || lowered === "last") {
    if (!context.lastValue) {
      throw new Error("Es gibt noch kein vorheriges Ergebnis");
    }
    return cloneQuantity(context.lastValue);
  }

  if (context.variables.has(normalizedKey)) {
    return cloneQuantity(context.variables.get(normalizedKey).quantity);
  }

  const unitKey = unitAliases.get(lowered);
  if (unitKey) {
    const def = unitDefs[unitKey];
    return makeQuantity(1, { unit: unitKey, dimension: def.dimension });
  }

  throw new Error(`Unbekannter Name: ${name}`);
}

function toBase(quantity) {
  if (!quantity.unit) {
    throw new Error("Umrechnung nur für Werte mit Einheit möglich");
  }
  const unitDef = unitDefs[quantity.unit];
  return unitDef.toBase(quantity.value);
}

function convertToUnit(quantity, targetUnitKey) {
  if (!quantity.unit) {
    throw new Error("Wert hat keine Einheit");
  }

  const sourceDef = unitDefs[quantity.unit];
  const targetDef = unitDefs[targetUnitKey];
  if (!targetDef) {
    throw new Error(`Unbekannte Einheit: ${targetUnitKey}`);
  }
  if (sourceDef.dimension !== targetDef.dimension) {
    throw new Error(`Einheiten nicht kompatibel (${sourceDef.symbol} und ${targetDef.symbol})`);
  }

  const baseValue = sourceDef.toBase(quantity.value);
  const converted = targetDef.fromBase(baseValue);
  return makeQuantity(converted, { unit: targetUnitKey, dimension: targetDef.dimension, isPercent: quantity.isPercent });
}

function toNumericValue(quantity) {
  if (quantity.isBoolean) {
    return quantity.value ? 1 : 0;
  }
  if (!Number.isFinite(quantity.value)) {
    throw new Error("Ungültiger numerischer Wert");
  }
  return quantity.value;
}

function toArithmeticQuantity(quantity) {
  if (!quantity.isBoolean) {
    return quantity;
  }
  return makeQuantity(quantity.value ? 1 : 0, {
    unit: quantity.unit,
    dimension: quantity.dimension,
    isPercent: quantity.isPercent,
    isBoolean: false,
  });
}

function normalizeComparablePair(left, right) {
  const leftArithmetic = toArithmeticQuantity(left);
  const rightArithmetic = toArithmeticQuantity(right);

  if (leftArithmetic.unit && rightArithmetic.unit) {
    if (leftArithmetic.dimension !== rightArithmetic.dimension) {
      throw new Error("Vergleich zwischen unterschiedlichen Einheiten ist nicht möglich");
    }
    return {
      left: leftArithmetic,
      right: convertToUnit(rightArithmetic, leftArithmetic.unit),
    };
  }

  if (leftArithmetic.unit || rightArithmetic.unit) {
    throw new Error("Vergleich zwischen Wert mit und ohne Einheit ist nicht möglich");
  }

  return { left: leftArithmetic, right: rightArithmetic };
}

function ensureCompatibleForSum(left, right) {
  const leftArithmetic = toArithmeticQuantity(left);
  const rightArithmetic = toArithmeticQuantity(right);

  if (leftArithmetic.unit && rightArithmetic.unit) {
    if (leftArithmetic.dimension !== rightArithmetic.dimension) {
      throw new Error("Einheiten mit unterschiedlicher Dimension können nicht addiert werden");
    }
    return {
      left: leftArithmetic,
      right: convertToUnit(rightArithmetic, leftArithmetic.unit),
      unit: leftArithmetic.unit,
      dimension: leftArithmetic.dimension,
    };
  }

  if (leftArithmetic.unit && !rightArithmetic.unit) {
    return {
      left: leftArithmetic,
      right: makeQuantity(toNumericValue(rightArithmetic), { unit: leftArithmetic.unit, dimension: leftArithmetic.dimension }),
      unit: leftArithmetic.unit,
      dimension: leftArithmetic.dimension,
    };
  }

  if (!leftArithmetic.unit && rightArithmetic.unit) {
    return {
      left: makeQuantity(toNumericValue(leftArithmetic), { unit: rightArithmetic.unit, dimension: rightArithmetic.dimension }),
      right: rightArithmetic,
      unit: rightArithmetic.unit,
      dimension: rightArithmetic.dimension,
    };
  }

  return { left: leftArithmetic, right: rightArithmetic, unit: null, dimension: null };
}

function applyPlus(left, right) {
  const leftArithmetic = toArithmeticQuantity(left);
  const rightArithmetic = toArithmeticQuantity(right);

  if (!leftArithmetic.isPercent && rightArithmetic.isPercent) {
    return makeQuantity(toNumericValue(leftArithmetic) * (1 + toNumericValue(rightArithmetic)), {
      unit: leftArithmetic.unit,
      dimension: leftArithmetic.dimension,
      isPercent: false,
    });
  }

  const aligned = ensureCompatibleForSum(leftArithmetic, rightArithmetic);
  const sum = aligned.left.value + aligned.right.value;
  return makeQuantity(sum, { unit: aligned.unit, dimension: aligned.dimension, isPercent: leftArithmetic.isPercent && rightArithmetic.isPercent });
}

function applyMinus(left, right) {
  const leftArithmetic = toArithmeticQuantity(left);
  const rightArithmetic = toArithmeticQuantity(right);

  if (!leftArithmetic.isPercent && rightArithmetic.isPercent) {
    return makeQuantity(toNumericValue(leftArithmetic) * (1 - toNumericValue(rightArithmetic)), {
      unit: leftArithmetic.unit,
      dimension: leftArithmetic.dimension,
      isPercent: false,
    });
  }

  const aligned = ensureCompatibleForSum(leftArithmetic, rightArithmetic);
  const diff = aligned.left.value - aligned.right.value;
  return makeQuantity(diff, { unit: aligned.unit, dimension: aligned.dimension, isPercent: leftArithmetic.isPercent && rightArithmetic.isPercent });
}

function applyMultiply(left, right) {
  const leftArithmetic = toArithmeticQuantity(left);
  const rightArithmetic = toArithmeticQuantity(right);

  if (leftArithmetic.unit && rightArithmetic.unit) {
    throw new Error("Multiplikation zweier Einheiten ist hier nicht unterstützt");
  }

  if (leftArithmetic.unit) {
    return makeQuantity(toNumericValue(leftArithmetic) * toNumericValue(rightArithmetic), { unit: leftArithmetic.unit, dimension: leftArithmetic.dimension });
  }

  if (rightArithmetic.unit) {
    return makeQuantity(toNumericValue(leftArithmetic) * toNumericValue(rightArithmetic), { unit: rightArithmetic.unit, dimension: rightArithmetic.dimension });
  }

  return makeQuantity(toNumericValue(leftArithmetic) * toNumericValue(rightArithmetic));
}

function applyDivision(left, right) {
  const leftArithmetic = toArithmeticQuantity(left);
  const rightArithmetic = toArithmeticQuantity(right);

  if (toNumericValue(rightArithmetic) === 0) {
    throw new Error("Division durch 0");
  }

  if (leftArithmetic.unit && rightArithmetic.unit) {
    if (leftArithmetic.dimension !== rightArithmetic.dimension) {
      throw new Error("Division mit unterschiedlichen Einheiten ist nicht unterstützt");
    }
    const convertedRight = convertToUnit(rightArithmetic, leftArithmetic.unit);
    return makeQuantity(toNumericValue(leftArithmetic) / toNumericValue(convertedRight));
  }

  if (!leftArithmetic.unit && rightArithmetic.unit) {
    throw new Error("Division durch einen Einheitenwert ist nicht unterstützt");
  }

  if (leftArithmetic.unit && !rightArithmetic.unit) {
    return makeQuantity(toNumericValue(leftArithmetic) / toNumericValue(rightArithmetic), { unit: leftArithmetic.unit, dimension: leftArithmetic.dimension });
  }

  return makeQuantity(toNumericValue(leftArithmetic) / toNumericValue(rightArithmetic));
}

function applyPower(left, right) {
  const leftArithmetic = toArithmeticQuantity(left);
  const rightArithmetic = toArithmeticQuantity(right);

  if (leftArithmetic.unit || rightArithmetic.unit) {
    throw new Error("Potenzen mit Einheiten sind nicht unterstützt");
  }
  return makeQuantity(toNumericValue(leftArithmetic) ** toNumericValue(rightArithmetic));
}

function applyConversion(left, right) {
  const rightIsPureUnit = right.unit && !right.isPercent && Math.abs(right.value - 1) < 1e-12;
  const leftIsPureUnit = left.unit && !left.isPercent && Math.abs(left.value - 1) < 1e-12;

  if (left.unit && rightIsPureUnit) {
    return convertToUnit(left, right.unit);
  }

  if (leftIsPureUnit && right.unit) {
    return convertToUnit(right, left.unit);
  }

  throw new Error("Umrechnung benötigt einen Wert mit Einheit und eine Ziel-Einheit");
}

function applyComparison(left, right, operator) {
  const normalized = normalizeComparablePair(left, right);
  const leftValue = toNumericValue(normalized.left);
  const rightValue = toNumericValue(normalized.right);
  let result = false;

  switch (operator) {
    case ">":
      result = leftValue > rightValue;
      break;
    case ">=":
      result = leftValue >= rightValue;
      break;
    case "<":
      result = leftValue < rightValue;
      break;
    case "<=":
      result = leftValue <= rightValue;
      break;
    case "==":
      result = leftValue === rightValue;
      break;
    case "!=":
      result = leftValue !== rightValue;
      break;
    default:
      throw new Error(`Vergleichsoperator nicht unterstützt: ${operator}`);
  }

  return makeQuantity(result ? 1 : 0, { isBoolean: true });
}

function applyMinMaxCall(functionName, args) {
  if (!args.length) {
    throw new Error(`${functionName} benötigt mindestens ein Argument`);
  }

  const normalizedArgs = args.map((arg) => toArithmeticQuantity(arg));
  const hasUnit = normalizedArgs.some((arg) => arg.unit);
  const hasUnitless = normalizedArgs.some((arg) => !arg.unit);

  if (hasUnit && hasUnitless) {
    throw new Error(`${functionName} kann Werte mit und ohne Einheit nicht mischen`);
  }

  let candidates = normalizedArgs.map((arg) => cloneQuantity(arg));
  if (hasUnit) {
    const baseUnit = candidates[0].unit;
    const baseDimension = candidates[0].dimension;
    candidates = candidates.map((candidate) => {
      if (candidate.dimension !== baseDimension) {
        throw new Error(`${functionName} benötigt kompatible Einheiten`);
      }
      return convertToUnit(candidate, baseUnit);
    });
  }

  let selected = candidates[0];
  for (let i = 1; i < candidates.length; i += 1) {
    const current = candidates[i];
    const shouldTakeCurrent = functionName === "min"
      ? toNumericValue(current) < toNumericValue(selected)
      : toNumericValue(current) > toNumericValue(selected);
    if (shouldTakeCurrent) {
      selected = current;
    }
  }

  selected.isBoolean = false;
  return selected;
}

function applySumCall(args) {
  if (!args.length) {
    return makeQuantity(0);
  }
  let total = cloneQuantity(toArithmeticQuantity(args[0]));
  for (let i = 1; i < args.length; i += 1) {
    total = applyPlus(total, toArithmeticQuantity(args[i]));
  }
  total.isBoolean = false;
  return total;
}

function applyAverageCall(args) {
  if (!args.length) {
    throw new Error("Durchschnitt benötigt mindestens ein Argument");
  }
  const total = applySumCall(args);
  return applyDivision(total, makeQuantity(args.length));
}

function applyCountCall(args) {
  return makeQuantity(args.length);
}

function evaluateAst(node, context) {
  if (node.type === "number") {
    return makeQuantity(node.value, { isPercent: node.isPercent });
  }

  if (node.type === "identifier") {
    return resolveIdentifier(node.name, context);
  }

  if (node.type === "call") {
    const functionName = node.name.toLowerCase();
    const argValues = node.args.map((arg) => evaluateAst(arg, context));
    if (functionName === "min" || functionName === "max") {
      return applyMinMaxCall(functionName, argValues);
    }
    if (functionName === "summe" || functionName === "sum") {
      return applySumCall(argValues);
    }
    if (functionName === "durchschnitt" || functionName === "avg" || functionName === "average" || functionName === "mittelwert") {
      return applyAverageCall(argValues);
    }
    if (functionName === "anzahl" || functionName === "count") {
      return applyCountCall(argValues);
    }
    throw new Error(`Unbekannte Funktion: ${node.name}`);
  }

  if (node.type === "unary") {
    const arg = toArithmeticQuantity(evaluateAst(node.argument, context));
    if (node.op === "+") {
      return arg;
    }
    return makeQuantity(-toNumericValue(arg), {
      unit: arg.unit,
      dimension: arg.dimension,
      isPercent: arg.isPercent,
    });
  }

  if (node.type === "binary") {
    const left = evaluateAst(node.left, context);
    const right = evaluateAst(node.right, context);

    switch (node.op) {
      case "+":
        return applyPlus(left, right);
      case "-":
        return applyMinus(left, right);
      case "*":
      case "of":
      case "von":
        return applyMultiply(left, right);
      case "/":
        return applyDivision(left, right);
      case "^":
        return applyPower(left, right);
      case "in":
      case "to":
      case "as":
        return applyConversion(left, right);
      case "on":
        return applyPlus(right, left);
      case "off":
        return applyMinus(right, left);
      case "implicit":
        return applyMultiply(left, right);
      case ">":
      case ">=":
      case "<":
      case "<=":
      case "==":
      case "!=":
        return applyComparison(left, right, node.op);
      default:
        throw new Error(`Operator nicht unterstützt: ${node.op}`);
    }
  }

  throw new Error("Unbekannter AST-Knoten");
}

function preprocessExpression(expression, variables, lineValues) {
  let value = expression
    .replace(/×/gu, "*")
    .replace(/÷/gu, "/")
    .replace(/[–—]/gu, "-")
    .replace(/\bprozent\b/giu, "%")
    .replace(/(\d[\d.,']*|[.,]\d+)\s*%/gu, "$1%");

  // Schreibweisen wie "5 h 30 min" werden in "5 h + 30 min" überführt.
  const compoundPattern = /(\d[\d.,']*\s*°?[\p{L}²/]+)\s+(?=\d[\d.,']*\s*°?[\p{L}²/]+)/gu;
  let previous;
  do {
    previous = value;
    value = value.replace(compoundPattern, "$1 + ");
  } while (value !== previous);

  const placeholders = new Map();
  let placeholderIndex = 0;

  const multiWordVars = [...variables.values()]
    .map((entry) => entry.name)
    .filter((name) => /\s/u.test(name))
    .sort((a, b) => b.length - a.length);

  for (const name of multiWordVars) {
    const normalizedKey = normalizeName(name);
    const variable = variables.get(normalizedKey);
    if (!variable) {
      continue;
    }

    const placeholder = `__var_${placeholderIndex}`;
    placeholderIndex += 1;

    const pattern = name
      .trim()
      .split(/\s+/u)
      .map((part) => escapeRegExp(part))
      .join("\\s+");
    const regex = new RegExp(`(^|[^\\p{L}\\p{N}_])(${pattern})(?=$|[^\\p{L}\\p{N}_])`, "giu");

    value = value.replace(regex, (match, prefix) => `${prefix}${placeholder}`);
    placeholders.set(placeholder, variable.quantity);
  }

  value = value.replace(/@(\d+)\s*:\s*@(\d+)/gu, (match, startRaw, endRaw) => {
    const start = Number(startRaw);
    const end = Number(endRaw);
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      return match;
    }

    const step = start <= end ? 1 : -1;
    const placeholdersForRange = [];
    for (let lineNo = start; step > 0 ? lineNo <= end : lineNo >= end; lineNo += step) {
      if (lineNo < 1 || lineNo > lineValues.length) {
        throw new Error(`Ungültige Zeilenreferenz: @${lineNo}`);
      }
      const lineValue = lineValues[lineNo - 1];
      if (!lineValue) {
        continue;
      }
      const placeholder = `__line_${placeholderIndex}`;
      placeholderIndex += 1;
      placeholders.set(placeholder, lineValue);
      placeholdersForRange.push(placeholder);
    }

    if (!placeholdersForRange.length) {
      return "0";
    }
    return placeholdersForRange.join(";");
  });

  value = value.replace(/@(\d+)/g, (match, lineNoRaw) => {
    const lineNo = Number(lineNoRaw);
    if (!Number.isInteger(lineNo) || lineNo < 1 || lineNo > lineValues.length) {
      return match;
    }
    const lineValue = lineValues[lineNo - 1];
    if (!lineValue) {
      throw new Error(`Zeile ${lineNo} leer`);
    }
    const placeholder = `__line_${placeholderIndex}`;
    placeholderIndex += 1;
    placeholders.set(placeholder, lineValue);
    return placeholder;
  });

  return { expression: value, placeholders };
}

function parseAssignment(line) {
  const plusAssign = line.match(/^(.+?)\s*(\+=|-=)\s*(.+)$/u);
  if (plusAssign) {
    const lhs = plusAssign[1].trim();
    const op = plusAssign[2];
    const rhs = plusAssign[3].trim();
    if (!lhs || !rhs || /[()*/^]/u.test(lhs)) {
      return null;
    }
    return { lhs, op, rhs };
  }

  let assignIndex = -1;
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] !== "=") {
      continue;
    }
    const prev = i > 0 ? line[i - 1] : "";
    const next = i + 1 < line.length ? line[i + 1] : "";
    const isComparison = prev === "<" || prev === ">" || prev === "!" || prev === "=" || next === "=";
    if (isComparison) {
      continue;
    }
    if (assignIndex !== -1) {
      return null;
    }
    assignIndex = i;
  }

  if (assignIndex === -1) {
    return null;
  }

  const lhs = line.slice(0, assignIndex).trim();
  const rhs = line.slice(assignIndex + 1).trim();
  if (!lhs || !rhs || /[()*/^]/u.test(lhs)) {
    return null;
  }

  return { lhs, op: "=", rhs };
}

function expandUnitShorthand(line) {
  const trimmed = line.trim();
  const match = trimmed.match(/^([^\s]+)\s+([^\s]+)$/u);
  if (!match) {
    return line;
  }

  const left = match[1].toLowerCase();
  const right = match[2].toLowerCase();
  if (!unitAliases.has(left) || !unitAliases.has(right)) {
    return line;
  }

  return `1 ${match[1]} in ${match[2]}`;
}

function maybeStripLabel(line) {
  const match = line.match(/^([^:]+):\s*(.+)$/u);
  if (!match) {
    return line;
  }
  if (/^\d{1,2}$/u.test(match[1].trim()) && /^\d{2}\b/u.test(match[2].trim())) {
    return line;
  }
  return match[2];
}

function getDisplayFractionDigits() {
  return clampDecimalPlaces(appSettings.decimalPlaces);
}

function isEffectivelyInteger(value) {
  if (!Number.isFinite(value)) {
    return false;
  }
  const nearest = Math.round(value);
  const tolerance = Math.max(1e-9, Math.abs(value) * 1e-12);
  return Math.abs(value - nearest) <= tolerance;
}

function roundToDecimals(value, decimals) {
  if (!Number.isFinite(value)) {
    return value;
  }
  if (decimals <= 0) {
    return Math.round(value);
  }
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function quantizeQuantityForStorage(quantity) {
  if (appSettings.preciseIntermediates) {
    return cloneQuantity(quantity);
  }

  const rounded = cloneQuantity(quantity);
  if (rounded.isBoolean) {
    return rounded;
  }
  const decimals = getDisplayFractionDigits();

  if (rounded.isPercent && !rounded.unit) {
    const percentRounded = roundToDecimals(rounded.value * 100, decimals);
    rounded.value = percentRounded / 100;
  } else {
    rounded.value = roundToDecimals(rounded.value, decimals);
  }

  return rounded;
}

function groupIntegerPart(integerPart, separator) {
  if (!separator) {
    return integerPart;
  }
  let grouped = "";
  for (let i = 0; i < integerPart.length; i += 1) {
    const fromRight = integerPart.length - i;
    grouped += integerPart[i];
    if (fromRight > 1 && fromRight % 3 === 1) {
      grouped += separator;
    }
  }
  return grouped;
}

function formatNumber(value, fractionDigits = getDisplayFractionDigits()) {
  const rounded = Object.is(value, -0) ? 0 : value;
  const showAsInteger = appSettings.integerNoDecimals && isEffectivelyInteger(rounded);
  const minDigits = showAsInteger ? 0 : appSettings.fixedDecimals ? fractionDigits : 0;
  const maxDigits = showAsInteger ? 0 : fractionDigits;
  const sign = rounded < 0 ? "-" : "";
  const absolute = Math.abs(rounded);
  let raw = absolute.toFixed(maxDigits);
  let [integerPart, fractionalPart = ""] = raw.split(".");

  if (!appSettings.fixedDecimals) {
    while (fractionalPart.length > minDigits && fractionalPart.endsWith("0")) {
      fractionalPart = fractionalPart.slice(0, -1);
    }
  }

  if (fractionalPart.length < minDigits) {
    fractionalPart = fractionalPart.padEnd(minDigits, "0");
  }

  const groupedInteger = groupIntegerPart(integerPart, appSettings.thousandsSeparator);
  if (!fractionalPart.length) {
    return `${sign}${groupedInteger}`;
  }
  return `${sign}${groupedInteger}${appSettings.decimalSeparator}${fractionalPart}`;
}

function formatQuantity(quantity) {
  if (quantity.isBoolean) {
    return quantity.value ? "true" : "false";
  }

  if (!Number.isFinite(quantity.value)) {
    return currentLanguage === "de" ? "Ungültiges Ergebnis" : "Invalid result";
  }

  if (quantity.isPercent && !quantity.unit) {
    return `${formatNumber(quantity.value * 100)} %`;
  }

  const number = formatNumber(quantity.value);
  if (!quantity.unit) {
    return number;
  }
  return `${number} ${unitDefs[quantity.unit].symbol}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function classifyHighlightToken(token) {
  if (token.startsWith("@")) {
    return "ref";
  }
  if (numberTokenRegex.test(token)) {
    return "number";
  }
  if (booleanTokenRegex.test(token)) {
    return "boolean";
  }
  if (operatorWordTestRegex.test(token) || /^(?:>=|<=|==|!=|[+\-*/^()<>=%;,])$/u.test(token)) {
    return "operator";
  }
  return "plain";
}

function tokenizeForHighlight(code) {
  const parts = [];
  let lastIndex = 0;
  highlightTokenRegex.lastIndex = 0;
  let match = highlightTokenRegex.exec(code);

  while (match) {
    if (match.index > lastIndex) {
      parts.push({ text: code.slice(lastIndex, match.index), kind: "plain" });
    }

    const token = match[0];
    parts.push({ text: token, kind: classifyHighlightToken(token) });
    lastIndex = match.index + token.length;
    match = highlightTokenRegex.exec(code);
  }

  if (lastIndex < code.length) {
    parts.push({ text: code.slice(lastIndex), kind: "plain" });
  }

  if (!parts.length) {
    parts.push({ text: code, kind: "plain" });
  }
  return parts;
}

function splitLineForHighlight(line) {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("#") || trimmed.startsWith("//")) {
    return { code: "", comment: line };
  }

  const inlineCommentIndex = findInlineDoubleSlashIndex(line);
  if (inlineCommentIndex === -1) {
    return { code: line, comment: "" };
  }

  return {
    code: line.slice(0, inlineCommentIndex),
    comment: line.slice(inlineCommentIndex),
  };
}

function getLineHighlightSegments(line) {
  const split = splitLineForHighlight(line);
  const segments = [];

  if (split.code) {
    segments.push(...tokenizeForHighlight(split.code));
  } else if (!split.comment) {
    segments.push({ text: "", kind: "plain" });
  }

  if (split.comment) {
    segments.push({ text: split.comment, kind: "comment" });
  }

  return segments;
}

function renderHighlightedLineHtml(line) {
  const segments = getLineHighlightSegments(line);
  return segments
    .map((segment) => {
      const escaped = escapeHtml(segment.text);
      if (segment.kind === "plain") {
        return escaped;
      }
      return `<span class="hl-${segment.kind}">${escaped}</span>`;
    })
    .join("");
}

function renderInputHighlight() {
  if (!highlightEl) {
    return;
  }
  if (!appSettings.syntaxHighlighting) {
    highlightEl.innerHTML = "";
    return;
  }

  const lines = inputEl.value.split("\n");
  const rendered = lines.map((line) => renderHighlightedLineHtml(line)).join("\n");
  highlightEl.innerHTML = rendered || "";
  highlightEl.scrollTop = inputEl.scrollTop;
  highlightEl.scrollLeft = inputEl.scrollLeft;
}

function getMathJsInstance() {
  if (typeof window === "undefined" || !window.math) {
    return null;
  }
  if (typeof window.math.evaluate !== "function") {
    return null;
  }
  return window.math;
}

function expressionContainsKnownUnit(expression) {
  const words = expression.match(/[\p{L}°][\p{L}\p{N}_°/²]*/gu);
  if (!words) {
    return false;
  }
  for (const word of words) {
    if (unitAliases.has(word.toLowerCase())) {
      return true;
    }
  }
  return false;
}

function normalizeLocaleNumbersForMathJs(expression) {
  let output = "";
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];
    const prev = index > 0 ? expression[index - 1] : "";
    const next = index + 1 < expression.length ? expression[index + 1] : "";
    const startsWithSeparatedDecimal = (char === "," || char === ".") && /\d/u.test(next);
    const startsWithDigit = /\d/u.test(char);
    const prevIsIdentifier = prev ? /[\p{L}\p{N}_]/u.test(prev) : false;

    if ((startsWithDigit || startsWithSeparatedDecimal) && !prevIsIdentifier) {
      const start = index;
      if (startsWithSeparatedDecimal) {
        index += 1;
      }

      while (index < expression.length) {
        const current = expression[index];
        if (/\d/u.test(current) || current === "." || current === "," || current === "'") {
          index += 1;
          continue;
        }
        break;
      }

      const rawNumber = expression.slice(start, index);
      try {
        output += String(parseLocaleNumber(rawNumber));
      } catch (_error) {
        output += rawNumber;
      }
      continue;
    }

    output += char;
    index += 1;
  }

  return output;
}

function normalizeExpressionForMathJs(expression) {
  return normalizeLocaleNumbersForMathJs(
    expression
      .replace(/\bmal\b/giu, "*")
      .replace(/\bplus\b/giu, "+")
      .replace(/\bminus\b/giu, "-")
      .replace(/\bof\b/giu, "*")
      .replace(/\bvon\b/giu, "*")
  ).toLowerCase();
}

function buildMathJsScope(context, placeholders) {
  const scope = {};

  for (const [name, quantity] of placeholders.entries()) {
    if (!quantity || quantity.unit) {
      return null;
    }
    scope[name.toLowerCase()] = quantity.value;
  }

  for (const [normalizedName, variable] of context.variables.entries()) {
    if (!variable || !variable.quantity || variable.quantity.unit) {
      continue;
    }
    scope[normalizedName] = variable.quantity.value;
    const originalName = variable.name.trim().toLowerCase();
    if (originalName && !/\s/u.test(originalName)) {
      scope[originalName] = variable.quantity.value;
    }
  }

  if (context.lastValue && !context.lastValue.unit) {
    scope.ans = context.lastValue.value;
    scope.last = context.lastValue.value;
  }

  return scope;
}

function shouldTryMathJs(preprocessed) {
  if (!appSettings.useMathJs || !getMathJsInstance()) {
    return false;
  }
  if (/;/u.test(preprocessed.expression)) {
    return false;
  }
  if (/%/u.test(preprocessed.expression)) {
    return false;
  }
  if (/\b(in|to|as|zu|als|on|off|von)\b/iu.test(preprocessed.expression)) {
    return false;
  }
  if (/[€£$°]/u.test(preprocessed.expression)) {
    return false;
  }
  return !expressionContainsKnownUnit(preprocessed.expression);
}

function toNumericMathValue(value) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (!value || typeof value !== "object") {
    return NaN;
  }
  if (typeof value.toNumber === "function") {
    return value.toNumber();
  }
  if (typeof value.valueOf === "function") {
    const primitive = value.valueOf();
    if (typeof primitive === "number") {
      return primitive;
    }
  }
  return NaN;
}

function evaluateExpressionWithParser(preprocessed, context) {
  const tokens = tokenize(preprocessed.expression);
  const ast = parse(tokens);
  return evaluateAst(ast, {
    variables: context.variables,
    placeholders: preprocessed.placeholders,
    lastValue: context.lastValue,
  });
}

function evaluateExpressionWithMathJs(preprocessed, context) {
  const math = getMathJsInstance();
  if (!math) {
    throw new Error("math.js ist nicht geladen");
  }

  const scope = buildMathJsScope(context, preprocessed.placeholders);
  if (!scope) {
    throw new Error("math.js kann Ausdrücke mit Einheiten hier nicht auswerten");
  }

  const mathExpression = normalizeExpressionForMathJs(preprocessed.expression);
  const result = math.evaluate(mathExpression, scope);
  if (typeof result === "boolean") {
    return makeQuantity(result ? 1 : 0, { isBoolean: true });
  }
  const numeric = toNumericMathValue(result);
  if (!Number.isFinite(numeric)) {
    throw new Error("math.js-Ergebnis ist nicht numerisch");
  }
  return makeQuantity(numeric);
}

function evaluateExpression(expression, context) {
  const preprocessed = preprocessExpression(expression, context.variables, context.lineValues);

  if (shouldTryMathJs(preprocessed)) {
    try {
      return evaluateExpressionWithMathJs(preprocessed, context);
    } catch (_error) {
      return evaluateExpressionWithParser(preprocessed, context);
    }
  }

  return evaluateExpressionWithParser(preprocessed, context);
}

function evaluateLine(rawLine, context) {
  const original = rawLine;
  const trimmed = original.trim();

  if (trimmed.length === 0) {
    return { type: "empty", display: "", value: null };
  }

  if (trimmed.startsWith("#") || trimmed.startsWith("//")) {
    return { type: "comment", display: "", value: null };
  }

  const withoutInlineComment = stripInlineComment(original).trim();
  if (!withoutInlineComment) {
    return { type: "comment", display: "", value: null };
  }

  const sanitizedLine = stripTrailingEquals(withoutInlineComment).trim();
  if (!sanitizedLine) {
    return { type: "comment", display: "", value: null };
  }

  const formulaLine = sanitizedLine.startsWith("=") ? sanitizedLine.slice(1).trim() : sanitizedLine;
  if (!formulaLine) {
    return { type: "comment", display: "", value: null };
  }

  const assignment = parseAssignment(formulaLine);
  if (assignment) {
    const rhsExpr = maybeStripLabel(assignment.rhs);
    const rhsValue = evaluateExpression(rhsExpr, context);
    const normalizedKey = normalizeName(assignment.lhs);
    const existing = context.variables.get(normalizedKey);

    let assignedValue;
    if (assignment.op === "=") {
      assignedValue = rhsValue;
    } else if (assignment.op === "+=") {
      const base = existing ? existing.quantity : makeQuantity(0);
      assignedValue = applyPlus(cloneQuantity(base), rhsValue);
    } else if (assignment.op === "-=") {
      const base = existing ? existing.quantity : makeQuantity(0);
      assignedValue = applyMinus(cloneQuantity(base), rhsValue);
    } else {
      throw new Error(`Unbekannter Zuweisungsoperator: ${assignment.op}`);
    }

    const storedValue = quantizeQuantityForStorage(assignedValue);
    context.variables.set(normalizedKey, { name: assignment.lhs.trim(), quantity: cloneQuantity(storedValue) });
    context.lastValue = cloneQuantity(storedValue);
    return {
      type: "result",
      display: formatQuantity(storedValue),
      value: cloneQuantity(storedValue),
    };
  }

  const expression = expandUnitShorthand(maybeStripLabel(formulaLine));
  const result = evaluateExpression(expression, context);
  const storedValue = quantizeQuantityForStorage(result);
  context.lastValue = cloneQuantity(storedValue);
  return { type: "result", display: formatQuantity(storedValue), value: cloneQuantity(storedValue) };
}

function evaluateSheet(text) {
  const lines = text.split("\n");
  const variables = new Map();
  const lineValues = [];
  const displayRows = [];
  const context = { variables, lineValues, lastValue: null };

  for (let i = 0; i < lines.length; i += 1) {
    try {
      const lineResult = evaluateLine(lines[i], context);
      lineValues[i] = lineResult.value ? cloneQuantity(lineResult.value) : null;
      displayRows.push(lineResult);
    } catch (error) {
      lineValues[i] = null;
      displayRows.push({
        type: "error",
        display: `${t("errorPrefix")}: ${localizeErrorMessage(error.message)}`,
        value: null,
      });
    }
  }

  return { displayRows, variables, lineValues };
}

function renderResults(evaluation) {
  const fragment = document.createDocumentFragment();

  for (const row of evaluation.displayRows) {
    const line = document.createElement("div");
    line.className = `result-line ${row.type}`;
    line.textContent = row.display || "";
    fragment.appendChild(line);
  }

  resultsEl.replaceChildren(fragment);
}

function getEstimatedCharsPerInputVisualLine() {
  if (!inputEl || typeof window === "undefined" || typeof window.getComputedStyle !== "function") {
    return 80;
  }
  const styles = window.getComputedStyle(inputEl);
  const fontSize = styles.fontSize || "16px";
  const fontFamily = styles.fontFamily || "monospace";
  const fontWeight = styles.fontWeight || "500";
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return 80;
  }
  context.font = `${fontWeight} ${fontSize} ${fontFamily}`;
  const charWidth = context.measureText("0").width || 8;
  const paddingLeft = Number.parseFloat(styles.paddingLeft || "0");
  const paddingRight = Number.parseFloat(styles.paddingRight || "0");
  const availableWidth = Math.max(1, inputEl.clientWidth - paddingLeft - paddingRight);
  return Math.max(1, Math.floor(availableWidth / charWidth));
}

function buildInputLineNumberContent() {
  const logicalLines = inputEl.value.split("\n");
  if (!appSettings.autoWrap) {
    return logicalLines.map((_, index) => String(index + 1)).join("\n");
  }

  const charsPerLine = getEstimatedCharsPerInputVisualLine();
  const numberLines = [];
  for (let lineIndex = 0; lineIndex < logicalLines.length; lineIndex += 1) {
    const line = logicalLines[lineIndex].replace(/\t/g, "    ");
    const wrappedCount = Math.max(1, Math.ceil(line.length / charsPerLine));
    numberLines.push(String(lineIndex + 1));
    for (let i = 1; i < wrappedCount; i += 1) {
      numberLines.push("");
    }
  }
  return numberLines.join("\n");
}

function renderLineNumbers(evaluation) {
  if (!inputLineNumbersEl || !resultLineNumbersEl) {
    return;
  }

  if (!appSettings.lineNumbers) {
    inputLineNumbersEl.textContent = "";
    resultLineNumbersEl.textContent = "";
    return;
  }

  const inputLineCount = inputEl.value.split("\n").length;
  const resultLineCount = evaluation && evaluation.displayRows ? evaluation.displayRows.length : 0;
  const lineCount = Math.max(1, inputLineCount, resultLineCount);
  const resultContent = Array.from({ length: lineCount }, (_, index) => String(index + 1)).join("\n");

  inputLineNumbersEl.textContent = buildInputLineNumberContent();
  resultLineNumbersEl.textContent = resultContent;
  inputLineNumbersEl.scrollTop = inputEl.scrollTop;
  resultLineNumbersEl.scrollTop = resultsEl.scrollTop;
}

function recalculate() {
  const evaluation = evaluateSheet(inputEl.value);
  lastEvaluation = evaluation;
  renderResults(evaluation);
  renderLineNumbers(evaluation);
  renderInputHighlight();
}

function persistInput(value) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch (_error) {
    // Storage ist optional; Fehler sollen die App nicht blockieren.
  }
}

function loadPersistedInput() {
  if (typeof window === "undefined" || !window.localStorage) {
    return "";
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY) || "";
  } catch (_error) {
    return "";
  }
}

function setInputAndRecalculate(text) {
  inputEl.value = text;
  persistInput(inputEl.value);
  recalculate();
  inputEl.focus();
}

function updateMathJsStatus() {
  if (!mathJsStatusEl) {
    return;
  }

  if (appSettings.useMathJs && mathJsLoadState === "error") {
    mathJsStatusEl.textContent = t("mathJsStatusError");
    return;
  }

  mathJsStatusEl.textContent = "";
}

function updateNumberSeparatorStatus() {
  if (!separatorStatusEl) {
    return;
  }
  if (appSettings.decimalSeparator === appSettings.thousandsSeparator && appSettings.thousandsSeparator) {
    separatorStatusEl.textContent = t("separatorInvalid");
    separatorStatusEl.style.color = "#b3272d";
    return;
  }
  separatorStatusEl.textContent = t("separatorValid");
  separatorStatusEl.style.color = "#37547b";
}

function ensureMathJsLoaded() {
  if (!appSettings.useMathJs) {
    return Promise.resolve(false);
  }
  if (getMathJsInstance()) {
    mathJsLoadState = "ready";
    updateMathJsStatus();
    return Promise.resolve(true);
  }
  if (typeof document === "undefined") {
    return Promise.resolve(false);
  }
  if (mathJsLoadPromise) {
    return mathJsLoadPromise;
  }

  mathJsLoadState = "loading";
  updateMathJsStatus();

  mathJsLoadPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = MATHJS_CDN_URL;
    script.async = true;
    script.onload = () => {
      mathJsLoadState = getMathJsInstance() ? "ready" : "error";
      if (mathJsLoadState !== "ready") {
        mathJsLoadPromise = null;
      }
      updateMathJsStatus();
      recalculate();
      resolve(Boolean(getMathJsInstance()));
    };
    script.onerror = () => {
      mathJsLoadState = "error";
      mathJsLoadPromise = null;
      updateMathJsStatus();
      resolve(false);
    };
    const mountPoint = document.head || document.body;
    if (!mountPoint || typeof mountPoint.appendChild !== "function") {
      mathJsLoadState = "error";
      updateMathJsStatus();
      resolve(false);
      return;
    }
    mountPoint.appendChild(script);
  });

  return mathJsLoadPromise;
}

function applySettingsToUi() {
  currentLanguage = resolveLanguage(appSettings.language);
  applyLocalization();

  if (settingUseMathJsEl) {
    settingUseMathJsEl.checked = appSettings.useMathJs;
  }
  if (settingDecimalsEl) {
    settingDecimalsEl.value = String(clampDecimalPlaces(appSettings.decimalPlaces));
  }
  if (settingFixedDecimalsEl) {
    settingFixedDecimalsEl.checked = appSettings.fixedDecimals;
  }
  if (settingIntegerNoDecimalsEl) {
    settingIntegerNoDecimalsEl.checked = appSettings.integerNoDecimals;
  }
  if (settingPreciseIntermediateEl) {
    settingPreciseIntermediateEl.checked = appSettings.preciseIntermediates;
  }
  if (settingSyntaxHighlightEl) {
    settingSyntaxHighlightEl.checked = appSettings.syntaxHighlighting;
  }
  if (settingLineNumbersEl) {
    settingLineNumbersEl.checked = appSettings.lineNumbers;
  }
  if (settingAutoWrapEl) {
    settingAutoWrapEl.checked = appSettings.autoWrap;
  }
  if (settingLanguageEl) {
    settingLanguageEl.value = appSettings.language;
  }
  if (settingDecimalSeparatorEl) {
    settingDecimalSeparatorEl.value = appSettings.decimalSeparator;
  }
  if (settingThousandsSeparatorEl) {
    settingThousandsSeparatorEl.value = appSettings.thousandsSeparator;
  }
  if (mathJsHelpEl) {
    mathJsHelpEl.hidden = !appSettings.useMathJs;
  }
  if (appEl && appEl.classList) {
    appEl.classList.toggle("syntax-highlight", appSettings.syntaxHighlighting);
    appEl.classList.toggle("show-line-numbers", appSettings.lineNumbers);
    appEl.classList.toggle("auto-wrap", appSettings.autoWrap);
  }
  if (inputEl) {
    inputEl.wrap = appSettings.autoWrap ? "soft" : "off";
  }
  updateMathJsStatus();
  updateNumberSeparatorStatus();
  renderLineNumbers(lastEvaluation);
  renderInputHighlight();
}

function patchSettings(update) {
  appSettings = sanitizeSettings({ ...appSettings, ...update });
  persistSettings();
  applySettingsToUi();
  recalculate();
}

function createExportRows() {
  const inputLines = inputEl.value.split("\n");
  const resultRows = lastEvaluation && Array.isArray(lastEvaluation.displayRows) ? lastEvaluation.displayRows : [];
  const rowCount = Math.max(inputLines.length, resultRows.length);
  const rows = [];

  for (let i = 0; i < rowCount; i += 1) {
    rows.push({
      input: inputLines[i] || "",
      result: resultRows[i] ? resultRows[i].display || "" : "",
    });
  }

  while (rows.length > 0) {
    const tail = rows[rows.length - 1];
    if (tail.input.trim() || tail.result.trim()) {
      break;
    }
    rows.pop();
  }

  return rows.length ? rows : [{ input: "", result: "" }];
}

function createExportFilename(extension, label = "export") {
  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
  return `zeilenrechner-${label}_${stamp}.${extension}`;
}

function downloadBlob(blob, filename) {
  if (typeof URL === "undefined" || typeof document === "undefined" || !document.body) {
    return;
  }
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeMarkdownCell(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>");
}

function exportMarkdownTable() {
  const rows = createExportRows();
  const inputHeader = currentLanguage === "de" ? "Eingabe" : "Input";
  const resultHeader = currentLanguage === "de" ? "Ergebnis" : "Result";
  const lines = [
    `| ${inputHeader} | ${resultHeader} |`,
    "| --- | --- |",
  ];

  for (const row of rows) {
    lines.push(`| ${escapeMarkdownCell(row.input)} | ${escapeMarkdownCell(row.result)} |`);
  }

  const content = `${lines.join("\n")}\n`;
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, createExportFilename("md", "markdown"));
}

function createExportObjects() {
  const rows = createExportRows();
  return rows.map((row, index) => ({
    line: index + 1,
    input: row.input || "",
    result: row.result || "",
  }));
}

function exportJson() {
  const payload = {
    exportedAt: new Date().toISOString(),
    language: currentLanguage,
    settings: {
      decimalPlaces: appSettings.decimalPlaces,
      fixedDecimals: appSettings.fixedDecimals,
      integerNoDecimals: appSettings.integerNoDecimals,
      preciseIntermediates: appSettings.preciseIntermediates,
      lineNumbers: appSettings.lineNumbers,
      autoWrap: appSettings.autoWrap,
      decimalSeparator: appSettings.decimalSeparator,
      thousandsSeparator: appSettings.thousandsSeparator,
      useMathJs: appSettings.useMathJs
    },
    rows: createExportObjects()
  };
  const content = `${JSON.stringify(payload, null, 2)}\n`;
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, createExportFilename("json", "json"));
}

function escapeYamlString(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, "\\\"")
    .replace(/\r?\n/g, "\\n");
}

function exportYaml() {
  const rows = createExportObjects();
  const lines = [
    `exportedAt: \"${new Date().toISOString()}\"`,
    `language: \"${currentLanguage}\"`,
    "settings:",
    `  decimalPlaces: ${appSettings.decimalPlaces}`,
    `  fixedDecimals: ${appSettings.fixedDecimals}`,
    `  integerNoDecimals: ${appSettings.integerNoDecimals}`,
    `  preciseIntermediates: ${appSettings.preciseIntermediates}`,
    `  lineNumbers: ${appSettings.lineNumbers}`,
    `  autoWrap: ${appSettings.autoWrap}`,
    `  decimalSeparator: \"${escapeYamlString(appSettings.decimalSeparator)}\"`,
    `  thousandsSeparator: \"${escapeYamlString(appSettings.thousandsSeparator)}\"`,
    `  useMathJs: ${appSettings.useMathJs}`,
    "rows:"
  ];

  for (const row of rows) {
    lines.push(`  - line: ${row.line}`);
    lines.push(`    input: \"${escapeYamlString(row.input)}\"`);
    lines.push(`    result: \"${escapeYamlString(row.result)}\"`);
  }

  const content = `${lines.join("\n")}\n`;
  const blob = new Blob([content], { type: "application/x-yaml;charset=utf-8" });
  downloadBlob(blob, createExportFilename("yaml", "yaml"));
}

function formatPdfNumber(value) {
  return Number(value.toFixed(3)).toString();
}

function wrapTextForPdf(text, maxChars) {
  const normalized = String(text || "").replace(/\t/g, "  ");
  if (!normalized) {
    return [""];
  }

  const chunks = normalized.split(/\r?\n/u);
  const lines = [];

  for (const chunk of chunks) {
    if (!chunk.trim()) {
      lines.push("");
      continue;
    }

    const words = chunk.split(/\s+/u).filter(Boolean);
    let current = "";

    for (const word of words) {
      if (word.length > maxChars) {
        if (current) {
          lines.push(current);
          current = "";
        }
        for (let start = 0; start < word.length; start += maxChars) {
          lines.push(word.slice(start, start + maxChars));
        }
        continue;
      }

      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= maxChars) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }

    if (current) {
      lines.push(current);
    }
  }

  return lines.length ? lines : [""];
}

function colorForHighlightKind(kind) {
  switch (kind) {
    case "comment":
      return [0.56, 0.6, 0.67];
    case "operator":
      return [0.14, 0.38, 0.73];
    case "number":
      return [0.11, 0.5, 0.3];
    case "boolean":
      return [0.48, 0.24, 0.69];
    case "ref":
      return [0.67, 0.36, 0.05];
    case "line-number":
      return [0.46, 0.53, 0.64];
    default:
      return null;
  }
}

function buildPdfInputSegments(line) {
  if (!appSettings.syntaxHighlighting) {
    return [{ text: line || "", kind: "plain" }];
  }
  return getLineHighlightSegments(line || "");
}

function buildPdfResultSegments(result, lineNumberPrefix) {
  const segments = [];
  if (lineNumberPrefix) {
    segments.push({ text: lineNumberPrefix, kind: "line-number" });
  }
  segments.push({ text: result || "", kind: "plain" });
  return segments;
}

function wrapSegmentsForPdf(segments, maxChars) {
  const lines = [];
  let currentLine = [];
  let currentLength = 0;

  function pushCurrentLine() {
    lines.push(currentLine.length ? currentLine : [{ text: "", kind: "plain" }]);
    currentLine = [];
    currentLength = 0;
  }

  for (const segment of segments) {
    let text = segment.text;
    if (!text.length) {
      continue;
    }

    while (text.length > 0) {
      const spaceLeft = maxChars - currentLength;
      if (spaceLeft <= 0) {
        pushCurrentLine();
        continue;
      }

      const slice = text.slice(0, spaceLeft);
      currentLine.push({ text: slice, kind: segment.kind });
      currentLength += slice.length;
      text = text.slice(slice.length);

      if (currentLength >= maxChars) {
        pushCurrentLine();
      }
    }
  }

  if (currentLine.length || !lines.length) {
    pushCurrentLine();
  }

  return lines;
}

function toPdfByteCode(char) {
  if (char === "€") {
    return 128;
  }
  const code = char.charCodeAt(0);
  if (code <= 255) {
    return code;
  }
  return 63;
}

function escapePdfText(text) {
  let escaped = "";

  for (const char of String(text || "")) {
    const code = toPdfByteCode(char);

    if (code === 92) {
      escaped += "\\\\";
      continue;
    }
    if (code === 40) {
      escaped += "\\(";
      continue;
    }
    if (code === 41) {
      escaped += "\\)";
      continue;
    }

    if (code < 32 || code > 126) {
      escaped += `\\${code.toString(8).padStart(3, "0")}`;
    } else {
      escaped += String.fromCharCode(code);
    }
  }

  return escaped;
}

function buildPdfPageStreams(rows, includeDivider) {
  const pageWidth = 595.28;
  const marginX = 34;
  const marginTop = 805;
  const marginBottom = 42;
  const lineHeight = 12.5;
  const dividerX = pageWidth / 2;
  const leftX = marginX;
  const rightX = dividerX + 8;
  const leftWidth = dividerX - marginX - 10;
  const rightWidth = pageWidth - marginX - dividerX - 10;
  const leftChars = Math.max(12, Math.floor(leftWidth / 5.05));
  const rightChars = Math.max(8, Math.floor(rightWidth / 5.05));
  const streams = [];

  function textCmd(x, y, text, size = 9, color = null) {
    const resolvedColor = color || [0, 0, 0];
    const colorPrefix = `${formatPdfNumber(resolvedColor[0])} ${formatPdfNumber(resolvedColor[1])} ${formatPdfNumber(resolvedColor[2])} rg `;
    return `BT ${colorPrefix}/F1 ${formatPdfNumber(size)} Tf 1 0 0 1 ${formatPdfNumber(x)} ${formatPdfNumber(y)} Tm (${escapePdfText(text)}) Tj ET`;
  }

  function lineCmd(x1, y1, x2, y2, gray = 0.76, width = 0.6) {
    return `${formatPdfNumber(gray)} G ${formatPdfNumber(width)} w ${formatPdfNumber(x1)} ${formatPdfNumber(y1)} m ${formatPdfNumber(x2)} ${formatPdfNumber(y2)} l S`;
  }

  function startPage(commands) {
    commands.push(textCmd(leftX, marginTop, currentLanguage === "de" ? "Eingabe" : "Input", 9.2));
    commands.push(textCmd(rightX, marginTop, currentLanguage === "de" ? "Ergebnis" : "Result", 9.2));
    commands.push(lineCmd(marginX, marginTop - 4, pageWidth - marginX, marginTop - 4, 0.72, 0.7));
    if (includeDivider) {
      commands.push(lineCmd(dividerX, marginBottom, dividerX, marginTop + 8, 0.82, 0.7));
    }
  }

  let commands = [];
  let y = marginTop - 20;
  startPage(commands);

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const lineNumberPrefix = appSettings.lineNumbers ? `${rowIndex + 1}  ` : "";
    const leftSegments = buildPdfInputSegments(row.input);
    if (lineNumberPrefix) {
      leftSegments.unshift({ text: lineNumberPrefix, kind: "line-number" });
    }
    const rightSegments = buildPdfResultSegments(row.result, lineNumberPrefix);
    const leftLines = wrapSegmentsForPdf(leftSegments, leftChars);
    const rightLines = wrapSegmentsForPdf(rightSegments, rightChars);
    const logicalHeight = Math.max(leftLines.length, rightLines.length);

    if (y - logicalHeight * lineHeight < marginBottom) {
      streams.push(commands.join("\n"));
      commands = [];
      y = marginTop - 20;
      startPage(commands);
    }

    for (let lineIndex = 0; lineIndex < logicalHeight; lineIndex += 1) {
      const leftLineSegments = leftLines[lineIndex] || [{ text: "", kind: "plain" }];
      const rightLineSegments = rightLines[lineIndex] || [{ text: "", kind: "plain" }];

      let leftCursorX = leftX;
      for (const segment of leftLineSegments) {
        if (!segment.text) {
          continue;
        }
        commands.push(textCmd(leftCursorX, y, segment.text, 9, colorForHighlightKind(segment.kind)));
        leftCursorX += segment.text.length * 5.05;
      }

      let rightCursorX = rightX;
      for (const segment of rightLineSegments) {
        if (!segment.text) {
          continue;
        }
        commands.push(textCmd(rightCursorX, y, segment.text, 9, colorForHighlightKind(segment.kind)));
        rightCursorX += segment.text.length * 5.05;
      }
      y -= lineHeight;
    }

    y -= 1.8;
  }

  streams.push(commands.join("\n"));
  return streams;
}

function buildPdfDocument(pageStreams) {
  const objects = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";

  const kids = [];
  for (let index = 0; index < pageStreams.length; index += 1) {
    kids.push(`${4 + index * 2} 0 R`);
  }
  objects[2] = `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pageStreams.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";

  for (let index = 0; index < pageStreams.length; index += 1) {
    const pageObject = 4 + index * 2;
    const contentObject = pageObject + 1;
    const stream = pageStreams[index];

    objects[pageObject] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R >> >> /Contents " + contentObject + " 0 R >>";
    objects[contentObject] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = pdf.length;
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index < objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function exportPdf(includeDivider) {
  const rows = createExportRows();
  const streams = buildPdfPageStreams(rows, includeDivider);
  const pdfContent = buildPdfDocument(streams);
  const blob = new Blob([pdfContent], { type: "application/pdf" });
  const suffix = includeDivider ? "mit-trennstrich" : "ohne-trennstrich";
  downloadBlob(blob, createExportFilename("pdf", suffix));
}

function persistViewMode(mode) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  } catch (_error) {
    // Storage ist optional; Fehler sollen die App nicht blockieren.
  }
}

function loadPersistedViewMode() {
  if (typeof window === "undefined" || !window.localStorage) {
    return VIEW_MODE_STANDARD;
  }
  try {
    const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return stored === VIEW_MODE_FULL ? VIEW_MODE_FULL : VIEW_MODE_STANDARD;
  } catch (_error) {
    return VIEW_MODE_STANDARD;
  }
}

function applyViewMode(mode, shouldPersist = true) {
  const resolvedMode = mode === VIEW_MODE_FULL ? VIEW_MODE_FULL : VIEW_MODE_STANDARD;
  const isFull = resolvedMode === VIEW_MODE_FULL;

  if (appEl && appEl.classList) {
    appEl.classList.toggle("fullsize", isFull);
  }

  if (resizeFloatEl) {
    resizeFloatEl.hidden = !isFull;
  }

  if (resizeChipEl) {
    resizeChipEl.setAttribute("aria-label", isFull ? t("resizeToStandard") : t("resizeToFull"));
    resizeChipEl.title = isFull ? t("resizeToStandard") : t("resizeToFull");
  }

  if (resizeFloatEl) {
    const resizeFloatLabel = isFull ? t("resizeFloatTitleStandard") : t("resizeFloatTitleFull");
    resizeFloatEl.title = resizeFloatLabel;
    resizeFloatEl.setAttribute("aria-label", resizeFloatLabel);
  }

  if (isFull) {
    toggleHelpPopover(false);
    toggleDownloadPopover(false);
    toggleSettingsPopover(false);
  }

  if (shouldPersist) {
    persistViewMode(resolvedMode);
  }
}

function toggleViewMode() {
  const isCurrentlyFull = Boolean(appEl && appEl.classList && appEl.classList.contains("fullsize"));
  applyViewMode(isCurrentlyFull ? VIEW_MODE_STANDARD : VIEW_MODE_FULL);
}

function toggleDownloadPopover(forceOpen) {
  if (!downloadPopoverEl || !downloadChipEl) {
    return;
  }
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : Boolean(downloadPopoverEl.hidden);
  downloadPopoverEl.hidden = !shouldOpen;
  downloadChipEl.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

function toggleSettingsPopover(forceOpen) {
  if (!settingsPopoverEl || !settingsChipEl) {
    return;
  }
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : Boolean(settingsPopoverEl.hidden);
  settingsPopoverEl.hidden = !shouldOpen;
  settingsChipEl.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

function toggleHelpPopover(forceOpen) {
  if (!helpPopoverEl || !helpChipEl) {
    return;
  }
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : Boolean(helpPopoverEl.hidden);
  helpPopoverEl.hidden = !shouldOpen;
  helpChipEl.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

function syncScrollFromInput() {
  const targetTop = inputEl.scrollTop;
  resultsEl.scrollTop = targetTop;

  if (inputLineNumbersEl) {
    inputLineNumbersEl.scrollTop = targetTop;
  }
  if (resultLineNumbersEl) {
    resultLineNumbersEl.scrollTop = targetTop;
  }
  if (highlightEl) {
    highlightEl.scrollTop = targetTop;
    highlightEl.scrollLeft = inputEl.scrollLeft;
  }
}

inputEl.addEventListener("input", () => {
  persistInput(inputEl.value);
  recalculate();
});

inputEl.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") {
    return;
  }
  event.preventDefault();

  const start = inputEl.selectionStart;
  const end = inputEl.selectionEnd;
  const value = inputEl.value;
  const indent = "    ";
  inputEl.value = `${value.slice(0, start)}${indent}${value.slice(end)}`;
  inputEl.selectionStart = start + indent.length;
  inputEl.selectionEnd = start + indent.length;
  persistInput(inputEl.value);
  recalculate();
});

inputEl.addEventListener("scroll", syncScrollFromInput);

if (helpChipEl && helpPopoverEl && typeof helpChipEl.addEventListener === "function") {
  helpChipEl.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDownloadPopover(false);
    toggleSettingsPopover(false);
    toggleHelpPopover();
  });
}

if (downloadChipEl && downloadPopoverEl && typeof downloadChipEl.addEventListener === "function") {
  downloadChipEl.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleHelpPopover(false);
    toggleSettingsPopover(false);
    toggleDownloadPopover();
  });
}

if (settingsChipEl && settingsPopoverEl && typeof settingsChipEl.addEventListener === "function") {
  settingsChipEl.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleHelpPopover(false);
    toggleDownloadPopover(false);
    toggleSettingsPopover();
  });
}

if (loadDemoBtnEl && typeof loadDemoBtnEl.addEventListener === "function") {
  loadDemoBtnEl.addEventListener("click", () => {
    setInputAndRecalculate(INITIAL_TEXT);
    toggleHelpPopover(false);
    toggleDownloadPopover(false);
    toggleSettingsPopover(false);
  });
}

if (exportPdfDividerBtnEl && typeof exportPdfDividerBtnEl.addEventListener === "function") {
  exportPdfDividerBtnEl.addEventListener("click", () => {
    exportPdf(true);
    toggleDownloadPopover(false);
    toggleSettingsPopover(false);
  });
}

if (exportPdfPlainBtnEl && typeof exportPdfPlainBtnEl.addEventListener === "function") {
  exportPdfPlainBtnEl.addEventListener("click", () => {
    exportPdf(false);
    toggleDownloadPopover(false);
    toggleSettingsPopover(false);
  });
}

if (exportMdBtnEl && typeof exportMdBtnEl.addEventListener === "function") {
  exportMdBtnEl.addEventListener("click", () => {
    exportMarkdownTable();
    toggleDownloadPopover(false);
    toggleSettingsPopover(false);
  });
}

if (exportJsonBtnEl && typeof exportJsonBtnEl.addEventListener === "function") {
  exportJsonBtnEl.addEventListener("click", () => {
    exportJson();
    toggleDownloadPopover(false);
    toggleSettingsPopover(false);
  });
}

if (exportYamlBtnEl && typeof exportYamlBtnEl.addEventListener === "function") {
  exportYamlBtnEl.addEventListener("click", () => {
    exportYaml();
    toggleDownloadPopover(false);
    toggleSettingsPopover(false);
  });
}

if (settingUseMathJsEl && typeof settingUseMathJsEl.addEventListener === "function") {
  settingUseMathJsEl.addEventListener("change", () => {
    patchSettings({ useMathJs: settingUseMathJsEl.checked });
    if (appSettings.useMathJs) {
      ensureMathJsLoaded();
    }
  });
}

if (settingDecimalsEl && typeof settingDecimalsEl.addEventListener === "function") {
  settingDecimalsEl.addEventListener("change", () => {
    patchSettings({ decimalPlaces: clampDecimalPlaces(settingDecimalsEl.value) });
  });
}

if (settingFixedDecimalsEl && typeof settingFixedDecimalsEl.addEventListener === "function") {
  settingFixedDecimalsEl.addEventListener("change", () => {
    patchSettings({ fixedDecimals: settingFixedDecimalsEl.checked });
  });
}

if (settingIntegerNoDecimalsEl && typeof settingIntegerNoDecimalsEl.addEventListener === "function") {
  settingIntegerNoDecimalsEl.addEventListener("change", () => {
    patchSettings({ integerNoDecimals: settingIntegerNoDecimalsEl.checked });
  });
}

if (settingPreciseIntermediateEl && typeof settingPreciseIntermediateEl.addEventListener === "function") {
  settingPreciseIntermediateEl.addEventListener("change", () => {
    patchSettings({ preciseIntermediates: settingPreciseIntermediateEl.checked });
  });
}

if (settingSyntaxHighlightEl && typeof settingSyntaxHighlightEl.addEventListener === "function") {
  settingSyntaxHighlightEl.addEventListener("change", () => {
    patchSettings({ syntaxHighlighting: settingSyntaxHighlightEl.checked });
  });
}

if (settingLineNumbersEl && typeof settingLineNumbersEl.addEventListener === "function") {
  settingLineNumbersEl.addEventListener("change", () => {
    patchSettings({ lineNumbers: settingLineNumbersEl.checked });
  });
}

if (settingAutoWrapEl && typeof settingAutoWrapEl.addEventListener === "function") {
  settingAutoWrapEl.addEventListener("change", () => {
    patchSettings({ autoWrap: settingAutoWrapEl.checked });
  });
}

if (settingLanguageEl && typeof settingLanguageEl.addEventListener === "function") {
  settingLanguageEl.addEventListener("change", () => {
    patchSettings({ language: sanitizeLanguage(settingLanguageEl.value) });
  });
}

function applySeparatorSettingsFromUi() {
  if (!settingDecimalSeparatorEl || !settingThousandsSeparatorEl) {
    return;
  }
  const decimalSeparator = settingDecimalSeparatorEl.value;
  const thousandsSeparator = settingThousandsSeparatorEl.value;
  const normalized = ensureValidSeparators(decimalSeparator, thousandsSeparator);

  if (!normalized.isValid) {
    if (separatorStatusEl) {
      separatorStatusEl.textContent = t("separatorInvalid");
      separatorStatusEl.style.color = "#b3272d";
    }
    return;
  }

  patchSettings({
    decimalSeparator: normalized.decimalSeparator,
    thousandsSeparator: normalized.thousandsSeparator
  });
}

if (settingDecimalSeparatorEl && typeof settingDecimalSeparatorEl.addEventListener === "function") {
  settingDecimalSeparatorEl.addEventListener("change", () => {
    applySeparatorSettingsFromUi();
  });
}

if (settingThousandsSeparatorEl && typeof settingThousandsSeparatorEl.addEventListener === "function") {
  settingThousandsSeparatorEl.addEventListener("change", () => {
    applySeparatorSettingsFromUi();
  });
}

if (resizeChipEl && typeof resizeChipEl.addEventListener === "function") {
  resizeChipEl.addEventListener("click", () => {
    toggleViewMode();
  });
}

if (resizeFloatEl && typeof resizeFloatEl.addEventListener === "function") {
  resizeFloatEl.addEventListener("click", () => {
    toggleViewMode();
  });
}

if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
  document.addEventListener("click", (event) => {
    const helpOpen = Boolean(helpPopoverEl && !helpPopoverEl.hidden);
    const downloadOpen = Boolean(downloadPopoverEl && !downloadPopoverEl.hidden);
    const settingsOpen = Boolean(settingsPopoverEl && !settingsPopoverEl.hidden);
    if (!helpOpen && !downloadOpen && !settingsOpen) {
      return;
    }
    const target = event.target;
    if (typeof Element !== "undefined" && target instanceof Element && target.closest(".help-wrap")) {
      return;
    }
    toggleHelpPopover(false);
    toggleDownloadPopover(false);
    toggleSettingsPopover(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toggleHelpPopover(false);
      toggleDownloadPopover(false);
      toggleSettingsPopover(false);
    }
  });
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("resize", () => {
    renderLineNumbers(lastEvaluation);
  });
}

inputEl.value = loadPersistedInput();
applySettingsToUi();
if (appSettings.useMathJs) {
  ensureMathJsLoaded();
}
applyViewMode(loadPersistedViewMode(), false);
recalculate();

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // PWA-Support ist optional und darf die App-Nutzung nicht blockieren.
    });
  });
}

if (typeof window !== "undefined") {
  window.Zeilenrechner = { evaluateSheet };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { evaluateSheet };
}
