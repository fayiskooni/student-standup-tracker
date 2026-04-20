"use client";

import type { Student, PhotoCrop } from "@/types";
import { DEFAULT_CROP } from "@/types";

interface StudentAvatarProps {
  student: Pick<Student, "name" | "photo_url" | "photo_crop">;
  size: number;
  className?: string;
  noRing?: boolean;
}

/**
 * Circular avatar that applies photo_crop transform consistently at any size.
 *
 * Ring technique: outer div has a gradient background + 2px padding.
 * The inner circle sits flush inside, perfectly centred with no alignment math.
 *
 * Coordinate system (matches ImageCropEditor):
 *   stored offsetX/offsetY are NORMALISED fractions (÷ editor size 200px).
 *   We multiply by innerSize to get absolute pixels for the current container.
 */
export default function StudentAvatar({
  student,
  size,
  className = "",
  noRing = false,
}: StudentAvatarProps) {
  const crop: PhotoCrop = student.photo_crop ?? DEFAULT_CROP;
  const { zoom, offsetX, offsetY } = crop;

  // Inner circle diameter: full size when no ring, else leave 2px ring on each side
  const ringWidth = noRing ? 0 : 2;
  const innerSize = size - ringWidth * 2;

  // De-normalise: multiply fraction by this container's inner diameter
  const displayOffsetX = offsetX * innerSize;
  const displayOffsetY = offsetY * innerSize;

  const innerCircle = (
    <div
      style={{
        width: innerSize,
        height: innerSize,
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
        background: "var(--elevated)",
      }}
    >
      {student.photo_url ? (
        // Plain <img> so transform math is straightforward.
        // Anchor at centre, then offset + scale — same formula as ImageCropEditor.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={student.photo_url}
          alt={student.name}
          draggable={false}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `translate(calc(-50% + ${displayOffsetX}px), calc(-50% + ${displayOffsetY}px)) scale(${zoom})`,
            transformOrigin: "center center",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: Math.max(Math.round(size * 0.32), 12),
            fontWeight: 700,
            color: "var(--primary)",
          }}
        >
          {student.name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );

  if (noRing) {
    return (
      <div
        style={{ width: size, height: size, flexShrink: 0, borderRadius: "50%", overflow: "hidden" }}
        className={className}
      >
        {innerCircle}
      </div>
    );
  }

  // Ring: gradient background + padding. The inner circle sits flush inside —
  // no manual offset math needed, browser centres it automatically.
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
        padding: ringWidth,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 1,
      }}
      className={className}
    >
      {innerCircle}
    </div>
  );
}
