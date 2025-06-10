import React, { useEffect, useState } from "react";

// colors para cada cuerpo (ajusta a tu gusto)
const BODY_COLORS = {
  Sol:      "#FFD700",
  Luna:     "#C0C0C0",
  Mercurio: "#8B4513",
  Venus:    "#FF69B4",
  Marte:    "#FF4500",
  Júpiter:  "#FFA500",
  Saturno:  "#708090"
};

export default function TransitAnimation({ positions, size = 300 }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // disparar la animación tras montaje
    setMounted(true);
  }, []);

  const radius = size / 2 - 20; // 20px margen

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
    >
      {/* Círculo guía */}
      <div
        className="absolute inset-0 rounded-full border border-gray-400"
      />

      {positions.map((pos, i) => {
        const angle = pos.longitude; // grados
        // posición en el círculo
        const x = radius * Math.cos((angle - 90) * Math.PI / 180);
        const y = radius * Math.sin((angle - 90) * Math.PI / 180);
        return (
          <div
            key={pos.body}
            className="absolute flex flex-col items-center transition-all duration-2000 ease-out"
            style={{
              left: `calc(50% + ${mounted ? x : 0}px)`,
              top:  `calc(50% + ${mounted ? y : 0}px)`,
              transform: "translate(-50%,-50%)"
            }}
          >
            <div
              style={{
                backgroundColor: BODY_COLORS[pos.body] || "#fff",
                width: 24,
                height: 24,
                borderRadius: "50%"
              }}
            />
            <span className="text-xs mt-1">{pos.body}</span>
          </div>
        );
      })}
    </div>
  );
}