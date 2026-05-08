# Project Status

## ✅ Done

### Icons
- Fixed all missing/broken icons across all 8 chapter pages (`capitole/*.html`)  
- Replaced PUA Unicode characters with standard emoji

### CSS
- Added `.code-output` class to `css/style.css`  
  - Dark background block with `▶ Output` label  
  - `.out-comment` and `.out-highlight` subclasses

### Exercise JSON Database (`data/exercises/`)
All 8 chapter JSON files extended to 100 questions:

| File | Questions |
|------|-----------|
| `vectori.json` | 100 |
| `siruri.json` | 100 |
| `recursivitate.json` | 100 |
| `backtracking.json` | 100 |
| `complexitate.json` | 100 |
| `matrici.json` | 100 |
| `fisiere.json` | 100 |
| `introducere.json` | 100 |

### Quiz JSON wiring
- All 8 `capitole/*.html` updated with `data-quiz-src` attribute
- `js/quiz.js` and `public/js/quiz.js` updated to load from external JSON
- Inline `window.QUIZ_DATA` blocks removed from all chapter pages

### Code output blocks
- Added `<div class="code-output">` blocks after key `<pre>` examples in all 8 chapters
- Uses `.out-comment` and `.out-highlight` subclasses
- Covers: permutations, subsets (backtracking), Hanoi moves (recursivitate), matrix print/sums (matrici), strtok/strstr/anagram (siruri), type sizes/INT_MAX (introducere), O(n) loop (complexitate), file I/O sums (fisiere), sorted check (vectori)

---

## ❌ Remaining

### 1. SVG diagrams per chapter
None added yet. Planned illustrations:

| Chapter | Diagram |
|---------|---------|
| `vectori.html` | Array index/value boxes |
| `matrici.html` | 3×3 grid with highlighted diagonal |
| `recursivitate.html` | Fibonacci call tree |
| `backtracking.html` | Decision tree with pruning |
| `complexitate.html` | Big-O growth curves |
| `siruri.html` | Character boxes with ASCII codes |
| `fisiere.html` | File/folder hierarchy |
| `introducere.html` | CPU / Memory / Storage blocks |

### 2. Theory content in JSON database
- No structured theory/content JSON exists yet
- Planned: store chapter theory text in `data/` so it can be loaded dynamically
