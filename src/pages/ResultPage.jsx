import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import {
  FaTrophy,
  FaShare,
  FaTwitter,
  FaFacebook,
  FaWhatsapp,
} from "react-icons/fa";
import { useUser } from "../context/UserContext";

const ResultPage = () => {
  const navigate = useNavigate();
  const { spinResult, user, campaign } = useUser();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!spinResult || !user) {
      // Preserve campaignId when navigating back
      const campaignId = campaign?.id;
      navigate(campaignId ? `/${campaignId}` : "/");
      return;
    }

    if (spinResult.isWin) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }

    // Update window size for confetti
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [spinResult, user, navigate]);

  if (!spinResult) return null;

  const isWin = spinResult.isWin;
  const prize = spinResult.prize;

  const shareText = isWin
    ? `I just won ${prize.name} on Power Oil Spin the Wheel!Try your luck too!`
    : `I just played Power Oil Spin the Wheel! Try your luck and win amazing prizes!`;

  const handleShare = (platform) => {
    const url = window.location.origin;
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareText
        )}&url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(
          shareText + " " + url
        )}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  const handleContinue = () => {
    navigate("/thank-you");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/poweroil.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 relative">
          {/* Power Oil Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center mb-4">
              <img
                src="/header-img.png"
                alt="Power Oil"
                className="h-16 md:h-20 object-contain"
              />
            </div>
          </motion.div>

          {/* Win/Lose Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center shadow-2xl ${
              isWin
                ? "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 border-4 border-yellow-300"
                : "bg-gradient-to-br from-gray-400 to-gray-600 border-4 border-gray-300"
            }`}
          >
            {isWin ? (
              <FaTrophy className="text-white text-6xl drop-shadow-lg" />
            ) : (
              <span className="text-6xl">😔</span>
            )}
          </motion.div>

          {/* Result Message */}
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-4xl md:text-5xl font-bold mb-4 ${
                isWin ? "text-brand-green" : "text-gray-700"
              }`}
            >
              {isWin ? "🎉 Congratulations! 🎉" : "Better Luck Next Time!"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-700 mb-4"
            >
              {isWin ? `You won: ${prize.name}` : "Try Again Next Time"}
            </motion.p>

            {prize.description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600"
              >
                {prize.description}
              </motion.p>
            )}

            {!isWin && campaign && campaign.spinCooldownDays && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded"
              >
                <p className="text-blue-700 font-semibold">
                  You can spin again in {campaign.spinCooldownDays} {campaign.spinCooldownDays === 1 ? 'day' : 'days'}!
                </p>
              </motion.div>
            )}
          </div>

          {/* Prize Details */}
          {isWin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 mb-6"
            >
              <h3 className="font-bold text-lg text-gray-800 mb-3">
                Redemption Details:
              </h3>

              {spinResult.redemptionCode && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Your Redemption Code:
                  </p>
                  <div className="bg-gradient-to-r from-brand-green to-brand-green-dark rounded-lg p-4 font-mono text-2xl font-bold text-center text-white border-4 border-yellow-300 shadow-lg">
                    {spinResult.redemptionCode}
                  </div>
                  <p className="text-xs text-gray-600 mt-2 font-medium">
                    📸 Screenshot this code for redemption
                  </p>
                </div>
              )}

              {prize.redemptionInstructions && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {prize.redemptionInstructions}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-6"
          >
            <p className="text-center text-gray-700 font-semibold mb-3 flex items-center justify-center gap-2">
              <FaShare /> Share Your {isWin ? "Win" : "Experience"}:
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleShare("facebook")}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg"
                aria-label="Share on Facebook"
              >
                <FaFacebook size={24} />
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition shadow-lg"
                aria-label="Share on Twitter"
              >
                <FaTwitter size={24} />
              </button>
              <button
                onClick={() => handleShare("whatsapp")}
                className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition shadow-lg"
                aria-label="Share on WhatsApp"
              >
                <FaWhatsapp size={24} />
              </button>
            </div>
          </motion.div>

          {/* Continue Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="w-full py-4 bg-gradient-to-r from-brand-green to-brand-green-dark text-white font-bold text-lg rounded-lg hover:shadow-lg transition"
          >
            Continue
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultPage;
