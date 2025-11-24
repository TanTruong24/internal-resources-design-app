"use client";

import { useState } from "react";

interface PromptSectionProps {
    prompt: string;
    onPromptChange: (value: string) => void;
    outputFormat: string;
    usePrompt: boolean;
    onUsePromptChange: (value: boolean) => void;
}

export default function PromptSection({
    prompt,
    onPromptChange,
    outputFormat,
    usePrompt,
    onUsePromptChange,
}: PromptSectionProps) {
    const [showOutputHint, setShowOutputHint] = useState(false);

    return (
        <section style={{ marginBottom: 20 }}>
            {/* Header + toggle */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                    gap: 16,
                }}
            >
                <div>
                    <label
                        style={{
                            display: "block",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#111827",
                        }}
                    >
                        Prompt tùy chỉnh{" "}
                        <span
                            style={{
                                color: "#9ca3af",
                                fontWeight: 400,
                            }}
                        >
                            (không bắt buộc)
                        </span>
                    </label>
                </div>

                {/* Toggle đẹp hơn */}
                <button
                    type="button"
                    onClick={() => onUsePromptChange(!usePrompt)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 12,
                        color: "#374151",
                        padding: 0,
                    }}
                >
                    <div
                        style={{
                            width: 40,
                            height: 22,
                            borderRadius: 999,
                            padding: 2,
                            boxSizing: "border-box",
                            background: usePrompt ? "#2563eb" : "#d1d5db",
                            display: "flex",
                            alignItems: "center",
                            transition: "background 0.15s ease",
                        }}
                    >
                        <div
                            style={{
                                width: 18,
                                height: 18,
                                borderRadius: "999px",
                                background: "#ffffff",
                                boxShadow:
                                    "0 1px 2px rgba(15,23,42,0.25)",
                                transform: usePrompt
                                    ? "translateX(18px)"
                                    : "translateX(0)",
                                transition: "transform 0.15s ease",
                            }}
                        />
                    </div>
                    <span
                        style={{
                            whiteSpace: "nowrap",
                            color: usePrompt ? "#111827" : "#6b7280",
                            fontWeight: 500,
                        }}
                    >
                        {usePrompt ? "Đang gửi prompt" : "Không gửi prompt"}
                    </span>
                </button>
            </div>

            {/* Textarea prompt */}
            <textarea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                placeholder={
                    usePrompt
                        ? "Nhập thêm hướng dẫn cho Gemini (ngôn ngữ, cách đọc bảng, quy tắc xử lý...). Hệ thống sẽ tự động thêm Output Format ở phía sau."
                        : "Tắt công tắc để dùng prompt mặc định của backend. Bật lại nếu bạn muốn gửi prompt tùy chỉnh."
                }
                rows={4}
                disabled={!usePrompt}
                style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    fontSize: 14,
                    outline: "none",
                    resize: "vertical",
                    fontFamily:
                        '"SF Mono", ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    background: usePrompt ? "#ffffff" : "#f3f4f6",
                    color: usePrompt ? "#111827" : "#9ca3af",
                }}
            />

            <p
                style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#6b7280",
                    lineHeight: 1.4,
                }}
            >
                Chỉ khi bật <b>công tắc “Đang gửi prompt”</b> thì nội dung trên
                mới được gửi sang backend. Nếu tắt, backend sẽ dùng prompt mặc
                định (coi như gửi <code>null</code>).
            </p>

            <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}>
                <button
                    type="button"
                    onClick={() => setShowOutputHint((v) => !v)}
                    style={{
                        padding: 0,
                        border: "none",
                        background: "none",
                        color: "#2563eb",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontSize: 12,
                    }}
                >
                    {showOutputHint
                        ? "Ẩn Output Format mặc định"
                        : "Xem Output Format mặc định"}
                </button>
            </div>

            {showOutputHint && (
                <pre
                    style={{
                        marginTop: 8,
                        padding: 10,
                        background: "#f9fafb",
                        borderRadius: 8,
                        fontSize: 11,
                        overflow: "auto",
                        maxHeight: 220,
                    }}
                >
                    {outputFormat}
                </pre>
            )}
        </section>
    );
}
