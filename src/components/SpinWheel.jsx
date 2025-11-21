import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SpinWheel = ({ prizes, onSpin, spinning, disabled, selectedPrize }) => {
  const [rotation, setRotation] = useState(0);
  const [isWaitingForPrize, setIsWaitingForPrize] = useState(false);

  const handleSpin = () => {
    if (spinning || disabled) return;
    onSpin();
  };

  // Start continuous spinning when spinning starts (before API response)
  useEffect(() => {
    if (spinning && !selectedPrize) {
      setIsWaitingForPrize(true);
      // Start with some initial rotation
      const initialRotation = Math.random() * 360;
      setRotation(prevRotation => prevRotation + initialRotation);
      
      // Keep spinning continuously until prize is determined
      const spinInterval = setInterval(() => {
        setRotation(prevRotation => prevRotation + 180 + Math.random() * 180);
      }, 100);

      return () => {
        clearInterval(spinInterval);
      };
    } else if (selectedPrize) {
      // Stop waiting when prize arrives
      setIsWaitingForPrize(false);
    }
  }, [spinning, selectedPrize]);

  // Calculate final rotation to land on selected prize when API response arrives
  useEffect(() => {
    if (spinning && selectedPrize && prizes.length > 0) {
      // Delay to ensure continuous spinning has stopped and state is stable
      // Increased delay to ensure the spinning interval is fully cleared
      const timer = setTimeout(() => {
        // Find the index of the selected prize
        const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id || p.name === selectedPrize.name);
        
        console.log('Prize alignment:', {
          selectedPrizeName: selectedPrize.name,
          selectedPrizeId: selectedPrize.id,
          prizeIndex,
          totalPrizes: prizes.length,
          prizesList: prizes.map((p, i) => ({ index: i, name: p.name, id: p.id }))
        });
        
        if (prizeIndex !== -1) {
          const segmentAngle = 360 / prizes.length;
          
          // Calculate the center angle of the selected prize segment in the wheel's local coordinate
          // Prize 0: center at segmentAngle/2
          // Prize 1: center at segmentAngle + segmentAngle/2
          // Prize i: center at i * segmentAngle + segmentAngle / 2
          const prizeCenterAngleLocal = prizeIndex * segmentAngle + segmentAngle / 2;
          
          // Add multiple full rotations for visual effect (5-10 rotations)
          const fullRotations = (5 + Math.random() * 5) * 360;
          
          
          setRotation(prevRotation => {
            // Get current rotation normalized to 0-360 range
            const currentNormalized = ((prevRotation % 360) + 360) % 360;
        
            
            // Calculate where prize center currently is after current rotation
            const currentPrizeGlobalAngle = (prizeCenterAngleLocal + currentNormalized) % 360;
            
            // To bring it to 0 degrees (top/pointer), we need to rotate by:
            // If it's at X degrees, rotate by (360 - X) to bring it to 0
            let rotationNeeded = (360 - currentPrizeGlobalAngle) % 360;
            
            // Ensure we always have some rotation (at least 360 degrees if already at 0)
            if (rotationNeeded === 0) {
              rotationNeeded = 360;
            }
            
            // Final rotation: current rotation + full rotations + rotation to align with pointer
            const finalRotation = prevRotation + fullRotations + rotationNeeded;
            
            console.log('Rotation calculation:', {
              prizeCenterAngleLocal,
              currentNormalized,
              currentPrizeGlobalAngle,
              rotationNeeded,
              fullRotations,
              finalRotation
            });
            
            return finalRotation;
          });
        } else {
          console.error('Prize not found in prizes array!', {
            selectedPrize,
            availablePrizes: prizes.map(p => ({ id: p.id, name: p.name }))
          });
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [spinning, selectedPrize, prizes]);

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
      {/* Pointer - Yellow triangular pointer at top of wheel (pointing up) */}
      <div className="absolute -top-6 z-30">
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
          duration: isWaitingForPrize ? 0.1 : (spinning && selectedPrize ? 4 : 0),
          ease: isWaitingForPrize ? "linear" : (spinning && selectedPrize ? [0.17, 0.67, 0.12, 0.99] : "linear"),
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

        {/* Prize Labels - Properly positioned inside divisions */}
        {prizes.map((prize, i) => {
          // Calculate the center angle of this segment
          const centerAngle = i * segmentAngle + segmentAngle / 2;
          
          // Position text in the middle area of each segment
          // Using 38% radius to place text well inside the division
          const radiusPercent = 38;
          
          // Calculate position (adjust for CSS coordinate system where 0deg is at top)
          const angleRad = ((centerAngle - 90) * Math.PI) / 180;
          const x = 50 + radiusPercent * Math.cos(angleRad);
          const y = 50 + radiusPercent * Math.sin(angleRad);

          return (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) rotate(${centerAngle}deg)`,
                transformOrigin: "center center",
                width: "110px",
                maxWidth: "110px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "white",
                  textAlign: "center",
                  lineHeight: "1.4",
                  wordBreak: "break-word",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9)",
                  whiteSpace: "normal",
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
