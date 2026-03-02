# Zeilenrechner (Soulver-ähnliche Webapp)

## 1. Beschreibung der Anwendung
Diese Anwendung ist ein zeilenbasierter Rechner im Stil von Soulver. Links werden Eingaben zeilenweise erfasst, rechts erscheinen die jeweils berechneten Ergebnisse pro Zeile.  
Die App unterstützt freie mathematische Ausdrücke, Variablen, Kommentare, Einheiten-Umrechnungen und mehrere Komfortfunktionen wie Export, Fullsize-Modus, Persistenz über Local Storage sowie optionale Nutzung von `math.js`.

Die Zielsetzung ist, schnelle Alltagsrechnungen und kleine Rechen-Notizen in einer einzigen Oberfläche zu verbinden: Rechnen, dokumentieren, weiterreferenzieren und exportieren.

## 2. Feature-Übersicht
### Haupt-Features
- Zeilenweises Rechnen mit Live-Auswertung.
- Zwei-Spalten-Layout:
  - Eingabe links.
  - Ergebnis rechts.
  - Verhältnis ca. `70% / 30%`.
- Variablen und Referenzen:
  - Zuweisung: `name = ...`, `name += ...`, `name -= ...`.
  - Nutzung in Folgezeilen.
  - Mehrwort-Variablen werden unterstützt.
  - Zeilenreferenzen via `@n`.
  - `ans` / `last` für letztes Ergebnis.
- Kommentare:
  - Ganze Zeilen mit `#` oder `//`.
  - Inline-Kommentare mit `//`.
- Deutsche Zahlennotation:
  - Dezimaltrennzeichen: `,`
  - Tausendertrennzeichen: `.`
  - Punkte werden beim Parsen als Gruppierung interpretiert.
- Einheiten und Umrechnung:
  - Umrechnungen mit `in`, `to`, `as`.
  - Kurzform für Umrechnung wie `km m`.
  - Gemischte Zeitangaben (z. B. `5 h 30 min in min`).

### Erweiterte Syntax
- Prozentrechnung:
  - `10%`, `100 + 19%`.
  - Formulierungen mit `Prozent` und `von`, z. B. `3 Prozent von 100`.
  - Synonyme wie `3 % von 100` und `3% von 100`.
- Vergleiche / Conditionals:
  - `>`, `>=`, `<`, `<=`, `==`, `!=`.
  - Ergebnisdarstellung als `true` / `false`.
- Funktionen:
  - `min(...)` und `max(...)`.
  - Argumenttrennung mit `;`, z. B. `min(3;5)`.
- Toleranz für trailing `=`:
  - Zeilen wie `1 + 2 =` verursachen keinen Fehler.

### Export
- Download-Popover mit:
  - PDF mit mittigem Trennstrich.
  - PDF ohne Trennstrich.
  - Markdown-Tabelle.
- PDF-Export mit Seitenumbruch-Handling.
- Optionales Syntax-Highlighting wirkt auch im PDF-Export auf die Eingabespalte.

### Darstellung & UX
- Hilfe-Popover (`?`) mit Syntax-Hinweisen und Demo-Button.
- Demo-Button befüllt ein Beispiel-Sheet.
- Fullsize-Modus:
  - Blendet Topbar und Infoleiste aus.
  - Floating-Resize-Button oben rechts für Rückkehr.
  - Zustand wird persistent gespeichert.
- Settings-Popover:
  - `math.js verwenden` (toggle, zur Laufzeit ohne Reload).
  - `Fixe Nachkommastellen` (`0` bis `10`, Default `4`).
  - `Ganzzahlen ohne Nachkommastellen`.
  - `Mit genauen Zwischenergebnissen rechnen`.
  - `Syntax-Highlighting` für Eingabe und PDF-Export.

### Quality-of-Life-Features
- Local Storage Persistenz:
  - Letzter Eingabezustand.
  - Ansichtsmodus (`standard`/`full`).
  - Einstellungen.
- Popover-Handling:
  - Popover schließen sich gegenseitig.
  - Schließen via Klick außerhalb und `Esc`.
- Tab-Verhalten im Eingabefeld:
  - `Tab` fügt 4 Leerzeichen ein.
- Responsive Verhalten für kleinere Viewports.

## 3. Technischer Aufbau
### Architektur
Das Projekt ist eine reine Frontend-Webapp ohne Build-Pipeline:
- `index.html`: UI-Struktur (Topbar, Editor, Ergebnisbereich, Popover).
- `styles.css`: Layout, Responsiveness, visuelle Zustände, Highlighting.
- `app.js`: Parser, Evaluator, State-Management, Persistenz, Export-Logik.

### Eingesetzte Technologien
- HTML5 (UTF-8).
- CSS3.
- Vanilla JavaScript (ES6+).
- Browser APIs:
  - `localStorage`
  - DOM Events
  - `Blob` / Download via Object-URL
- Optionale externe Runtime-Bibliothek:
  - `math.js` (dynamisch zur Laufzeit via CDN geladen, nur wenn aktiviert).

### Parsing- / Evaluationsansatz
- Eigener Tokenizer + Parser (Pratt/precedence-basiert) für die Kernsyntax.
- Eigener Evaluator für:
  - Variablen, Prozentlogik, Vergleiche, `min/max`, Einheiten.
- Optionaler math.js-Pfad:
  - Wird versucht, wenn aktiviert und Ausdruck kompatibel erscheint.
  - Fällt bei Inkompatibilität/Fehlern auf den internen Evaluator zurück.

### Export-Implementierung
- Markdown-Export: tabellarische Zeilen `Eingabe | Ergebnis`.
- PDF-Export:
  - PDF wird programmatisch erzeugt.
  - Wahlweise mit oder ohne vertikale Mittellinie.
  - Zeilenumbruch und Paging werden intern gesteuert.
  - Bei aktiviertem Syntax-Highlighting werden Eingabe-Tokens farblich kodiert.

## 4. Hinweise für ein anderes LLM zur Fortführung
Dieser Abschnitt enthält projektspezifische Informationen, die bei Weiterentwicklung wichtig sind.

### Produkt- und UX-Anforderungen aus dem Verlauf
- App soll Soulver-ähnlich sein (zeilenweise Rechenoberfläche).
- Locale ist deutsch:
  - Komma als Dezimalzeichen.
  - Punkt als Tausendertrennzeichen.
- Startzustand:
  - Eingabe ist initial leer, es sei denn Local Storage enthält vorhandenen Stand.
- Help-Menü:
  - Enthält Syntaxübersicht, Umrechnungen, Demo-Button.
  - Enthält Link zur math.js-Syntax.
  - Enthält zusätzlichen Block mit `math.js`-Chip, wenn math.js aktiviert ist.
- Toolbar-Reihenfolge rechts oben:
  - `?` → Download → Settings → Fullsize.
- Sichtbarkeit:
  - `?`, Download, Settings nur in Nicht-Fullscreen (Topbar sichtbar).
  - Im Fullscreen bleibt nur ein halbtransparenter Resize-Float.

### Bestehende Implementierungsdetails, die leicht übersehen werden
- Trailing `=` wird vor der Auswertung entfernt.
- Mehrwort-Variablen werden via Placeholder im Preprocessing aufgelöst.
- Inline-`//` wird mit Quote-Schutz gesucht (nicht blindes Split).
- `parseAssignment` behandelt `==`, `>=`, `<=`, `!=` korrekt als Vergleich statt Zuweisung.
- Bool-Werte werden intern als Quantity mit `isBoolean` transportiert; Darstellung ist `true`/`false`.
- `min/max` akzeptieren Argumente mit `;`.
- Prozentvarianten:
  - `%`, `Prozent`, `von` werden normalisiert.
- `math.js` wird lazy geladen und muss ohne Reload umschaltbar sein.

### Persistenz-Keys (Local Storage)
- `zeilenrechner:last-sheet`
- `zeilenrechner:view-mode`
- `zeilenrechner:settings`

### Settings (aktuelles Modell)
- `useMathJs: boolean`
- `decimalPlaces: 0..10`
- `integerNoDecimals: boolean`
- `preciseIntermediates: boolean`
- `syntaxHighlighting: boolean`

### Offene / sensible Punkte für zukünftige Änderungen
- `math.js`-Fallback-Strategie ist bewusst defensiv:
  - Bei nicht unterstützten oder uneindeutigen Ausdrücken lieber internen Parser nutzen.
- Bei Parser-Erweiterungen auf Prioritäten/Precedence achten (Vergleich vs. arithmetisch vs. Umrechnung).
- Syntax-Highlighting darf den Editor-Caret nicht brechen:
  - Overlay-Ansatz mit `textarea` + `pre`.
  - Scroll-Sync ist notwendig.
- PDF-Export ist manuell erzeugt:
  - Änderungen an Highlight-Farben oder Breiten beeinflussen Umbruchberechnung.

### Wünsche/Qualitätsrahmen aus dem Verlauf
- Responsives Layout beibehalten.
- Soulver-ähnliche Benutzerführung erhalten.
- Bestehende Eingabesyntax nach Möglichkeit kompatibel halten.
- Einstellungen sollen ohne Reload greifen.
- Dokumentation/UX-Elemente in deutscher Sprache halten.

## 5. Verwendetes Tool und LLM
- Tool: Codex (Desktop/CLI-Workflow mit Shell, Patch-Editing und Tests).
- LLM: GPT-5 (Codex-basiert, aktuelle Session-Version gemäß Umgebung).
