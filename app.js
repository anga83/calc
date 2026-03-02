"use strict";

const inputEl = document.getElementById("sheet-input");
const resultsEl = document.getElementById("sheet-results");
const appEl = document.getElementById("app-root");
const helpChipEl = document.getElementById("help-chip");
const helpPopoverEl = document.getElementById("help-popover");
const downloadChipEl = document.getElementById("download-chip");
const downloadPopoverEl = document.getElementById("download-popover");
const loadDemoBtnEl = document.getElementById("load-demo-btn");
const exportPdfDividerBtnEl = document.getElementById("export-pdf-divider-btn");
const exportPdfPlainBtnEl = document.getElementById("export-pdf-plain-btn");
const exportMdBtnEl = document.getElementById("export-md-btn");
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
const VIEW_MODE_STANDARD = "standard";
const VIEW_MODE_FULL = "full";

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
  in: 1,
  to: 1,
  as: 1,
  on: 2,
  off: 2,
  "+": 2,
  "-": 2,
  "*": 3,
  "/": 3,
  of: 3,
  implicit: 3,
  "^": 4,
};

const constants = {
  pi: { value: Math.PI },
  "π": { value: Math.PI },
  e: { value: Math.E },
};

let lastEvaluation = { lineValues: [] };

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

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripInlineComment(line) {
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < line.length - 1; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (char === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }

    if (!inSingle && !inDouble && char === "/" && next === "/") {
      return line.slice(0, i);
    }
  }

  return line;
}

function stripTrailingEquals(line) {
  return line.replace(/\s*(?:=\s*)+$/u, "");
}

function parseLocaleNumber(raw) {
  const normalized = raw.replace(/\./g, "").replace(",", ".");
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

    if (/\s/u.test(char)) {
      i += 1;
      continue;
    }

    if (char === "(" || char === ")" || char === "+" || char === "-" || char === "*" || char === "/" || char === "^") {
      tokens.push({ type: char === "(" ? "lparen" : char === ")" ? "rparen" : "op", value: char });
      i += 1;
      continue;
    }

    if (char === "," || /\d/.test(char)) {
      const start = i;
      let hasComma = false;
      if (char === ",") {
        hasComma = true;
        i += 1;
      }

      while (i < expression.length) {
        const c = expression[i];
        if (/\d/.test(c) || c === ".") {
          i += 1;
          continue;
        }
        if (c === "," && !hasComma) {
          hasComma = true;
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

      if (["in", "to", "as", "of", "on", "off"].includes(lower)) {
        tokens.push({ type: "op", value: lower });
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

    if (currentEndsPrimary && nextStartsPrimary) {
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
  };
}

function cloneQuantity(quantity) {
  return {
    value: quantity.value,
    unit: quantity.unit,
    dimension: quantity.dimension,
    isPercent: quantity.isPercent,
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

function ensureCompatibleForSum(left, right) {
  if (left.unit && right.unit) {
    if (left.dimension !== right.dimension) {
      throw new Error("Einheiten mit unterschiedlicher Dimension können nicht addiert werden");
    }
    return { left, right: convertToUnit(right, left.unit), unit: left.unit, dimension: left.dimension };
  }

  if (left.unit && !right.unit) {
    return { left, right: makeQuantity(right.value, { unit: left.unit, dimension: left.dimension }), unit: left.unit, dimension: left.dimension };
  }

  if (!left.unit && right.unit) {
    return { left: makeQuantity(left.value, { unit: right.unit, dimension: right.dimension }), right, unit: right.unit, dimension: right.dimension };
  }

  return { left, right, unit: null, dimension: null };
}

function applyPlus(left, right) {
  if (!left.isPercent && right.isPercent) {
    return makeQuantity(left.value * (1 + right.value), {
      unit: left.unit,
      dimension: left.dimension,
      isPercent: false,
    });
  }

  const aligned = ensureCompatibleForSum(left, right);
  const sum = aligned.left.value + aligned.right.value;
  return makeQuantity(sum, { unit: aligned.unit, dimension: aligned.dimension, isPercent: left.isPercent && right.isPercent });
}

function applyMinus(left, right) {
  if (!left.isPercent && right.isPercent) {
    return makeQuantity(left.value * (1 - right.value), {
      unit: left.unit,
      dimension: left.dimension,
      isPercent: false,
    });
  }

  const aligned = ensureCompatibleForSum(left, right);
  const diff = aligned.left.value - aligned.right.value;
  return makeQuantity(diff, { unit: aligned.unit, dimension: aligned.dimension, isPercent: left.isPercent && right.isPercent });
}

function applyMultiply(left, right) {
  if (left.unit && right.unit) {
    throw new Error("Multiplikation zweier Einheiten ist hier nicht unterstützt");
  }

  if (left.unit) {
    return makeQuantity(left.value * right.value, { unit: left.unit, dimension: left.dimension });
  }

  if (right.unit) {
    return makeQuantity(left.value * right.value, { unit: right.unit, dimension: right.dimension });
  }

  return makeQuantity(left.value * right.value);
}

function applyDivision(left, right) {
  if (right.value === 0) {
    throw new Error("Division durch 0");
  }

  if (left.unit && right.unit) {
    if (left.dimension !== right.dimension) {
      throw new Error("Division mit unterschiedlichen Einheiten ist nicht unterstützt");
    }
    const convertedRight = convertToUnit(right, left.unit);
    return makeQuantity(left.value / convertedRight.value);
  }

  if (!left.unit && right.unit) {
    throw new Error("Division durch einen Einheitenwert ist nicht unterstützt");
  }

  if (left.unit && !right.unit) {
    return makeQuantity(left.value / right.value, { unit: left.unit, dimension: left.dimension });
  }

  return makeQuantity(left.value / right.value);
}

function applyPower(left, right) {
  if (left.unit || right.unit) {
    throw new Error("Potenzen mit Einheiten sind nicht unterstützt");
  }
  return makeQuantity(left.value ** right.value);
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

function evaluateAst(node, context) {
  if (node.type === "number") {
    return makeQuantity(node.value, { isPercent: node.isPercent });
  }

  if (node.type === "identifier") {
    return resolveIdentifier(node.name, context);
  }

  if (node.type === "unary") {
    const arg = evaluateAst(node.argument, context);
    if (node.op === "+") {
      return arg;
    }
    return makeQuantity(-arg.value, {
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
    .replace(/\bprozent\b/giu, "%");

  // Schreibweisen wie "5 h 30 min" werden in "5 h + 30 min" überführt.
  const compoundPattern = /(\d[\d.,]*\s*°?[\p{L}²/]+)\s+(?=\d[\d.,]*\s*°?[\p{L}²/]+)/gu;
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

  value = value.replace(/@(\d+)/g, (match, lineNoRaw) => {
    const lineNo = Number(lineNoRaw);
    if (!Number.isInteger(lineNo) || lineNo < 1 || lineNo > lineValues.length) {
      return match;
    }
    const lineValue = lineValues[lineNo - 1];
    if (!lineValue) {
      return match;
    }
    const placeholder = `__line_${placeholderIndex}`;
    placeholderIndex += 1;
    placeholders.set(placeholder, lineValue);
    return placeholder;
  });

  return { expression: value, placeholders };
}

function parseAssignment(line) {
  const match = line.match(/^(.+?)\s*(\+=|-=|=)\s*(.+)$/u);
  if (!match) {
    return null;
  }

  const lhs = match[1].trim();
  const op = match[2];
  const rhs = match[3].trim();

  if (!lhs || !rhs) {
    return null;
  }

  if (/[()*/^]/u.test(lhs)) {
    return null;
  }

  return { lhs, op, rhs };
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

function formatNumber(value, maximumFractionDigits = 10) {
  const rounded = Object.is(value, -0) ? 0 : value;
  return rounded.toLocaleString("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
    useGrouping: true,
  });
}

function formatQuantity(quantity) {
  if (!Number.isFinite(quantity.value)) {
    return "Ungültiges Ergebnis";
  }

  if (quantity.isPercent && !quantity.unit) {
    return `${formatNumber(quantity.value * 100, 6)} %`;
  }

  const number = formatNumber(quantity.value, 10);
  if (!quantity.unit) {
    return number;
  }
  return `${number} ${unitDefs[quantity.unit].symbol}`;
}

function evaluateExpression(expression, context) {
  const preprocessed = preprocessExpression(expression, context.variables, context.lineValues);
  const tokens = tokenize(preprocessed.expression);
  const ast = parse(tokens);
  return evaluateAst(ast, {
    variables: context.variables,
    placeholders: preprocessed.placeholders,
    lastValue: context.lastValue,
  });
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

  const assignment = parseAssignment(sanitizedLine);
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

    context.variables.set(normalizedKey, { name: assignment.lhs.trim(), quantity: cloneQuantity(assignedValue) });
    context.lastValue = cloneQuantity(assignedValue);
    return {
      type: "result",
      display: formatQuantity(assignedValue),
      value: cloneQuantity(assignedValue),
    };
  }

  const expression = expandUnitShorthand(maybeStripLabel(sanitizedLine));
  const result = evaluateExpression(expression, context);
  context.lastValue = cloneQuantity(result);
  return { type: "result", display: formatQuantity(result), value: cloneQuantity(result) };
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
        display: `Fehler: ${error.message}`,
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

function recalculate() {
  const evaluation = evaluateSheet(inputEl.value);
  lastEvaluation = evaluation;
  renderResults(evaluation);
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
  const lines = [
    "| Eingabe | Ergebnis |",
    "| --- | --- |",
  ];

  for (const row of rows) {
    lines.push(`| ${escapeMarkdownCell(row.input)} | ${escapeMarkdownCell(row.result)} |`);
  }

  const content = `${lines.join("\n")}\n`;
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, createExportFilename("md", "markdown"));
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

  function textCmd(x, y, text, size = 9) {
    return `BT /F1 ${formatPdfNumber(size)} Tf 1 0 0 1 ${formatPdfNumber(x)} ${formatPdfNumber(y)} Tm (${escapePdfText(text)}) Tj ET`;
  }

  function lineCmd(x1, y1, x2, y2, gray = 0.76, width = 0.6) {
    return `${formatPdfNumber(gray)} G ${formatPdfNumber(width)} w ${formatPdfNumber(x1)} ${formatPdfNumber(y1)} m ${formatPdfNumber(x2)} ${formatPdfNumber(y2)} l S`;
  }

  function startPage(commands) {
    commands.push(textCmd(leftX, marginTop, "Eingabe", 9.2));
    commands.push(textCmd(rightX, marginTop, "Ergebnis", 9.2));
    commands.push(lineCmd(marginX, marginTop - 4, pageWidth - marginX, marginTop - 4, 0.72, 0.7));
    if (includeDivider) {
      commands.push(lineCmd(dividerX, marginBottom, dividerX, marginTop + 8, 0.82, 0.7));
    }
  }

  let commands = [];
  let y = marginTop - 20;
  startPage(commands);

  for (const row of rows) {
    const leftLines = wrapTextForPdf(row.input, leftChars);
    const rightLines = wrapTextForPdf(row.result, rightChars);
    const logicalHeight = Math.max(leftLines.length, rightLines.length);

    if (y - logicalHeight * lineHeight < marginBottom) {
      streams.push(commands.join("\n"));
      commands = [];
      y = marginTop - 20;
      startPage(commands);
    }

    for (let lineIndex = 0; lineIndex < logicalHeight; lineIndex += 1) {
      const leftText = leftLines[lineIndex] || "";
      const rightText = rightLines[lineIndex] || "";
      if (leftText) {
        commands.push(textCmd(leftX, y, leftText));
      }
      if (rightText) {
        commands.push(textCmd(rightX, y, rightText));
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
    resizeChipEl.setAttribute("aria-label", isFull ? "Standardansicht umschalten" : "Vollansicht umschalten");
    resizeChipEl.title = isFull ? "Standardansicht umschalten" : "Vollansicht umschalten";
  }

  if (resizeFloatEl) {
    resizeFloatEl.title = isFull ? "Standardansicht" : "Vollansicht";
  }

  if (isFull) {
    toggleHelpPopover(false);
    toggleDownloadPopover(false);
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

function toggleHelpPopover(forceOpen) {
  if (!helpPopoverEl || !helpChipEl) {
    return;
  }
  const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : Boolean(helpPopoverEl.hidden);
  helpPopoverEl.hidden = !shouldOpen;
  helpChipEl.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

function syncScrollFromInput() {
  resultsEl.scrollTop = inputEl.scrollTop;
}

inputEl.addEventListener("input", () => {
  persistInput(inputEl.value);
  recalculate();
});
inputEl.addEventListener("scroll", syncScrollFromInput);

if (helpChipEl && helpPopoverEl && typeof helpChipEl.addEventListener === "function") {
  helpChipEl.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDownloadPopover(false);
    toggleHelpPopover();
  });
}

if (downloadChipEl && downloadPopoverEl && typeof downloadChipEl.addEventListener === "function") {
  downloadChipEl.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleHelpPopover(false);
    toggleDownloadPopover();
  });
}

if (loadDemoBtnEl && typeof loadDemoBtnEl.addEventListener === "function") {
  loadDemoBtnEl.addEventListener("click", () => {
    setInputAndRecalculate(INITIAL_TEXT);
    toggleHelpPopover(false);
    toggleDownloadPopover(false);
  });
}

if (exportPdfDividerBtnEl && typeof exportPdfDividerBtnEl.addEventListener === "function") {
  exportPdfDividerBtnEl.addEventListener("click", () => {
    exportPdf(true);
    toggleDownloadPopover(false);
  });
}

if (exportPdfPlainBtnEl && typeof exportPdfPlainBtnEl.addEventListener === "function") {
  exportPdfPlainBtnEl.addEventListener("click", () => {
    exportPdf(false);
    toggleDownloadPopover(false);
  });
}

if (exportMdBtnEl && typeof exportMdBtnEl.addEventListener === "function") {
  exportMdBtnEl.addEventListener("click", () => {
    exportMarkdownTable();
    toggleDownloadPopover(false);
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
    if (!helpOpen && !downloadOpen) {
      return;
    }
    const target = event.target;
    if (typeof Element !== "undefined" && target instanceof Element && target.closest(".help-wrap")) {
      return;
    }
    toggleHelpPopover(false);
    toggleDownloadPopover(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toggleHelpPopover(false);
      toggleDownloadPopover(false);
    }
  });
}

inputEl.value = loadPersistedInput();
applyViewMode(loadPersistedViewMode(), false);
recalculate();

if (typeof window !== "undefined") {
  window.Zeilenrechner = { evaluateSheet };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { evaluateSheet };
}
