/**
 * Clipboard helper with a synchronous fallback for browsers where the async
 * Clipboard API is unavailable (non-secure contexts, older engines).
 */
export async function copyText(value) {
  const text = String(value ?? '');

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through to the legacy path */
    }
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Copies and reports success; callers surface their own toast. */
export async function copyWithFeedback(value) {
  return copyText(value);
}