"use client";

import { Dispatch, SetStateAction } from "react";

interface ControlBarProps {
    pages: string;
    onPagesChange: (value: string) => void;
    file: File | null;
    onFileChange: Dispatch<SetStateAction<File | null>>;
    loading: boolean;
    onSubmit: () => void;
    hasResult: boolean;
    onOpenResult: () => void;
}

export default function ControlBar({
    pages,
    onPagesChange,
    file,
    onFileChange,
    loading,
    onSubmit,
    hasResult,
    onOpenResult,
}: ControlBarProps) {
    return (
        <section
            style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.6fr) auto",
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
                    onChange={(e) => onPagesChange(e.target.value)}
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
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
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
                        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                    />
                </label>
            </div>

            {/* Nút xử lý + xem kết quả */}
            <style>
                {`
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`}
            </style>

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 8,
                }}
            >
                <button
                    onClick={onSubmit}
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
                        e.currentTarget.style.transform = "translateY(1px)";
                        e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(37,99,235,0.35)";
                    }}
                    onMouseUp={(e) => {
                        if (loading) return;
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                            "0 10px 25px rgba(37,99,235,0.25), 0 0 0 1px rgba(37,99,235,0.2)";
                    }}
                >
                    {loading ? (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                            }}
                        >
                            <div
                                style={{
                                    width: 14,
                                    height: 14,
                                    border: "2px solid #ffffff",
                                    borderTop: "2px solid transparent",
                                    borderRadius: "50%",
                                    animation: "spin 0.8s linear infinite",
                                }}
                            ></div>
                            <span>Đang xử lý...</span>
                        </div>
                    ) : (
                        "Xử lý"
                    )}
                </button>

                <button
                    type="button"
                    disabled={!hasResult}
                    onClick={onOpenResult}
                    style={{
                        padding: "10px 16px",
                        borderRadius: 999,
                        border: "1px solid #d1d5db",
                        fontSize: 14,
                        fontWeight: 500,
                        background: hasResult ? "#ffffff" : "#f3f4f6",
                        color: hasResult ? "#111827" : "#9ca3af",
                        cursor: hasResult ? "pointer" : "not-allowed",
                        whiteSpace: "nowrap",
                    }}
                >
                    Xem kết quả
                </button>
            </div>
        </section>
    );
}
