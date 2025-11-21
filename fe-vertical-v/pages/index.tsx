import { useState } from "react";

const HomePage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<string>("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE;

  const handleSubmit = async () => {
    setError(null);

    if (!file) {
      setError("Vui lòng chọn file PDF.");
      return;
    }

    if (!pages.trim()) {
      setError("Vui lòng nhập danh sách trang, ví dụ: 1,2,3.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("pages", pages);

      const res = await fetch(`${apiBase}/process`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Lỗi khi gọi API");
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
    } catch (e: any) {
      setError(e.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "24px", maxWidth: 600, margin: "0 auto" }}>
      <h1>Trích xuất nội lực V từ PDF</h1>
      <p>Upload PDF (≈9MB), nhập danh sách trang (tối đa 5), BE sẽ trả CSV.</p>

      <div style={{ marginTop: 16 }}>
        <label>
          File PDF:
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setFile(f);
            }}
          />
        </label>
      </div>

      <div style={{ marginTop: 16 }}>
        <label>
          Trang cần xử lý (ví dụ: <code>1,2,3</code> – tối đa 5):
          <input
            type="text"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: 16 }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: 24, padding: "8px 16px" }}
      >
        {loading ? "Đang xử lý..." : "Gửi lên BE xử lý"}
      </button>
    </main>
  );
};

export default HomePage;
