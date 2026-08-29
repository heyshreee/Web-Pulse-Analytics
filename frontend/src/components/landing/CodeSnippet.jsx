// Lightweight VS Code "Dark+"-style syntax highlighting for the small static
// HTML script snippet shown on the landing page. Hand-rolled instead of pulling
// in the ~640KB react-syntax-highlighter/Prism bundle so the marketing page stays
// fast. Colors match the atomDark Prism theme used across the docs/API pages.
const COLORS = {
  tag: '#e06c75',
  attr: '#d19a66',
  value: '#98c379',
  text: '#abb2bf',
};

// Matches html-attribute="value" pairs; the snippet is a single <script> tag
// with no nested content, so a focused regex is sufficient and safe here.
const ATTR_RE = /([\w-]+)="([^"]*)"/g;

function renderLine(line, key) {
  const trimmed = line.trim();
  const isTag = trimmed.startsWith('<') || trimmed.startsWith('</') || trimmed.startsWith('>') || trimmed.startsWith('/>');

  const parts = [];
  let lastIndex = 0;
  let m;

  if (!isTag) {
    return (
      <span key={key} style={{ color: COLORS.text }}>
        {line}
      </span>
    );
  }

  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(line)) !== null) {
    if (m.index > lastIndex) {
      parts.push(
        <span key={`p${lastIndex}`} style={{ color: isTag ? COLORS.tag : COLORS.text }}>
          {line.slice(lastIndex, m.index)}
        </span>
      );
    }
    parts.push(
      <span key={`a${m.index}`} style={{ color: COLORS.attr }}>
        {m[1]}
      </span>,
      <span key={`eq${m.index}`} style={{ color: COLORS.tag }}>
        {'="'}
      </span>,
      <span key={`v${m.index}`} style={{ color: COLORS.value }}>
        {m[2]}
      </span>,
      <span key={`c${m.index}`} style={{ color: COLORS.tag }}>
        {'"'}
      </span>
    );
    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < line.length) {
    parts.push(
      <span key={`t${lastIndex}`} style={{ color: COLORS.tag }}>
        {line.slice(lastIndex)}
      </span>
    );
  }

  return <span key={key}>{parts}</span>;
}

export default function CodeSnippet({ code }) {
  const lines = code.trim().split('\n');
  return (
    <pre className="p-5 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto bg-transparent m-0">
      <code>
        {lines.map((line, i) => (
          <div key={i} style={{ whiteSpace: 'pre' }}>
            {renderLine(line, i)}
          </div>
        ))}
      </code>
    </pre>
  );
}
