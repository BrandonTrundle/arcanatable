import React, { useEffect, useState } from "react";
import "../../../../../styles/HPDOMOverlay.css";

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

    // 👇 These are the events that actually fire reliably
    stage.on("wheel dragmove dragend scale", updateTransform);

    return () => {
      stage.off("wheel dragmove dragend scale", updateTransform);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [stageRef]);

  //  console.log("🔥 HPDOMOverlay component called");
  //  console.log("🧪 HPDOMOverlay mounted. Tokens length:", tokens?.length);
  //  console.log("📦 tokens:", tokens);

  if (!tokens || tokens.length === 0) return null;

  const { scale, x: offsetX, y: offsetY } = transform;

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
        let color = "green";
        if (ratio <= 0.33) color = "red";
        else if (ratio <= 0.66) color = "yellow";

        const sizeMap = {
          Tiny: 30,
          Small: 50,
          Medium: 50,
          Large: 100,
          Huge: 140,
          Gargantuan: 180,
        };

        const tokenSizePx = sizeMap[tokenSize] || 50;
        const width = Math.min(80, Math.max(30, (tokenSizePx / scale) * 0.9));
        const height = 6 / scale; // keep height small and consistent
        const horizontalOffset = 250;
        const left = x * scale + offsetX - width / 2 + horizontalOffset;
        const top = y * scale + offsetY + tokenSizePx * -1;

        // console.log("🟩 Rendering HP bar:", {
        //   id,
        //   x,
        //    y,
        //    left,
        //    top,
        //    width,
        //    ratio,
        //    color,
        //  });

        return (
          <div
            key={`hp-${id}`}
            className="hp-bar-wrapper"
            style={{
              position: "absolute",
              top: `${top}px`,
              left: `${left}px`,
              width: `${width}px`,
              height: `${height}px`,
              background: "rgba(0,0,0,0.5)",
              borderRadius: "3px",
              overflow: "hidden",
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            <div
              className="hp-bar-fill"
              style={{
                width: `${Math.floor(ratio * 100)}%`,
                height: "100%",
                backgroundColor: color,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default HPDOMOverlay;
