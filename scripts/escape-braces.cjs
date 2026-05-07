const fs = require("fs");
const path = require("path");
const dir = "src/pages/capitole";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".astro"));

const KNOWN_TAGS = new Set([
  "a","abbr","address","article","aside","audio","b","blockquote","body","br",
  "button","caption","cite","code","col","colgroup","data","datalist","dd","del",
  "details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption",
  "figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hr",
  "html","i","iframe","img","input","ins","kbd","label","legend","li","link",
  "main","map","mark","meta","meter","nav","noscript","object","ol","optgroup",
  "option","output","p","picture","pre","progress","q","rp","rt","ruby","s",
  "samp","script","section","select","small","source","span","strong","style",
  "sub","summary","sup","table","tbody","td","template","textarea","tfoot","th",
  "thead","time","title","tr","track","u","ul","var","video","wbr",
  "svg","path","circle","rect","line","polyline","polygon","g","use","defs",
  "marker","text","tspan","clipPath","linearGradient","radialGradient","stop",
  "symbol","mask","pattern","filter","feBlend","feColorMatrix","feGaussianBlur",
  "ChapterLayout","Fragment","slot"
]);

for (const file of files) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, "utf8");
  const fmMatch = content.match(/^(---[\s\S]*?---\n)([\s\S]*)$/);
  if (!fmMatch) continue;
  const fm = fmMatch[1];
  let template = fmMatch[2];

  template = template
    .replace(/&#123;/g, "{")
    .replace(/&#125;/g, "}")
    .replace(/&lt;&lt;/g, "<<")
    .replace(/&lt;/g, "<");

  let result = "";
  let i = 0;
  let inTag = false;
  let inQuote = false;
  let quoteChar = "";
  let jsxDepth = 0;

  while (i < template.length) {
    const ch = template[i];
    const rest = template.slice(i);

    if (!inTag) {
      const lo7 = rest.slice(0, 7).toLowerCase();
      if (lo7 === "<script" || lo7 === "<style>") {
        const ct = lo7.startsWith("<script") ? "</script>" : "</style>";
        const end = template.indexOf(ct, i);
        if (end !== -1) {
          result += template.slice(i, end + ct.length);
          i = end + ct.length;
          continue;
        }
      }
    }

    if (inTag) {
      if (inQuote) {
        if (ch === quoteChar) { inQuote = false; quoteChar = ""; }
        result += ch; i++;
      } else if (jsxDepth > 0) {
        if (ch === "{") jsxDepth++;
        else if (ch === "}") jsxDepth--;
        result += ch; i++;
      } else {
        if (ch === '"' || ch === "'") { inQuote = true; quoteChar = ch; result += ch; }
        else if (ch === "{") { jsxDepth = 1; result += ch; }
        else if (ch === ">") { inTag = false; result += ch; }
        else { result += ch; }
        i++;
      }
    } else {
      if (ch === "<") {
        const m = rest.match(/^<([a-zA-Z][a-zA-Z0-9_.-]*)/);
        if (m) {
          const tn = m[1];
          if (KNOWN_TAGS.has(tn) || KNOWN_TAGS.has(tn.toLowerCase())) {
            inTag = true; result += ch;
          } else {
            result += "&lt;";
          }
        } else if (/^<[\/!?]/.test(rest)) {
          inTag = true; result += ch;
        } else {
          result += "&lt;";
        }
        i++;
      } else if (ch === "{") {
        result += "&#123;"; i++;
      } else if (ch === "}") {
        result += "&#125;"; i++;
      } else {
        result += ch; i++;
      }
    }
  }

  fs.writeFileSync(fp, fm + result);
  console.log("Fixed:", file);
}
console.log("Done");
