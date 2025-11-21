"use client";

import { useState } from "react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  const handleSubmit = async () => {
    setError(null);

    if (!file) {
      setError("Bạn chưa chọn file PDF.");
      return;
    }

    if (!pages.trim()) {
      setError("Bạn chưa nhập danh sách trang.");
      return;
    }

    const pagesList = pages.split(",").map((p) => p.trim());
    if (pagesList.length > 5) {
      setError("Chỉ được chọn tối đa 5 trang!");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("pages", pages);

      const res = await fetch(`${API_BASE}/process`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "vertical_V.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: 24,
        fontFamily: "sans-serif",
      }}
    >
      <h1>Trích xuất nội lực V từ PDF</h1>
      <p>Upload PDF (~9MB), nhập danh sách trang (tối đa 5), backend sẽ trả về CSV.</p>

      <div style={{ marginTop: 20 }}>
        <label style={{ fontWeight: 600 }}>
          Chọn file PDF:
          <input
            type="file"
            accept="application/pdf"
            style={{ display: "block", marginTop: 8 }}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {file && (
          <div style={{ marginTop: 8, fontSize: 14 }}>
            📄 File: <b>{file.name}</b> ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <label style={{ fontWeight: 600 }}>
          Trang cần xử lý (VD: 1 hoặc 1,3,4):
          <input
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            style={{
              marginTop: 8,
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </label>
      </div>

      {error && (
        <div style={{ color: "red", marginTop: 12 }}>
          ⚠ {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          marginTop: 24,
          padding: "10px 20px",
          borderRadius: 6,
          border: "none",
          background: "#0070f3",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        {loading ? "Đang xử lý..." : "Gửi lên backend"}
      </button>
    </div>
  );
}
