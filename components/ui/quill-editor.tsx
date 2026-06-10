"use client";

import { useEffect, useRef, useId } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';


interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  dir?: string;
}

// Strip only unwanted inline color/background styles that Quill injects
function sanitizeQuillHtml(html: string): string {
  return html
    .replace(/\s*style="[^"]*?"/g, (match) => {
      const stripped = match
        .replace(/color:\s*[^;"]+;?/gi, '')
        .replace(/background-color:\s*[^;"]+;?/gi, '')
        .replace(/style="\s*;?\s*"/i, '');
      return stripped;
    });
}

export function QuillEditor({ value, onChange, placeholder, className, dir }: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const scopeId = useId().replace(/:/g, '');

  // Keep onChange ref fresh so the Quill handler never goes stale
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!editorRef.current) return;

    let mounted = true;

    const initEditor = async () => {
      // Load quill-resize-module (Quill 2 compatible) + its CSS
      let hasResize = false;
      try {
        const [mod] = await Promise.all([
          import('quill-resize-module'),
          import('quill-resize-module/dist/resize.css'),
        ]);
        const QuillResize = mod.default || mod;
        Quill.register('modules/resize', QuillResize, true);
        hasResize = true;
      } catch (e) {
        console.warn('quill-resize-module failed to load:', e);
      }

      if (!mounted || !editorRef.current) return;

      const modules: Record<string, unknown> = {
        toolbar: [
          [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ script: 'sub' }, { script: 'super' }],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ align: [] }],
          [{ direction: 'rtl' }],
          ['blockquote', 'code-block'],
          ['link', 'image', 'video'],
          ['clean'],
        ],
      };
      if (hasResize) {
        modules.resize = { locale: {} };
      }

      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Enter text...',
        modules,
      });

      // Set initial value — sanitize to remove any previously stored extra styles
      if (value) {
        quill.root.innerHTML = sanitizeQuillHtml(value);
      }

      // Apply direction to the editor root and Quill's internal format
      const direction = dir || 'ltr';
      quill.root.setAttribute('dir', direction);
      quill.root.style.textAlign = direction === 'rtl' ? 'right' : 'left';
      if (direction === 'rtl') {
        quill.formatText(0, quill.getLength(), 'direction', 'rtl', 'silent');
        quill.formatText(0, quill.getLength(), 'align', 'right', 'silent');
      }

      // Listen for changes — use ref to always call latest onChange
      quill.on('text-change', () => {
        const raw = quill.root.innerHTML;
        if (raw === '<p><br></p>') { onChangeRef.current(''); return; }
        onChangeRef.current(sanitizeQuillHtml(raw));
      });

      quillRef.current = quill;
    };

    initEditor();

    // Cleanup on unmount
    return () => {
      mounted = false;
      quillRef.current = null;
    };
  }, []);

  // Update direction when dir prop changes
  useEffect(() => {
    if (!quillRef.current) return;
    const direction = dir || 'ltr';
    quillRef.current.root.setAttribute('dir', direction);
    quillRef.current.root.style.textAlign = direction === 'rtl' ? 'right' : 'left';

    // Apply Quill's internal direction format so lists/indent/align work
    if (direction === 'rtl') {
      quillRef.current.formatText(0, quillRef.current.getLength(), 'direction', 'rtl', 'silent');
      quillRef.current.formatText(0, quillRef.current.getLength(), 'align', 'right', 'silent');
    } else {
      quillRef.current.formatText(0, quillRef.current.getLength(), 'direction', false, 'silent');
      quillRef.current.formatText(0, quillRef.current.getLength(), 'align', false, 'silent');
    }

    // Also set on the container for proper placeholder alignment
    const container = quillRef.current.root.parentElement;
    if (container) {
      container.setAttribute('dir', direction);
    }
  }, [dir]);

  return (
    <div ref={wrapperRef} className={`quill-wrap-${scopeId} ${className ?? ''}`} dir={dir}>
      <style>{`
        .quill-wrap-${scopeId} .ql-toolbar.ql-snow {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 0.75rem 0.75rem 0 0;
          border-bottom: none;
          padding: 8px 10px;
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-formats {
          margin-right: 8px;
          display: inline-flex;
          align-items: center;
          gap: 1px;
        }
        .quill-wrap-${scopeId} .ql-toolbar button {
          width: 30px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.15s ease;
        }
        .quill-wrap-${scopeId} .ql-toolbar button:hover {
          background: rgba(110, 231, 183, 0.1);
        }
        .quill-wrap-${scopeId} .ql-toolbar button.ql-active {
          background: rgba(110, 231, 183, 0.15);
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-stroke {
          stroke: rgba(255, 255, 255, 0.45);
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-fill {
          fill: rgba(255, 255, 255, 0.45);
        }
        .quill-wrap-${scopeId} .ql-toolbar button:hover .ql-stroke,
        .quill-wrap-${scopeId} .ql-toolbar button.ql-active .ql-stroke {
          stroke: #6ee7b7;
        }
        .quill-wrap-${scopeId} .ql-toolbar button:hover .ql-fill,
        .quill-wrap-${scopeId} .ql-toolbar button.ql-active .ql-fill {
          fill: #6ee7b7;
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker {
          color: rgba(255, 255, 255, 0.45);
          height: 28px;
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker-label {
          color: rgba(255, 255, 255, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 6px;
          padding: 2px 8px;
          transition: all 0.15s ease;
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker-label:hover {
          color: rgba(255, 255, 255, 0.7);
          border-color: rgba(255, 255, 255, 0.15);
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker-label .ql-stroke {
          stroke: rgba(255, 255, 255, 0.35);
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker-options {
          background: #1e1f2a;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 0.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          padding: 4px;
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker-options .ql-picker-item {
          color: rgba(255, 255, 255, 0.6);
          border-radius: 4px;
          padding: 4px 8px;
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker-options .ql-picker-item:hover {
          color: #6ee7b7;
          background: rgba(110, 231, 183, 0.08);
        }
        .quill-wrap-${scopeId} .ql-container.ql-snow {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 0 0 0.75rem 0.75rem;
          font-family: 'DM Sans', sans-serif;
        }
        .quill-wrap-${scopeId} .ql-editor {
          color: #f0f0f5;
          font-size: 0.875rem;
          font-weight: 300;
          line-height: 1.7;
          min-height: 180px;
          padding: 16px 18px;
        }
        .quill-wrap-${scopeId} .ql-editor.ql-blank::before {
          color: rgba(255, 255, 255, 0.18);
          font-style: normal;
          font-weight: 300;
        }
        .quill-wrap-${scopeId} .ql-editor h1,
        .quill-wrap-${scopeId} .ql-editor h2,
        .quill-wrap-${scopeId} .ql-editor h3 {
          color: #f0f0f5;
          font-weight: 600;
        }
        .quill-wrap-${scopeId} .ql-editor a {
          color: #6ee7b7;
        }
        .quill-wrap-${scopeId} .ql-editor ol,
        .quill-wrap-${scopeId} .ql-editor ul {
          padding-left: 1.5em;
          padding-right: 0;
        }
        .quill-wrap-${scopeId} .ql-editor[dir="rtl"] ol,
        .quill-wrap-${scopeId} .ql-editor[dir="rtl"] ul {
          padding-left: 0;
          padding-right: 1.5em;
        }
        .quill-wrap-${scopeId} .ql-editor li {
          padding-left: 0.5em;
          padding-right: 0;
        }
        .quill-wrap-${scopeId} .ql-editor[dir="rtl"] li {
          padding-left: 0;
          padding-right: 0.5em;
        }
        .quill-wrap-${scopeId} .ql-editor li::before {
          text-align: left;
          width: 1.5em;
          margin-left: -1.5em;
          margin-right: 0;
          display: inline-block;
        }
        .quill-wrap-${scopeId} .ql-editor[dir="rtl"] li::before {
          text-align: right;
          margin-left: 0;
          margin-right: -1.5em;
        }
        .quill-wrap-${scopeId} .ql-editor blockquote {
          border-left: 3px solid rgba(110, 231, 183, 0.3);
          border-right: none;
          padding-left: 12px;
          padding-right: 0;
          color: rgba(255, 255, 255, 0.5);
        }
        .quill-wrap-${scopeId} .ql-editor[dir="rtl"] blockquote {
          border-left: none;
          border-right: 3px solid rgba(110, 231, 183, 0.3);
          padding-left: 0;
          padding-right: 12px;
        }
        .quill-wrap-${scopeId} .ql-editor pre.ql-syntax {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
        }
        .quill-wrap-${scopeId} .ql-snow .ql-tooltip {
          background: #1e1f2a;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.7);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .quill-wrap-${scopeId} .ql-snow .ql-tooltip input[type="text"] {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          color: #f0f0f5;
        }
        .quill-wrap-${scopeId} .ql-snow .ql-tooltip a.ql-action::after,
        .quill-wrap-${scopeId} .ql-snow .ql-tooltip a.ql-remove::before {
          color: #6ee7b7;
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker.ql-font .ql-picker-label,
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker.ql-size .ql-picker-label,
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker.ql-header .ql-picker-label {
          color: rgba(255, 255, 255, 0.45);
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker.ql-font .ql-picker-label::before {
          content: 'Font';
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker.ql-size .ql-picker-label::before {
          content: 'Size';
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker.ql-font .ql-picker-item,
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker.ql-size .ql-picker-item {
          color: rgba(255, 255, 255, 0.6);
        }
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker.ql-font .ql-picker-item:hover,
        .quill-wrap-${scopeId} .ql-toolbar .ql-picker.ql-size .ql-picker-item:hover {
          color: #6ee7b7;
        }
        .quill-wrap-${scopeId} .ql-editor .ql-video {
          width: 100%;
          min-height: 200px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 8px;
        }
        .quill-wrap-${scopeId} .ql-editor img {
          cursor: pointer;
        }
        .quill-wrap-${scopeId} .image-resizer {
          border: 1px dashed #6ee7b7;
        }
        .quill-wrap-${scopeId} .image-resizer > span {
          background: #6ee7b7 !important;
          border: none !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
        }
      `}</style>
      <div ref={editorRef} />
    </div>
  );
}
