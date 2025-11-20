import React, { useState } from "react";
import { motion } from "framer-motion";

const SpinWheel = ({ prizes, onSpin, spinning, disabled }) => {
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (spinning || disabled) return;

    // Random 5–10 full rotations + random stop angle
    const fullRotations = (5 + Math.random() * 5) * 360;
    const finalRotation = fullRotations + Math.random() * 360;

    setRotation(rotation + finalRotation);
    onSpin();
  };

  const segmentAngle = prizes.length > 0 ? 360 / prizes.length : 0;

  // Reference image colors: red, yellow, light green, light blue (repeating pattern)
  const referenceColors = [
    "#FF0000", // Red
    "#FFD700", // Yellow
    "#90EE90", // Light Green
    "#87CEEB", // Light Blue
  ];

  // Get color for segment based on index (repeating pattern)
  const getSegmentColor = (index) => {
    if (prizes[index]?.color) {
      return prizes[index].color;
    }
    return referenceColors[index % referenceColors.length];
  };

  // Extract numeric value from prize name for display (like "750", "500", etc.)
  const getPrizeValue = (prize) => {
    // Try to extract number from prize name
    const match = prize.name?.match(/\d+/);
    if (match) {
      return match[0];
    }
    // Fallback to prize name (truncated)
    const name = prize.name || "Prize";
    return name.length > 12 ? name.substring(0, 12) + "..." : name;
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Pointer - Yellow triangular pointer at bottom (upside down) */}
      <div className="absolute -bottom-6 z-30">
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "22px solid transparent",
            borderRight: "22px solid transparent",
            borderTop: "38px solid #FFD700", // Yellow
          }}
        />
      </div>

      {/* WHEEL */}
      <motion.div
        animate={{ rotate: rotation }}
        transition={{
          duration: spinning ? 4 : 0,
          ease: spinning ? [0.17, 0.67, 0.12, 0.99] : "linear",
        }}
        onClick={handleSpin}
        className="relative w-80 h-80 md:w-96 md:h-96 rounded-full overflow-hidden cursor-pointer shadow-2xl"
        style={{
          border: "12px solid #1E3A8A", // Dark blue outer rim
          boxShadow: "0 0 20px rgba(30, 58, 138, 0.5)",
        }}
      >
        {/* White dots on rim (decorative) */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24 - 90; // Start from top
            const radius = 48; // Percentage from center
            const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
            return (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            );
          })}
        </div>

        {/* Wheel background: conic gradient using prize colors */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(${prizes
              .map(
                (p, i) =>
                  `${getSegmentColor(i)} ${i * segmentAngle}deg ${
                    (i + 1) * segmentAngle
                  }deg`
              )
              .join(", ")})`,
          }}
        />

        {/* Prize Labels - Properly positioned and rotated */}
        {prizes.map((prize, i) => {
          const centerAngle = i * segmentAngle + segmentAngle / 2; // ✔ correct center of slice

          const radius = 32; // ✔ ideal balance (works for many slices, adjust 28–35)

          const x = 50 + radius * Math.cos((centerAngle * Math.PI) / 180);
          const y = 50 + radius * Math.sin((centerAngle * Math.PI) / 180);

          return (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) rotate(${centerAngle}deg)`,
                transformOrigin: "center center",
                width: "75px",
              }}
            >
              <div
                style={{
                  transform: "rotate(-25deg)", // ✔ readable tilt
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "white",
                  textAlign: "center",
                  lineHeight: "14px",
                  wordBreak: "break-word",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                }}
              >
                {prize.name}
              </div>
            </div>
          );
        })}

        {/* CENTER BUTTON - White circle with dark blue border */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleSpin();
          }}
          className="absolute top-1/2 left-1/2 z-20 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
          style={{
            width: "80px",
            height: "80px",
            background: "white",
            border: "3px solid #1E3A8A", // Dark blue border
            transform: "translate(-50%, -50%)",
          }}
        >
          <span
            className="font-bold uppercase"
            style={{
              color: "#1E3A8A", // Dark blue text
              fontSize: "14px",
              letterSpacing: "0.5px",
            }}
          >
            {spinning ? "..." : "SPIN"}
          </span>
        </div>
      </motion.div>

      {/* Mobile CTA */}
      {!spinning && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSpin}
          disabled={disabled}
          className={`mt-8 px-8 py-4 rounded-full text-xl font-bold shadow-xl mx-auto block ${
            disabled
              ? "bg-gray-400 text-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 hover:shadow-yellow-400/50"
          }`}
        >
          {disabled ? "Please Wait..." : "TAP TO SPIN!"}
        </motion.button>
      )}

      {spinning && (
        <div className="mt-8 text-center">
          <p className="text-2xl font-bold text-white animate-pulse">
            Spinning...
          </p>
        </div>
      )}
    </div>
  );
};

export default SpinWheel;
