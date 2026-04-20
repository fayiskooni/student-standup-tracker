"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { PhotoCrop } from "@/types";
import { ZoomIn, Move } from "lucide-react";

interface ImageCropEditorProps {
  src: string;
  crop: PhotoCrop;
  onChange: (crop: PhotoCrop) => void;
  /** Diameter of the circular preview in px — default 200 */
  size?: number;
}

/**
 * Circular crop editor.
 *
 * COORDINATE SYSTEM
 * ─────────────────
 * Internal drag state uses RAW PIXELS relative to `size` (200px by default).
 * On emit, offsets are NORMALISED by dividing by `size`, so the stored value
 * is a unit-less fraction (e.g. 0.1 = "10% of the editor diameter").
 * StudentAvatar then multiplies that fraction by its own container diameter to
 * get the correct absolute-pixel shift at any display size.
 */
export default function ImageCropEditor({
  src,
  crop,
  onChange,
  size = 200,
}: ImageCropEditorProps) {
  // Internal state: absolute pixels (smooth dragging)
  const rawX = useRef(crop.offsetX * size);
  const rawY = useRef(crop.offsetY * size);
  const zoomRef = useRef(crop.zoom);

  // Reactive display values derived from refs
  const [display, setDisplay] = useState({
    rawX: rawX.current,
    rawY: rawY.current,
    zoom: zoomRef.current,
  });

  // Sync when parent resets crop (e.g. opening a different student)
  useEffect(() => {
    rawX.current = crop.offsetX * size;
    rawY.current = crop.offsetY * size;
    zoomRef.current = crop.zoom;
    setDisplay({ rawX: rawX.current, rawY: rawY.current, zoom: zoomRef.current });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop.offsetX, crop.offsetY, crop.zoom]);

  const emitNormalised = useCallback(
    (rx: number, ry: number, z: number) => {
      onChange({ zoom: z, offsetX: rx / size, offsetY: ry / size });
    },
    [onChange, size]
  );

  /* ── Drag ─────────────────────────────────────────────── */
  const isDragging = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    isDragging.current = true;
    lastPos.current = { x: clientX, y: clientY };
  }, []);

  const moveDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging.current || !lastPos.current) return;
      const dx = clientX - lastPos.current.x;
      const dy = clientY - lastPos.current.y;
      lastPos.current = { x: clientX, y: clientY };
      rawX.current += dx;
      rawY.current += dy;
      setDisplay((d) => ({ ...d, rawX: rawX.current, rawY: rawY.current }));
      emitNormalised(rawX.current, rawY.current, zoomRef.current);
    },
    [emitNormalised]
  );

  const endDrag = useCallback(() => {
    isDragging.current = false;
    lastPos.current = null;
  }, []);

  // Global mouse listeners
  useEffect(() => {
    const onMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onUp = () => endDrag();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [moveDrag, endDrag]);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    moveDrag(t.clientX, t.clientY);
  };

  /* ── Zoom ─────────────────────────────────────────────── */
  const handleZoom = useCallback(
    (z: number) => {
      zoomRef.current = z;
      setDisplay((d) => ({ ...d, zoom: z }));
      emitNormalised(rawX.current, rawY.current, z);
    },
    [emitNormalised]
  );

  /* ── Reset ────────────────────────────────────────────── */
  const reset = useCallback(() => {
    rawX.current = 0;
    rawY.current = 0;
    zoomRef.current = 1;
    setDisplay({ rawX: 0, rawY: 0, zoom: 1 });
    onChange({ zoom: 1, offsetX: 0, offsetY: 0 });
  }, [onChange]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular preview */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={endDrag}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "hidden",
          position: "relative",
          cursor: "grab",
          flexShrink: 0,
          boxShadow: "0 0 0 3px #7c3aed, 0 0 0 5px rgba(124,58,237,0.25)",
          background: "#0f0f1a",
          userSelect: "none",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Crop preview"
          draggable={false}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            // same formula as StudentAvatar — keeps editor & display in sync
            transform: `translate(calc(-50% + ${display.rawX}px), calc(-50% + ${display.rawY}px)) scale(${display.zoom})`,
            transformOrigin: "center center",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      </div>

      {/* Hint */}
      <p className="flex items-center gap-1.5 text-xs text-mentrex-text-secondary">
        <Move className="h-3 w-3" />
        Drag to reposition
      </p>

      {/* Zoom slider */}
      <div className="w-full px-2">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-medium text-mentrex-text-secondary">
            <ZoomIn className="h-3.5 w-3.5" />
            Zoom
          </label>
          <span className="text-xs font-semibold text-mentrex-primary">
            {display.zoom.toFixed(2)}×
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={2.5}
          step={0.01}
          value={display.zoom}
          onChange={(e) => handleZoom(parseFloat(e.target.value))}
          className="crop-zoom-slider w-full"
        />
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={reset}
        className="text-xs text-mentrex-text-secondary underline underline-offset-2 hover:text-white transition-colors"
      >
        Reset crop
      </button>
    </div>
  );
}
