import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGift, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { useUser } from "../context/UserContext";
import { userAPI } from "../services/api";

const LandingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateCampaign } = useUser();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    // Fetch campaign using the id from URL params, or use stored campaign
    if (id) {
      fetchActiveCampaign(id);
    } else if (campaign) {
      // If no id in URL but we have campaign in context, use it
      setLoading(false);
    } else {
      // Try to fetch without id (fallback)
      fetchActiveCampaign();
    }
  }, [id]);

  const fetchActiveCampaign = async (campaignId = null) => {
    try {
      const response = await userAPI.getActiveCampaign(campaignId || "");
      if (response.data.success) {
        setCampaign(response.data.campaign);
        updateCampaign(response.data.campaign);
      }
    } catch (error) {
      console.error("Error fetching campaign:", error);
      toast.error("No active campaign found. Please check back later!");
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    if (!campaign) {
      toast.error("No active campaign available");
      return;
    }
    // Navigate to register, preserving campaignId in URL if available
    const path = id ? `/register?campaignId=${id}` : "/register";
    navigate(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/poweroil.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-yellow-300 opacity-20"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <FaStar size={60} />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10 text-yellow-300 opacity-20"
          animate={{
            y: [0, 20, 0],
            rotate: [360, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <FaGift size={50} />
        </motion.div>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-4xl"
      >
        {/* Logo/Brand with Power Oil Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border-4 border-yellow-300 shadow-2xl">
              <img
                src="/header-img.png"
                alt="Power Oil"
                className="h-24 md:h-32 object-contain mx-auto"
              />
            </div>
          </div>
          <div className="w-32 h-1 bg-yellow-300 mx-auto rounded-full shadow-lg"></div>
        </motion.div>

        {/* Main heading */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
        >
          Spin the Wheel
          <br />
          <span className="text-yellow-300">Win Amazing Prizes!</span>
        </motion.h2>

        {/* Campaign description */}
        {campaign && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-white mb-8 px-4 leading-relaxed"
          >
            {campaign.description}
          </motion.p>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 px-4"
        >
          <div className="bg-green-500/40 backdrop-blur-md rounded-xl p-6 border border-green-500/40 shadow-md">
            <div className="text-4xl mb-3">🎁</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Exciting Prizes
            </h3>
            <p className="text-white/90 text-sm font-medium">
              Win free products, vouchers, airtime & more!
            </p>
          </div>

          <div className="bg-green-500/40 backdrop-blur-md rounded-xl p-6 border border-green-500/40 shadow-md">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Quick & Easy
            </h3>
            <p className="text-white/80 text-sm">
              Register in seconds and spin to win instantly!
            </p>
          </div>
          <div className="bg-green-500/40 backdrop-blur-md rounded-xl p-6 border border-green-500/40 shadow-md">
            <div className="text-4xl mb-3">🏪</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              In-Store Only
            </h3>
            <p className="text-white/80 text-sm">
              Available at participating Power Oil stores
            </p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 1,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGetStarted}
          disabled={!campaign}
          className={`
            px-12 py-5 rounded-full text-xl font-bold
            shadow-2xl transform transition-all duration-200
            ${
              campaign
                ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-gray-900 hover:shadow-yellow-400/50 hover:scale-105"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }
          `}
        >
          {campaign ? "Spin to Win Now!" : "No Active Campaign"}
        </motion.button>

        {/* Terms link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-white/70 text-sm mt-6"
        >
          By participating, you agree to our Terms & Conditions
        </motion.p>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-4 text-white/50 text-sm"
      >
        © 2024 Power Oil Nigeria. All rights reserved.
      </motion.div>
    </div>
  );
};

export default LandingPage;
