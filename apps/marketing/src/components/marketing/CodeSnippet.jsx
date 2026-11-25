const COLORS = {
  tag: '#F5F5F4',
  attr: '#C8C8C4',
  value: '#FFFFFF',
  text: '#B3B3AF',
};

const ATTR_RE = /([\w-]+)="([^"]*)"/g;
const HAS_ATTR_RE = /[\w-]+="/;

function renderLine(line, key) {
  const trimmed = line.trim();
  const isTag =
    trimmed.startsWith('<') ||
    trimmed.startsWith('</') ||
    trimmed.startsWith('>') ||
    trimmed.startsWith('/>') ||
    HAS_ATTR_RE.test(trimmed);

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
        <span key={`p${lastIndex}`} style={{ color: COLORS.tag }}>
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
    <pre className="m-0 overflow-x-auto bg-transparent p-5 font-mono text-[13px] leading-relaxed sm:p-6">
      <code>
        {lines.map((line, i) => (
          <div key={i} style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {renderLine(line, i)}
          </div>
        ))}
      </code>
    </pre>
  );
}
