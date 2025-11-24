"use client";

import ResultMarkdown from "./ResultMarkdown";

interface TableData {
    headers: string[];
    rows: Record<string, (number | null)[]>;
}

interface ResultModalProps {
    open: boolean;
    markdown?: string;
    tableData?: TableData | null;
    onClose: () => void;
}

function ResultTable({ headers, rows }: TableData) {
    const rowEntries = Object.entries(rows);

    return (
        <div
            style={{
                width: "100%",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            }}
        >
            <div
                style={{
                    maxHeight: 420,
                    overflow: "auto",
                }}
            >
                <table
                    style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        fontSize: 13,
                        tableLayout: "fixed",
                    }}
                >
                    <thead
                        style={{
                            background: "#f3f4f6",
                            position: "sticky",
                            top: 0,
                            zIndex: 1,
                        }}
                    >
                        <tr>
                            <th
                                style={{
                                    padding: "8px 10px",
                                    borderBottom: "1px solid #d1d5db",
                                    textAlign: "left",
                                    fontWeight: 600,
                                    color: "#111827",
                                    minWidth: 80,
                                    background: "#f3f4f6",
                                }}
                            >
                                Axis
                            </th>
                            {headers.map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        padding: "8px 10px",
                                        borderBottom: "1px solid #d1d5db",
                                        textAlign: "center",
                                        fontWeight: 600,
                                        color: "#111827",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rowEntries.map(([axis, values], idx) => (
                            <tr
                                key={axis}
                                style={{
                                    background:
                                        idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                                    transition: "background 0.1s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                        "#e5f0ff";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                        idx % 2 === 0 ? "#ffffff" : "#f9fafb";
                                }}
                            >
                                {/* Cột tên Y1, Y2... */}
                                <td
                                    style={{
                                        padding: "8px 10px",
                                        borderBottom: "1px solid #e5e7eb",
                                        fontWeight: 600,
                                        color: "#111827",
                                        textAlign: "left",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {axis}
                                </td>

                                {/* Giá trị từng cột */}
                                {headers.map((_, colIdx) => {
                                    const value = values[colIdx];
                                    return (
                                        <td
                                            key={colIdx}
                                            style={{
                                                padding: "8px 10px",
                                                borderBottom:
                                                    "1px solid #e5e7eb",
                                                textAlign: "right",
                                                whiteSpace: "nowrap",
                                                color: "#111827",
                                                fontVariantNumeric:
                                                    "tabular-nums",
                                            }}
                                        >
                                            {value === null ||
                                            typeof value === "undefined"
                                                ? ""
                                                : value}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function ResultModal({
    open,
    markdown,
    tableData,
    onClose,
}: ResultModalProps) {
    if (!open) return null;

    const hasTable = !!tableData && !!tableData.headers?.length;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
            }}
        >
            <div
                style={{
                    width: "90%",
                    maxWidth: 900,
                    maxHeight: "80vh",
                    background: "#ffffff",
                    borderRadius: 16,
                    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.3)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        padding: "14px 18px",
                        borderBottom: "1px solid #e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                fontSize: 16,
                                fontWeight: 600,
                                margin: 0,
                            }}
                        >
                            Kết quả bảng
                        </h2>
                        <p
                            style={{
                                margin: 0,
                                marginTop: 4,
                                fontSize: 12,
                                color: "#6b7280",
                            }}
                        >
                            Dữ liệu được hiển thị dạng bảng tối giản, hiện đại
                            giống Excel. Bạn có thể copy hoặc export sang CSV.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            border: "none",
                            padding: "6px 10px",
                            fontSize: 13,
                            borderRadius: 999,
                            background: "#f3f4f6",
                            cursor: "pointer",
                            color: "#111827",
                        }}
                    >
                        Đóng
                    </button>
                </div>
                <div
                    style={{
                        padding: 18,
                        overflow: "auto",
                        background: "#f9fafb",
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                    }}
                >
                    {hasTable ? (
                        <ResultTable
                            headers={tableData!.headers}
                            rows={tableData!.rows}
                        />
                    ) : (
                        markdown && <ResultMarkdown markdown={markdown} />
                    )}
                </div>
            </div>
        </div>
    );
}
