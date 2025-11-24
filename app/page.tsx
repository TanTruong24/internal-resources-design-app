"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Component preview PDF chỉ chạy client
const PdfPreview = dynamic(() => import("../components/PdfPreview"), {
    ssr: false,
});

export default function HomePage() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingTimeMs, setProcessingTimeMs] = useState<number | null>(
        null
    ); // ⏱

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

    const handleSubmit = async () => {
        setError(null);

        if (!file) {
            setError("Bạn chưa chọn file PDF.");
            return;
        }

        if (!pages.trim()) {
            setError("Bạn chưa chọn hoặc nhập trang cần xử lý.");
            return;
        }

        const pagesList = pages
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean);

        if (pagesList.length > 5) {
            setError("Chỉ được chọn tối đa 5 trang!");
            return;
        }

        const start = performance.now(); // bắt đầu đo
        setProcessingTimeMs(null); // reset kết quả cũ
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
            const end = performance.now();
            setProcessingTimeMs(end - start); // lưu thời gian xử lý
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f5f7",
                padding: "40px 16px",
            }}
        >
            <div
                style={{
                    maxWidth: 960,
                    margin: "0 auto",
                    background: "#ffffff",
                    borderRadius: 16,
                    padding: 32,
                    boxShadow:
                        "0 18px 45px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(148, 163, 184, 0.2)",
                }}
            >
                {/* Header */}
                <header style={{ marginBottom: 24 }}>
                    <h1
                        style={{
                            fontSize: 28,
                            fontWeight: 700,
                            marginBottom: 8,
                            letterSpacing: 0.3,
                        }}
                    >
                        Trích xuất nội lực V từ PDF
                    </h1>
                    <p
                        style={{
                            color: "#6b7280",
                            lineHeight: 1.5,
                            maxWidth: 620,
                        }}
                    >
                        Chọn file PDF, xem preview các trang, chọn trực tiếp
                        hoặc nhập số trang cần xử lý. Kết quả sẽ được tải về
                        dưới dạng file CSV.
                    </p>
                </header>

                {/* Hàng điều khiển: trang + upload + nút xử lý */}
                <section
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "minmax(0, 2fr) minmax(0, 1.6fr) auto",
                        gap: 20,
                        alignItems: "end",
                    }}
                >
                    {/* Input pages */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#111827",
                                marginBottom: 6,
                            }}
                        >
                            Trang cần xử lý
                            <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                                {" "}
                                (VD: 1 hoặc 2,3,4)
                            </span>
                        </label>
                        <input
                            value={pages}
                            onChange={(e) => setPages(e.target.value)}
                            placeholder="Nhập số trang, phân tách bằng dấu phẩy…"
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: "1px solid #d1d5db",
                                fontSize: 14,
                                outline: "none",
                                transition:
                                    "border-color 0.15s ease, box-shadow 0.15s ease",
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = "#2563eb";
                                e.currentTarget.style.boxShadow =
                                    "0 0 0 1px rgba(37,99,235,0.12)";
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = "#d1d5db";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        />
                    </div>

                    {/* Upload PDF */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#111827",
                                marginBottom: 6,
                            }}
                        >
                            Chọn file PDF
                        </label>

                        <label
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "9px 14px",
                                borderRadius: 999,
                                border: "1px dashed #d1d5db",
                                fontSize: 13,
                                cursor: "pointer",
                                background: "#f9fafb",
                                color: "#374151",
                                maxWidth: "100%",
                            }}
                        >
                            <span
                                style={{
                                    display: "inline-flex",
                                    width: 18,
                                    height: 18,
                                    borderRadius: "999px",
                                    border: "2px solid #2563eb",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 11,
                                    color: "#2563eb",
                                    flexShrink: 0,
                                }}
                            >
                                +
                            </span>
                            <span
                                style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {file ? (
                                    <>
                                        <strong>{file.name}</strong>{" "}
                                        <span style={{ color: "#9ca3af" }}>
                                            (
                                            {(file.size / 1024 / 1024).toFixed(
                                                2
                                            )}{" "}
                                            MB)
                                        </span>
                                    </>
                                ) : (
                                    "Chọn file từ máy của bạn"
                                )}
                            </span>
                            <input
                                type="file"
                                accept="application/pdf"
                                style={{ display: "none" }}
                                onChange={(e) =>
                                    setFile(e.target.files?.[0] ?? null)
                                }
                            />
                        </label>
                    </div>

                    {/* Nút xử lý */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
                    >
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                padding: "10px 20px",
                                borderRadius: 999,
                                border: "none",
                                fontSize: 14,
                                fontWeight: 500,
                                background: loading ? "#93c5fd" : "#2563eb",
                                color: "#ffffff",
                                cursor: loading ? "default" : "pointer",
                                boxShadow:
                                    "0 10px 25px rgba(37,99,235,0.25), 0 0 0 1px rgba(37,99,235,0.2)",
                                transition:
                                    "transform 0.1s ease, box-shadow 0.1s ease, background 0.1s ease",
                                whiteSpace: "nowrap",
                                minWidth: 96,
                            }}
                            onMouseDown={(e) => {
                                if (loading) return;
                                e.currentTarget.style.transform =
                                    "translateY(1px)";
                                e.currentTarget.style.boxShadow =
                                    "0 4px 12px rgba(37,99,235,0.35)";
                            }}
                            onMouseUp={(e) => {
                                if (loading) return;
                                e.currentTarget.style.transform =
                                    "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                    "0 10px 25px rgba(37,99,235,0.25), 0 0 0 1px rgba(37,99,235,0.2)";
                            }}
                        >
                            {loading ? "Đang xử lý..." : "Xử lý"}
                        </button>
                    </div>
                </section>

                {/* Error */}
                {error && (
                    <div
                        style={{
                            marginTop: 16,
                            padding: "10px 12px",
                            borderRadius: 10,
                            background: "#fef2f2",
                            color: "#b91c1c",
                            fontSize: 13,
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Thời gian xử lý – nằm TRÊN phần preview */}
                {processingTimeMs !== null &&
                    (() => {
                        const totalSeconds = processingTimeMs / 1000;
                        const minutes = Math.floor(totalSeconds / 60);
                        const seconds = (totalSeconds % 60).toFixed(2);

                        return (
                            <div
                                style={{
                                    marginTop: 18,
                                    marginBottom: 4,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "6px 12px",
                                    borderRadius: 999,
                                    background: "#eff6ff",
                                    color: "#1d4ed8",
                                    fontSize: 12,
                                }}
                            >
                                <span>⏱</span>
                                <span>
                                    Thời gian xử lý:{" "}
                                    <strong>
                                        {minutes} phút {seconds} giây
                                    </strong>
                                </span>
                            </div>
                        );
                    })()}

                {/* Preview */}
                {file && (
                    <section style={{ marginTop: 16 }}>
                        <PdfPreview
                            file={file}
                            onSelectPages={(list: number[]) =>
                                setPages(list.join(","))
                            }
                        />
                    </section>
                )}
            </div>
        </div>
    );
}
