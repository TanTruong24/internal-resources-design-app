import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ResultMarkdown({ markdown }: { markdown: string }) {
  if (!markdown) return null;

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      <div
        style={{
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          background: "#ffffff",
          boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            table: ({ node, ...props }) => (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse", // gộp border để thành lưới
                  fontSize: 13,
                }}
                {...props}
              />
            ),
            thead: ({ node, ...props }) => (
              <thead
                style={{
                  background: "#f3f4f6",
                }}
                {...props}
              />
            ),
            tr: ({ node, ...props }) => (
              <tr
                style={{
                  background: "#ffffff",
                }}
                {...props}
              />
            ),
            th: ({ node, ...props }) => (
              <th
                style={{
                  border: "1px solid #d1d5db", // đường kẻ rõ
                  padding: "10px 12px",          // hàng thoáng hơn
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                  color: "#111827",
                }}
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td
                style={{
                  border: "1px solid #e5e7eb",   // kẻ ô cho cả hàng & cột
                  padding: "10px 12px",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  color: "#111827",
                  lineHeight: 1.4,               // bớt cảm giác dính nhau
                }}
                {...props}
              />
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
