"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Code,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  label?: string;
  required?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter rich formatted description...",
  minHeight = 180,
  label,
  required = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [internalHtml, setInternalHtml] = useState(value || "");
  const isUpdatingRef = useRef(false);

  // Sync incoming value changes (e.g. form resets or initial fetch)
  useEffect(() => {
    if (!isUpdatingRef.current) {
      setInternalHtml(value || "");
      if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (isSourceMode) return;
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleEditorChange();
  };

  const handleEditorChange = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    // Don't treat single empty <br> as content
    const cleaned = html === "<br>" || html === "<p><br></p>" ? "" : html;
    isUpdatingRef.current = true;
    setInternalHtml(cleaned);
    onChange(cleaned);
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInternalHtml(val);
    onChange(val);
    if (editorRef.current) {
      editorRef.current.innerHTML = val;
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertGreenTick = () => {
    if (isSourceMode) {
      setInternalHtml((prev) => prev + "✅ ");
      onChange(internalHtml + "✅ ");
      return;
    }
    executeCommand("insertHTML", "✅ ");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        const imgTag = `<img src="${data.url}" alt="${file.name}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0;" />`;
        if (isSourceMode) {
          setInternalHtml((prev) => prev + imgTag);
          onChange(internalHtml + imgTag);
        } else {
          executeCommand("insertHTML", imgTag);
        }
      }
    } catch (err) {
      console.error("Editor image upload failed:", err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const insertLink = () => {
    const url = prompt("Enter hyperlink URL (e.g. https://...):");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const applyHeading = (tag: "p" | "h2" | "h3" | "h4") => {
    executeCommand("formatBlock", `<${tag}>`);
  };

  return (
    <div style={{ width: "100%", marginBottom: "14px" }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "#334155",
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
        </label>
      )}

      <div
        style={{
          border: "1px solid #CBD5E1",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "4px",
            padding: "6px 8px",
            backgroundColor: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          {/* Paragraph / Headings */}
          <button
            type="button"
            title="Normal text"
            onClick={() => applyHeading("p")}
            style={toolbarBtnStyle}
          >
            <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>¶ Text</span>
          </button>
          <button
            type="button"
            title="Heading 2"
            onClick={() => applyHeading("h2")}
            style={toolbarBtnStyle}
          >
            <Heading2 size={15} />
          </button>
          <button
            type="button"
            title="Heading 3"
            onClick={() => applyHeading("h3")}
            style={toolbarBtnStyle}
          >
            <Heading3 size={15} />
          </button>

          <span style={dividerStyle} />

          {/* Inline Styles */}
          <button
            type="button"
            title="Bold (Ctrl+B)"
            onClick={() => executeCommand("bold")}
            style={toolbarBtnStyle}
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            title="Italic (Ctrl+I)"
            onClick={() => executeCommand("italic")}
            style={toolbarBtnStyle}
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            title="Underline (Ctrl+U)"
            onClick={() => executeCommand("underline")}
            style={toolbarBtnStyle}
          >
            <Underline size={15} />
          </button>
          <button
            type="button"
            title="Strikethrough"
            onClick={() => executeCommand("strikeThrough")}
            style={toolbarBtnStyle}
          >
            <Strikethrough size={15} />
          </button>

          <span style={dividerStyle} />

          {/* Lists */}
          <button
            type="button"
            title="Bullet list"
            onClick={() => executeCommand("insertUnorderedList")}
            style={toolbarBtnStyle}
          >
            <List size={15} />
          </button>
          <button
            type="button"
            title="Numbered list"
            onClick={() => executeCommand("insertOrderedList")}
            style={toolbarBtnStyle}
          >
            <ListOrdered size={15} />
          </button>
          <button
            type="button"
            title="Quote"
            onClick={() => applyHeading("h4")}
            style={toolbarBtnStyle}
          >
            <Quote size={15} />
          </button>

          <span style={dividerStyle} />

          {/* Alignment */}
          <button
            type="button"
            title="Align left"
            onClick={() => executeCommand("justifyLeft")}
            style={toolbarBtnStyle}
          >
            <AlignLeft size={15} />
          </button>
          <button
            type="button"
            title="Align center"
            onClick={() => executeCommand("justifyCenter")}
            style={toolbarBtnStyle}
          >
            <AlignCenter size={15} />
          </button>
          <button
            type="button"
            title="Align right"
            onClick={() => executeCommand("justifyRight")}
            style={toolbarBtnStyle}
          >
            <AlignRight size={15} />
          </button>

          <span style={dividerStyle} />

          {/* Insert Link & Clean */}
          <button
            type="button"
            title="Insert link"
            onClick={insertLink}
            style={toolbarBtnStyle}
          >
            <LinkIcon size={15} />
          </button>

          {/* Green Tick Button */}
          <button
            type="button"
            title="Insert Green Tick Icon (✅)"
            onClick={insertGreenTick}
            style={{
              ...toolbarBtnStyle,
              backgroundColor: "#ECFDF5",
              color: "#059669",
              border: "1px solid #A7F3D0",
              fontWeight: 700,
              padding: "4px 8px",
              gap: "4px",
            }}
          >
            <CheckCircle2 size={14} style={{ color: "#10B981" }} />
            <span style={{ fontSize: "0.74rem" }}>Tick</span>
          </button>

          {/* Upload Image Button */}
          <button
            type="button"
            title="Upload and insert image"
            onClick={() => fileInputRef.current?.click()}
            style={{
              ...toolbarBtnStyle,
              backgroundColor: "#F1F5F9",
              color: "#334155",
              fontWeight: 600,
              padding: "4px 8px",
              gap: "4px",
            }}
          >
            <ImageIcon size={14} />
            <span style={{ fontSize: "0.74rem" }}>Image</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />

          <button
            type="button"
            title="Remove formatting"
            onClick={() => executeCommand("removeFormat")}
            style={toolbarBtnStyle}
          >
            <RemoveFormatting size={15} />
          </button>

          <span style={{ marginLeft: "auto" }} />

          {/* HTML Source Toggle */}
          <button
            type="button"
            title={isSourceMode ? "Visual Editor Mode" : "View / Edit HTML Source"}
            onClick={() => {
              if (isSourceMode && editorRef.current) {
                editorRef.current.innerHTML = internalHtml;
              }
              setIsSourceMode(!isSourceMode);
            }}
            style={{
              ...toolbarBtnStyle,
              backgroundColor: isSourceMode ? "#0F172A" : "transparent",
              color: isSourceMode ? "#FFFFFF" : "#475569",
              border: isSourceMode ? "1px solid #0F172A" : "1px solid #CBD5E1",
              fontSize: "0.72rem",
              fontWeight: 700,
              gap: "4px",
              padding: "4px 8px",
            }}
          >
            <Code size={14} />
            <span>{isSourceMode ? "Visual" : "HTML Source"}</span>
          </button>
        </div>

        {/* Content Area */}
        {isSourceMode ? (
          <textarea
            value={internalHtml}
            onChange={handleSourceChange}
            placeholder="Type or paste clean HTML..."
            style={{
              width: "100%",
              minHeight: `${minHeight}px`,
              padding: "12px 14px",
              border: "none",
              outline: "none",
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.82rem",
              lineHeight: 1.6,
              color: "#0F172A",
              backgroundColor: "#F8FAFC",
              resize: "vertical",
              display: "block",
            }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorChange}
            onBlur={handleEditorChange}
            style={{
              minHeight: `${minHeight}px`,
              padding: "12px 14px",
              outline: "none",
              fontSize: "0.88rem",
              lineHeight: 1.7,
              color: "#1E293B",
              overflowY: "auto",
            }}
            data-placeholder={placeholder}
          />
        )}
      </div>
      <style jsx>{`
        div[contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          cursor: text;
          pointer-events: none;
        }
        div[contenteditable] h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 14px;
          margin-bottom: 8px;
        }
        div[contenteditable] h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 12px;
          margin-bottom: 6px;
        }
        div[contenteditable] p {
          margin-bottom: 10px;
        }
        div[contenteditable] ul,
        div[contenteditable] ol {
          padding-left: 24px;
          margin-bottom: 10px;
        }
        div[contenteditable] li {
          margin-bottom: 4px;
        }
        div[contenteditable] blockquote {
          border-left: 3px solid #cbd5e1;
          padding-left: 12px;
          color: #64748b;
          margin: 10px 0;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

const toolbarBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  borderRadius: "4px",
  padding: "5px 7px",
  cursor: "pointer",
  color: "#475569",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.15s ease",
};

const dividerStyle: React.CSSProperties = {
  width: "1px",
  height: "16px",
  backgroundColor: "#E2E8F0",
  margin: "0 3px",
};

