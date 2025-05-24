import React, { useEffect, useState } from "react";
import "../../../../../styles/HPDOMOverlay.css";

// Detect browser for layout tuning
const getBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "firefox";
  if (ua.includes("Edg")) return "edge";
  if (ua.includes("Chrome")) return "chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "safari";
  return "unknown";
};

const browser = getBrowser();

const HPDOMOverlay = ({ tokens, containerRef, stageRef }) => {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });

  useEffect(() => {
    const stage = stageRef?.current?.getStage?.();
    if (!stage) return;

    let animationFrameId = null;

    const updateTransform = () => {
      if (animationFrameId) return;

      animationFrameId = requestAnimationFrame(() => {
        const scale = stage.scaleX();
        const position = stage.position();

        setTransform((prev) => {
          if (
            prev.scale !== scale ||
            prev.x !== position.x ||
            prev.y !== position.y
          ) {
            return { scale, x: position.x, y: position.y };
          }
          return prev;
        });

        animationFrameId = null;
      });
    };

    stage.on("wheel dragmove dragend scale", updateTransform);

    return () => {
      stage.off("wheel dragmove dragend scale", updateTransform);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [stageRef]);

  if (!tokens || tokens.length === 0) return null;

  const { scale, x: offsetX, y: offsetY } = transform;

  // 🧭 Tune for browser-specific visual differences
  const browserOffsets = {
    firefox: { xOffset: 240, yOffset: 10 },
    edge: { xOffset: 254, yOffset: 20 },
    chrome: { xOffset: 0, yOffset: 23 },
    safari: { xOffset: -2, yOffset: 22 },
    unknown: { xOffset: -2, yOffset: 22 },
  };

  const { xOffset, yOffset } =
    browserOffsets[browser] ?? browserOffsets.unknown;

  return (
    <div className="hp-overlay-container">
      {tokens.map((token) => {
        const { id, x, y, tokenSize = "Medium", currentHP, maxHP } = token;

        if (
          typeof currentHP !== "number" ||
          typeof maxHP !== "number" ||
          maxHP === 0
        ) {
          return null;
        }

        const ratio = Math.max(0, currentHP / maxHP);
        const sizeMap = {
          Tiny: 30,
          Small: 50,
          Medium: 50,
          Large: 100,
          Huge: 140,
          Gargantuan: 180,
        };

        const tokenSizePx = sizeMap[tokenSize] || 50;
        const width = Math.round(
          Math.min(80, Math.max(30, (tokenSizePx / scale) * 1.3))
        );
        const height = Math.round(6 / scale);
        const horizontalOffset = 265;

        const left = Math.round(x * scale + offsetX - width / 2 + xOffset);
        const top = Math.round(y * scale + offsetY - tokenSizePx + yOffset);

        return (
          <div
            key={`hp-${id}`}
            className="hp-bar-wrapper"
            style={{
              top: `${top}px`,
              left: `${left}px`,
              width: `${width}px`,
              height: `${height}px`,
            }}
          >
            <div
              className="hp-bar-fill"
              style={{
                width: `${Math.floor(ratio * 100)}%`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default HPDOMOverlay;
