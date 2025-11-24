"use client";

import { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js";

type Props = {
  file: File;
  onSelectPages: (pages: number[]) => void;
};

export default function PdfPreview({ file, onSelectPages }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // lưu pdf để dùng lại khi zoom
  const pdfRef = useRef<any | null>(null);

  // trạng thái zoom
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [zoomPage, setZoomPage] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.2);
  const [zoomLoading, setZoomLoading] = useState(false);

  useEffect(() => {
    if (!file) return;

    const load = async () => {
      setLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        pdfRef.current = pdf; // <- lưu lại

        const imgs: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.33 });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: ctx,
            canvas,
            viewport,
          }).promise;

          imgs.push(canvas.toDataURL("image/png"));
        }

        setPreviews(imgs);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [file]);

  const toggle = (p: number) => {
    const updated = selectedPages.includes(p)
      ? selectedPages.filter((x) => x !== p)
      : [...selectedPages, p];

    updated.sort((a, b) => a - b);
    setSelectedPages(updated);
    onSelectPages(updated);
  };

  // render lại trang với scale cao để xem rõ
  const openZoom = async (page: number) => {
    if (!pdfRef.current) return;

    setZoomPage(page);
    setZoomLevel(1.2);
    setZoomLoading(true);

    try {
      const pdf = pdfRef.current;
      const pdfPage = await pdf.getPage(page);
      // scale lớn hơn để ảnh sắc nét
      const viewport = pdfPage.getViewport({ scale: 1.8 });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await pdfPage.render({
        canvasContext: ctx,
        canvas,
        viewport,
      }).promise;

      setZoomSrc(canvas.toDataURL("image/png"));
    } finally {
      setZoomLoading(false);
    }
  };

  const closeZoom = () => {
    setZoomSrc(null);
    setZoomPage(null);
    setZoomLevel(1.2);
  };

  const zoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 4));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.5));
  const resetZoom = () => setZoomLevel(1);

  return (
    <div>
      <div
        style={{
          marginBottom: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#111827",
          }}
        >
          Preview trang PDF
        </h3>
        {loading && (
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            Đang tạo ảnh preview…
          </span>
        )}
      </div>

      <div
        style={{
          maxHeight: 420,
          overflowY: "auto",
          paddingRight: 4,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {previews.map((src, i) => {
            const page = i + 1;
            const selected = selectedPages.includes(page);

            return (
              <div
                key={i}
                onClick={() => toggle(page)}
                style={{
                  cursor: "pointer",
                  borderRadius: 12,
                  padding: 8,
                  background: selected ? "#eff6ff" : "#f9fafb",
                  border: selected
                    ? "1px solid #2563eb"
                    : "1px solid #e5e7eb",
                  boxShadow: selected
                    ? "0 10px 25px rgba(37,99,235,0.18)"
                    : "0 4px 12px rgba(15,23,42,0.06)",
                  transition:
                    "transform 0.1s ease, box-shadow 0.1s ease, border-color 0.1s ease, background 0.1s ease",
                  position: "relative",
                }}
              >
                {/* ICON PHÓNG TO */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // không toggle chọn trang
                    openZoom(page);
                  }}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    border: "none",
                    borderRadius: 999,
                    padding: "4px 6px",
                    fontSize: 14,
                    background: "rgba(255,255,255,0.95)",
                    boxShadow:
                      "0 4px 10px rgba(15,23,42,0.15), 0 0 0 1px rgba(148,163,184,0.4)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    zIndex: 2,
                  }}
                  title="Xem lớn"
                >
                  🔍
                </button>

                <div
                  style={{
                    overflow: "hidden",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <img
                    src={src}
                    style={{
                      width: "100%",
                      display: "block",
                      transform: "translateZ(0)",
                    }}
                  />
                </div>
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 13,
                    color: "#374151",
                  }}
                >
                  <span>Trang {page}</span>
                  {selected && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "#2563eb",
                        fontWeight: 600,
                      }}
                    >
                      Đã chọn
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!loading && previews.length === 0 && (
          <div
            style={{
              fontSize: 13,
              color: "#9ca3af",
              textAlign: "center",
              padding: "24px 0",
            }}
          >
            Chọn một file PDF để xem preview.
          </div>
        )}
      </div>

      {/* POPUP ZOOM */}
      {zoomPage && (
        <div
          onClick={closeZoom}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 16,
              maxWidth: "90vw",
              maxHeight: "90vh",
              boxShadow:
                "0 25px 70px rgba(15,23,42,0.55), 0 0 0 1px rgba(148,163,184,0.4)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: "min(900px, 90vw)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Trang {zoomPage}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: "#4b5563",
                }}
              >
                <button
                  type="button"
                  onClick={zoomOut}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 999,
                    padding: "4px 8px",
                    background: "#f9fafb",
                    cursor: "pointer",
                  }}
                >
                  -
                </button>
                <span style={{ minWidth: 52, textAlign: "center" }}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={zoomIn}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 999,
                    padding: "4px 8px",
                    background: "#f9fafb",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  style={{
                    border: "none",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: 11,
                    background: "#e5e7eb",
                    cursor: "pointer",
                  }}
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick={closeZoom}
                  style={{
                    border: "none",
                    borderRadius: 999,
                    padding: "5px 12px",
                    fontSize: 12,
                    background: "#f3f4f6",
                    color: "#374151",
                    cursor: "pointer",
                    marginLeft: 8,
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "stretch",
                minHeight: 0,
              }}
            >
              <div
                style={{
                  flex: 1,
                  overflow: "auto",
                  padding: 8,
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                }}
              >
                {zoomLoading || !zoomSrc ? (
                  <div
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                      textAlign: "center",
                      padding: "40px 0",
                    }}
                  >
                    Đang tải trang…
                  </div>
                ) : (
                  <div
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: "top center",
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={zoomSrc}
                      style={{
                        display: "block",
                        maxWidth: "100%",
                        height: "auto",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
