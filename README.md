# Zeilenrechner (Soulver-ähnliche Webapp)

## 1. Beschreibung der Anwendung
Diese Webapp ist ein zeilenbasierter Rechner im Stil von Soulver: Links werden Eingaben erfasst, rechts erscheinen pro Zeile die Ergebnisse in Echtzeit. Die Anwendung unterstützt Kommentare, Variablen, Zeilenreferenzen, Prozentrechnung, Vergleiche, Funktionen und Einheiten-Umrechnung.

Der Fokus liegt auf schnellem, nachvollziehbarem Rechnen mit Zwischenschritten. Ergebnisse können weiterverwendet, das Sheet exportiert und der letzte Stand inklusive Ansicht/Einstellungen persistiert werden.

## 2. Feature-Übersicht
### Haupt-Features
- Zeilenweises Rechnen mit Live-Auswertung.
- Zwei-Spalten-Layout mit ca. `70 %` Eingabe und `30 %` Ergebnis.
- Kommentare:
  - Ganze Kommentarzeilen mit `#` oder `//`.
  - Inline-Kommentare mit `//`.
- Variablen:
  - `name = ...`, `name += ...`, `name -= ...`.
  - Mehrwort-Variablennamen werden unterstützt.
  - Referenz auf letztes Ergebnis via `ans` oder `last`.
- Zeilenreferenzen:
  - `@n` referenziert Zeile `n`.
  - Falls `@n` auf eine leere Zeile zeigt: `Fehler: Zeile n leer`.
- Vergleiche / Conditionals:
  - `>`, `>=`, `<`, `<=`, `==`, `!=`.
  - Ergebnis als `true`/`false`.
- Funktionen:
  - `min(...)`, `max(...)`.
  - Argumente z. B. `min(3;5)`.
- Prozentrechnung:
  - `3% von 100`, `3 % von 100`, `3 Prozent von 100`.
  - Prozentoperationen in Ausdrücken (z. B. `100 + 19%`).
- Einheiten und Umrechnung:
  - Operatoren: `in`, `to`/`zu`, `as`/`als`.
  - Kurzform: `km m`.
  - Unterstützt u. a. Länge, Masse, Zeit, Volumen, Fläche, Geschwindigkeit, Temperatur, Währungen.
- Trailing `=` wird toleriert:
  - `1 + 2 =` ist gültig und erzeugt keinen Fehler.

### Zahlensystem und Parsing (de-DE)
- Ausgabe mit deutschem Zahlenformat:
  - Dezimaltrennzeichen `,`.
  - Tausendertrennzeichen `.`.
- Eingabeverarbeitung für Punkte:
  - Tausenderpunkte werden ignoriert (`3.000.000` -> `3000000`).
  - Falls ein Punkt nicht wie ein Tausendertrenner aussieht, wird er als Dezimalzeichen interpretiert (`1.1` -> `1,1`).

### Einstellungen (persistiert)
- `math.js verwenden` (ohne Reload umschaltbar, mit Fallback auf internen Parser).
- `Nachkommastellen` (`0` bis `10`, Standard: `4`).
- `Fixe Nachkommastellen` (an/aus).
- `Ganzzahlen ohne Nachkommastellen` (an/aus).
- `Mit genauen Zwischenergebnissen rechnen` (an/aus, Standard: an).
- `Syntax-Highlighting` (Eingabe + PDF-Export).
- `Zeilennummern` (Eingabe + Ergebnis, sowie PDF-Export; nicht im Markdown-Export).

### Hilfe, Bedienung und UX
- Hilfe-Chip `?` mit Syntaxübersicht, Umrechnungen, math.js-Link und Demo-Button.
- Zusatzblock „Zusätzlich Mit math.js“ im Hilfe-Popover, sobald math.js aktiviert ist.
- Download-Chip mit Export-Popover.
- Settings-Chip mit allen Laufzeit-Einstellungen.
- Fullsize-Button:
  - Blendet Topbar und Footer-Hinweise aus.
  - Floating-Resize-Button bleibt oben rechts sichtbar.
  - Ansicht wird über Local Storage wiederhergestellt.
- `Tab` im Eingabefeld fügt 4 Leerzeichen ein.
- Scroll-Synchronisierung zwischen Eingabe, Highlight-Overlay, Ergebnisspalte und (falls aktiv) Zeilennummern.

### Export
- PDF-Export:
  - Mit oder ohne mittigen Trennstrich.
  - Optional mit Syntax-Highlighting in der Eingabespalte.
  - Optional mit Zeilennummern auf beiden Seiten (grau dargestellt).
- Markdown-Export:
  - Tabelle `Eingabe | Ergebnis`.
  - Zeilennummern werden hier bewusst nicht ausgegeben.

### PWA
- Webapp ist als Progressive Web App vorbereitet:
  - `manifest.webmanifest` (Standalone-Display, Theme-Farben, App-Metadaten).
  - Service Worker (`sw.js`) mit Asset-Caching und Offline-Fallback für `index.html`.
  - App-Icons in mehreren Größen inkl. `maskable`-Variante.
  - Service-Worker-Registrierung beim Laden der App.

### Persistenz (Local Storage)
- Letzter Eingabetext.
- Letzter View-Mode (Standard/Fullsize).
- Alle Einstellungen.

## 3. Technischer Aufbau
### Architektur
- `index.html`
  - UI-Struktur: Topbar, Editor-Panes, Popover (Hilfe, Export, Einstellungen), Fullsize-Float-Button.
- `styles.css`
  - Responsives Layout, Pane-Struktur, Highlight-Farben, Fullsize-Zustand, Zeilennummern-Gutter.
- `app.js`
  - Parser/Evaluator, State-Management, Persistenz, Export (Markdown/PDF), Event-Handling.

### Technologien
- HTML5, CSS3, Vanilla JavaScript (ES6+).
- Browser APIs: `localStorage`, DOM Events, `Blob`, `URL.createObjectURL`.
- Optional: `math.js` (dynamisch per CDN geladen, nur wenn aktiviert).

### Rechenlogik
- Interner Tokenizer + Parser (Operator-Precedence) + Evaluator.
- Unterstützt:
  - Arithmetik, Prozentlogik, Vergleiche, Funktionen (`min/max`), Einheiten, Variablen/Referenzen.
- Optionaler math.js-Pfad:
  - Wird nur für kompatible Ausdrücke genutzt.
  - Bei Fehlern/Inkompatibilität erfolgt Fallback auf den internen Evaluator.

### Export-Implementierung
- Markdown:
  - Direkter Tabellenexport aus Eingabe-/Ergebniszeilen.
- PDF:
  - Manuelle PDF-Erzeugung mit eigener Text-Layout-Logik.
  - Seitenumbruch, optionaler Divider, Tokenfarben (bei Highlighting), optionale Zeilennummern.

## 4. Hinweise für ein anderes LLM zur Fortführung
### Produktvorgaben aus dem Verlauf
- Soulver-ähnliches Verhalten: Zeilenweise Eingabe links, Ergebnis je Zeile rechts.
- Locale de-DE für Zahlenanzeige und Parsing.
- Start mit leerem Eingabefeld; Demo wird nur über den Button geladen.
- Toolbar-Reihenfolge rechts oben: `?`, Download, Einstellungen, Fullsize.
- `?`, Download und Einstellungen sind nur in der Standardansicht sichtbar.

### Wichtige Syntax-Details
- Kommentare: `#` und `//`.
- Trailing `=` ignorieren.
- Synonyme für Umrechnung: `to/zu`, `as/als`.
- Vergleichsoperatoren und boolesche Ergebnisse müssen erhalten bleiben.
- `@n` muss bei leerer referenzierter Zeile den Fehler `Fehler: Zeile n leer` liefern.
- Prozentformen mit `%`, `Prozent`, `von` unterstützen.

### Bekannte Implementierungsdetails
- Mehrwort-Variablen werden im Preprocessing per Platzhalter ersetzt.
- Inline-`//` wird mit Quote-Handling ermittelt, nicht per blindem Split.
- Zuweisungsparser darf `==`, `>=`, `<=`, `!=` nicht als Assignment werten.
- `Ganzzahlen ohne Nachkommastellen` greift zusätzlich zur allgemeinen Nachkommastellen-Logik.
- `Fixe Nachkommastellen` steuert min/max Fraction Digits.
- Bei deaktivierter Option `Mit genauen Zwischenergebnissen rechnen` werden Variablen für Folgezeilen quantisiert gespeichert.

### Persistenz-Keys
- `zeilenrechner:last-sheet`
- `zeilenrechner:view-mode`
- `zeilenrechner:settings`

### Settings-Modell (aktuell)
- `useMathJs: boolean`
- `decimalPlaces: number` (`0..10`)
- `fixedDecimals: boolean`
- `integerNoDecimals: boolean`
- `preciseIntermediates: boolean`
- `syntaxHighlighting: boolean`
- `lineNumbers: boolean`

### Sensible Bereiche für Änderungen
- Scroll-Synchronisierung zwischen Input/Output/Highlight/Gutter nicht brechen.
- Bei Layout-Änderungen auf Grid/Flex-Min-Height (`min-height: 0`) achten.
- PDF-Layout ist manuell berechnet; kleine Breiten-/Abstandsänderungen können Umbrüche beeinflussen.
- Bei Parser-Erweiterungen unbedingt Operator-Prioritäten und Fallback-Verhalten zu math.js testen.

## 5. Verwendetes Tool und LLM
- Tool: Codex (Desktop-Agent mit Shell- und Patch-Workflow).
- LLM: GPT-5 (Codex-basierte Session).
