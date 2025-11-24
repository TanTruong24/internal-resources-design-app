"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import PromptSection from "../components/PromptSection";
import ControlBar from "../components/ControlBar";
import ResultModal from "../components/ResultModal";

// Component preview PDF chỉ chạy client
const PdfPreview = dynamic(() => import("../components/PdfPreview"), {
    ssr: false,
});

type TableData = {
    headers: string[];
    rows: Record<string, (number | null)[]>;
};

const OUTPUT_FORMAT_BLOCK = `Output Format
Return only the following Markdown table, with each cell filled by either a numeric value or "null".
Do not add explanations or text other than the table.

| Axis | X1 | X2 | X3 | X4 | X5 | X6 | X7 | X8 | X9 | X10 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Y1** | | | | | | | | | | |
| **Y2** | | | | | | | | | | |
| **Y3** | | | | | | | | | | |
| **Y4** | | | | | | | | | | |
| **Y5** | | | | | | | | | | |
| **Y6** | | | | | | | | | | |`;

export default function HomePage() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<string>("");
    const [prompt, setPrompt] = useState<string>("");
    const [usePrompt, setUsePrompt] = useState<boolean>(false); //
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processingTimeMs, setProcessingTimeMs] = useState<number | null>(
        null
    );
    const [resultMarkdown, setResultMarkdown] = useState<string | null>(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [tableData, setTableData] = useState<TableData | null>(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

    const handleSubmit = async () => {
        setError(null);
        setResultMarkdown(null);
        setShowResultModal(false);

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

        if (pagesList.length > 10) {
            setError("Chỉ được chọn tối đa 10 trang!");
            return;
        }

        const start = performance.now();
        setProcessingTimeMs(null);
        setLoading(true);

        try {
            const form = new FormData();
            form.append("file", file);
            form.append("pages", pages);

            // Build final prompt: luôn kèm block Output Format
            // Chỉ gửi prompt nếu user đã bật dấu tích
            if (usePrompt) {
                let finalPrompt: string;

                if (prompt && prompt.trim()) {
                    finalPrompt = `${prompt.trim()}\n\n${OUTPUT_FORMAT_BLOCK}`;
                } else {
                    // Người dùng bật nhưng chưa nhập gì → vẫn gửi riêng block Output Format
                    finalPrompt = OUTPUT_FORMAT_BLOCK;
                }

                form.append("prompt", finalPrompt);
            }

            const res = await fetch(`${API_BASE}/process`, {
                method: "POST",
                body: form,
            });

            if (!res.ok) {
                // cố thử parse json error, nếu fail thì dùng text
                let message = "Đã xảy ra lỗi.";
                const contentType = res.headers.get("content-type") ?? "";
                if (contentType.includes("application/json")) {
                    const errJson = await res.json().catch(() => null);
                    if (errJson?.detail) message = errJson.detail;
                } else {
                    const textErr = await res.text().catch(() => "");
                    if (textErr) message = textErr;
                }
                throw new Error(message);
            }

            // Hỗ trợ cả JSON ({ markdown } | { result }) lẫn text thuần
            const contentType = res.headers.get("content-type") ?? "";
            let markdown = "";
            if (contentType.includes("application/json")) {
                const data: any = await res.json();

                // Trường hợp cũ: backend vẫn trả markdown/result
                const markdown = data.markdown ?? data.result ?? "";

                // Trường hợp mới: backend trả headers + rows
                if (data.headers && data.rows) {
                    setTableData({
                        headers: data.headers,
                        rows: data.rows,
                    });
                } else {
                    // fallback: vẫn xử lý markdown như cũ
                    setResultMarkdown(markdown);
                }
            } else {
                // Trường hợp backend trả text thuần (markdown)
                const markdown = await res.text();
                setResultMarkdown(markdown);
            }

            setResultMarkdown(markdown);
        } catch (err: any) {
            setError(err.message || "Đã xảy ra lỗi.");
        } finally {
            const end = performance.now();
            setProcessingTimeMs(end - start);
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
                        hoặc nhập số trang cần xử lý. Hệ thống sẽ gửi prompt (có
                        thể tùy chỉnh) sang backend, kết quả trả về dạng bảng
                        Markdown và bạn có thể xem trực tiếp trong ứng dụng.
                    </p>
                </header>

                {/* Prompt tùy chỉnh */}
                <PromptSection
                    prompt={prompt}
                    onPromptChange={setPrompt}
                    outputFormat={OUTPUT_FORMAT_BLOCK}
                    usePrompt={usePrompt} //
                    onUsePromptChange={setUsePrompt}
                />

                {/* Hàng điều khiển: trang + upload + nút xử lý */}
                <ControlBar
                    pages={pages}
                    onPagesChange={setPages}
                    file={file}
                    onFileChange={setFile}
                    loading={loading}
                    onSubmit={handleSubmit}
                    hasResult={!!(resultMarkdown || tableData)}
                    onOpenResult={() => setShowResultModal(true)}
                />

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

                {/* Thời gian xử lý */}
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

                {/* Preview PDF */}
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

                {/* Modal kết quả */}
                <ResultModal
                    open={showResultModal && !!(resultMarkdown || tableData)}
                    markdown={resultMarkdown ?? ""}
                    tableData={tableData ?? null}  
                    onClose={() => setShowResultModal(false)}
                />
            </div>
        </div>
    );
}
