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
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h1>Trích xuất nội lực V từ PDF</h1>

      <div style={{ marginTop: 20 }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <input
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder="VD: 1 hoặc 1,3,5"
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: 20 }}
      >
        {loading ? "Đang xử lý..." : "Gửi lên backend"}
      </button>
    </div>
  );
}
