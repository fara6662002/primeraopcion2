import { useEffect, useRef } from 'react';
import katex from 'katex';

type Props = {
  text: string;
  className?: string;
};

/**
 * Renders text with inline LaTeX math delimited by $...$ or $$...$$.
 * Non-math portions are displayed as plain text.
 */
export default function MathText({ text, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    el.innerHTML = '';

    const parts = splitMath(text);
    for (const part of parts) {
      if (part.type === 'display' || part.type === 'inline') {
        const span = document.createElement('span');
        try {
          katex.render(part.content, span, {
            throwOnError: false,
            displayMode: part.type === 'display',
          });
        } catch {
          span.textContent = part.content;
        }
        el.appendChild(span);
      } else {
        el.appendChild(document.createTextNode(part.content));
      }
    }
  }, [text]);

  return <span ref={ref} className={className} />;
}

type Part = { type: 'text' | 'inline' | 'display'; content: string };

function splitMath(text: string): Part[] {
  const parts: Part[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const displayIdx = remaining.indexOf('$$');
    const inlineIdx = remaining.indexOf('$');

    if (displayIdx !== -1 && (inlineIdx === -1 || displayIdx <= inlineIdx)) {
      if (displayIdx > 0) parts.push({ type: 'text', content: remaining.slice(0, displayIdx) });
      const endIdx = remaining.indexOf('$$', displayIdx + 2);
      if (endIdx === -1) {
        parts.push({ type: 'text', content: remaining.slice(displayIdx) });
        break;
      }
      parts.push({ type: 'display', content: remaining.slice(displayIdx + 2, endIdx) });
      remaining = remaining.slice(endIdx + 2);
    } else if (inlineIdx !== -1) {
      if (inlineIdx > 0) parts.push({ type: 'text', content: remaining.slice(0, inlineIdx) });
      const endIdx = findClosingDollar(remaining, inlineIdx + 1);
      if (endIdx === -1) {
        parts.push({ type: 'text', content: remaining.slice(inlineIdx) });
        break;
      }
      parts.push({ type: 'inline', content: remaining.slice(inlineIdx + 1, endIdx) });
      remaining = remaining.slice(endIdx + 1);
    } else {
      parts.push({ type: 'text', content: remaining });
      break;
    }
  }

  return parts;
}

function findClosingDollar(text: string, start: number): number {
  for (let i = start; i < text.length; i++) {
    if (text[i] === '$' && text[i - 1] !== '\\') return i;
  }
  return -1;
}
