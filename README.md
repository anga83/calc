# Zeilenrechner (Soulver-ähnliche Webapp)

## 1. Beschreibung der Anwendung
Diese Anwendung ist ein zeilenbasierter Rechner im Stil von Soulver: links stehen Eingaben, rechts erscheinen die Ergebnisse pro Zeile in Echtzeit. Sie unterstützt Kommentare, Variablen, Referenzen, Prozentrechnung, Vergleichsoperatoren, Einheitenumrechnung, Datums-/Zeitrechnung und Excel-ähnliche Funktionen.

Der Rechner ist auf produktives Arbeiten mit Zwischenschritten ausgelegt: Eingaben bleiben editierbar, Ergebnisse sind direkt wiederverwendbar, Einstellungen werden gespeichert und Exporte stehen in mehreren Formaten zur Verfügung.

## 2. Features
### Haupt-Features
- Zeilenweises Rechnen mit Live-Auswertung.
- Zweispalten-Layout (ca. 70 % Eingabe / 30 % Ergebnis), responsiv für Desktop und Mobile.
- Kommentare über `#` und `//` (inkl. Inline-`//`).
- `##`-Kommentarzeilen werden in der Eingabe zusätzlich fett dargestellt (bei Syntax-Highlighting).
- Variablen mit Zuweisung und Update:
  - `name = ...`
  - `name += ...`
  - `name -= ...`
- Variablennamen dürfen Leerzeichen und Umlaute enthalten; Variablen sind case-insensitive.
- Referenzen:
  - `@n` für Zeile `n`
  - `ans` / `last` für das letzte Ergebnis
- Fehlertext bei leerer `@`-Referenz: `Fehler: Zeile x leer`.
- Vergleichsoperatoren:
  - `>`, `>=`, `<`, `<=`, `==`, `!=`
  - Ausgabe als `true` / `false`
- Prozentrechnung:
  - `3% von 100`, `3 % von 100`, `3 Prozent von 100`
- Einheitenumrechnung:
  - Operatoren: `in`, `to`, `zu`, `as`, `als`
  - Kurzform: `km m`
  - Unterstützte Dimensionen: Länge, Masse, Zeit, Volumen, Fläche, Geschwindigkeit, Temperatur, Währung
  - Währungen:
    - Feste Default-Kurse (offline verfügbar)
    - Optional Live-Kurse via Frankfurter-API (`base=EUR`)
    - Bei aktivierten Live-Kursen werden alle von der API gelieferten Währungen unterstützt
- Trailing `=` wird ignoriert (`1 + 2 =` ist gültig).
- `Tab` im Eingabefeld fügt 4 Leerzeichen ein.
- Datums-/Zeitrechnung:
  - Schlüsselwörter: `heute`/`today`, `jetzt`/`now`, `morgen`/`tomorrow`, `gestern`/`yesterday`
  - Datumsarithmetik: `heute + 14 tage`, `today + 2 wk`
  - Datumsdifferenz: `2026-03-15 - 2026-03-01`
  - Datumsformate: `YYYY-MM-DD`, `DD.MM.YYYY`, `DD. MMMM YYYY` (z. B. `1. März 2026`)

### Funktionen (inkl. Excel-ähnlich)
- `min(...)`, `max(...)`
- `SUMME(...)` / `SUM(...)`
- `DURCHSCHNITT(...)` / `MITTELWERT(...)` / `AVG(...)` / `AVERAGE(...)`
- `ANZAHL(...)` / `COUNT(...)`
- `TAGE BIS(...)` / `DAYS UNTIL(...)`
- `TAGE ZWISCHEN(...; ...)` / `DAYS BETWEEN(..., ...)`
- Bereiche über Zeilenreferenzen:
  - `SUMME(@1:@4)` summiert Zeilen 1–4
  - Leere Zeilen und Kommentarzeilen werden dabei übersprungen
- Funktionsnamen sind case-insensitive und mit/ohne führendes `=` nutzbar.

### Zahlenformat und Parsing
- Standard ist deutsch:
  - Dezimalzeichen `,`
  - Tausendertrennzeichen `.`
- Punkte in der Eingabe werden kontextsensitiv behandelt:
  - Tausenderpunkte werden entfernt (`3.000.000` -> `3000000`)
  - Nicht-tausenderkonforme Punkte werden als Dezimalpunkt interpretiert (`1.1` -> `1,1`)
- Zahlensystem ist konfigurierbar (Dezimal-/Tausendertrennzeichen in den Einstellungen).
- Widersprüche (gleiches Zeichen für Dezimal und Tausender) werden direkt validiert.

### Einstellungen (persistiert via Local Storage)
- `math.js verwenden` (ohne Reload umschaltbar)
- `Live-Wechselkurse` (Fixwerte vs. API-Livewerte)
- `Mit genauen Zwischenergebnissen rechnen`
- `Nachkommastellen` (0–10, Standard: 4)
- `Fixe Nachkommastellen` (Standard: aus)
- `Ganzzahlen ohne Nachkommastellen`
- `Syntax-Highlighting`
  - `##`-Kommentare als fette Kommentarzeilen
  - inkl. Hervorhebung für Zeitoperatoren (`tage zwischen`, `days between`, `tage bis`, `days until`)
  - inkl. Hervorhebung für Datumsangaben (`2026-03-01`, `01.03.2026`, `1. März 2026`)
- `Farbmodus` (`Browser-Standard`, `Light`, `Dark`)
  - Browser-Standard kann manuell übersteuert werden
- `Zeilennummern` (Input/Ergebnisse + PDF, nicht Markdown)
- `Automatischer Zeilenumbruch`
- `Sprache` (`Browser-Standard`, `Deutsch`, `English`)
- `Dezimalzeichen` / `Tausendertrennzeichen`

### Hilfe, UI und Quality-of-Life
- Start mit leerem Eingabefeld.
- Hilfe-Chip `?` mit:
  - Syntaxübersicht
  - Funktionsübersicht
  - Umrechnungsübersicht
  - Link auf math.js-Syntax: <https://mathjs.org/docs/expressions/syntax.html>
  - `Demo`-Button für allgemeine Beispiele
  - `Zeit-Demo`/`Time Demo` für Zeit- und Datumsbeispiele (sprachabhängig)
- Download-Chip mit Export-Popover.
- Settings-Chip mit gruppierten Einstellungsblöcken.
  - Info-Popover bei `math.js verwenden` (Kurzbeschreibung zusätzlicher Funktionen)
  - Info-Popover bei `Live-Wechselkurse` (aktuell verwendete Kurse + Quelle bei Live-Daten)
- Fullsize-Ansicht:
  - blendet Topbar und Footer aus
  - halbtransparenter Floating-Button bleibt sichtbar
  - Zustand wird gespeichert
- Scroll-Synchronisierung zwischen Eingabe, Highlight-Overlay, Ergebnis und Zeilennummern.
- Statuszeile für math.js zeigt nur im Fehlerfall eine Meldung (z. B. CDN nicht erreichbar).

### Exporte
- PDF:
  - mit oder ohne vertikalen Trennstrich
  - optional mit Syntax-Highlighting
  - optional mit Zeilennummern
- Markdown (Tabelle)
- JSON
- YAML

### Persistenz
- Letzter Eingabeinhalt
- Letzter View-Mode (Standard/Fullsize)
- Alle Einstellungen

### PWA
- `manifest.webmanifest` vorhanden
- Service Worker (`sw.js`) registriert
- Offline-Caching/Fallback
- App-Icons inkl. maskable Variante

## 3. Technischer Aufbau
### Technologien
- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Optional `math.js` (dynamisch per CDN geladen)

### Struktur
- `index.html`
  - Grundlayout, Toolbar-Chips, Popover (Hilfe/Export/Settings), Eingabe-/Ergebnisbereiche
- `styles.css`
  - Layout, responsives Verhalten, Light/Dark-Theme, Zeilennummern-/Wrap-/Fullscreen-Styling
- `app.js`
  - Parser, Evaluator, Variablen-/Referenzlogik, Funktionen, Umrechnungen, Datums-/Zeitlogik, Live-FX-Handling, i18n, Einstellungen, Persistenz, Exporte
- `manifest.webmanifest`, `sw.js`, `icons/*`
  - PWA-Metadaten, Caching, App-Icons

### Parser-/Evaluator-Konzept
- Eigener Tokenizer + Parser mit Operator-Prioritäten.
- Verarbeitet natürliche Operatorwörter (z. B. `von`, `zu`, `als`) zusätzlich zu Symboloperatoren.
- Führt Variablenauflösung, Zeilenreferenzen, Prozentlogik, Einheitenlogik und Datums-/Zeitlogik in einer Pipeline zusammen.
- Optionaler math.js-Pfad für komplexere Ausdrücke, mit Fallback auf den internen Evaluator.

### Export-Implementierung
- Markdown/JSON/YAML über direkte Datenserialisierung der Zeilen.
- PDF wird ohne externe PDF-Library erzeugt (eigene Layout- und Text-Rendering-Logik inkl. Seitenumbruch).

## 4. Hinweise für ein anderes LLM zur Fortführung
- Produktziel: Soulver-ähnlicher Zeilenrechner mit Schwerpunkt auf natürlicher Syntax, Variablen und Reproduzierbarkeit von Zwischenschritten.
- Sprache:
  - UI ist vollständig lokalisiert (`de`/`en`)
  - Standard über Browser-Sprache, aber per Einstellung übersteuerbar
- Wichtige Kompatibilitätsregeln:
  - Trailing `=` tolerieren
  - `@n` auf leere Zeile -> klarer Fehlertext
  - Variablen case-insensitive behandeln
  - Deutsche und englische Synonyme für Umrechnung unterstützen (`to/zu`, `as/als`)
- Zahlenlogik ist sensibel:
  - Tausender-/Dezimaltrennzeichen sind benutzerkonfigurierbar
  - Punkt muss bei nicht-tausenderkonformen Mustern als Dezimalzeichen interpretiert werden
- Excel-ähnliche Funktionen:
  - Case-insensitive
  - Mit/ohne `=`
  - Bereichsreferenzen `@x:@y` müssen leere und Kommentarzeilen überspringen
- Datums-/Zeitfunktionen:
  - `tage bis`/`days until` und `tage zwischen`/`days between` unterstützen
  - Datumsformate `YYYY-MM-DD`, `DD.MM.YYYY`, `DD. MMMM YYYY`
  - Datumswerte in Highlighting und Anzeige konsistent behandeln
- Währungslogik:
  - Fixe Fallback-Kurse plus optionale Live-Kurse (Frankfurter)
  - Bei Live-Kursen dynamisch alle API-Währungen als Einheiten/Aliasse zulassen
- UI-Details, die nicht regressieren dürfen:
  - 70/30-Aufteilung Input/Ergebnis
  - saubere Zeilennummern-Ausrichtung bei an/aus
  - funktionierendes synchrones Scrollen
  - Fullsize-Toggle inkl. Persistenz
- Exportdetails:
  - PDF berücksichtigt Syntax-Highlighting und optional Zeilennummern
  - Markdown-Export enthält bewusst keine Zeilennummern
- Persistenz-Keys:
  - `zeilenrechner:last-sheet`
  - `zeilenrechner:view-mode`
  - `zeilenrechner:settings`
- Test/CI:
  - Calculator Test Suite: `./scripts/test-suite.sh`
  - GitHub Action: `.github/workflows/calculator-suite.yml`

## 5. Verwendetes Tool und LLM
- Tool: Codex (Desktop-Agent)
- LLM: GPT-5 (Codex)
