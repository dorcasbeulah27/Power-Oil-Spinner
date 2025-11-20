import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHeart,
  FaHome,
  FaFacebook,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";
import { useUser } from "../context/UserContext";

const ThankYouPage = () => {
  const navigate = useNavigate();
  const { user, campaign, clearUserData } = useUser();

  useEffect(() => {
    if (!user) {
      // Preserve campaignId when navigating back
      const campaignId = campaign?.id;
      navigate(campaignId ? `/${campaignId}` : "/");
    }
  }, [user, navigate, campaign]);

  const handleGoHome = () => {
    // Preserve campaignId before clearing data
    const campaignId = campaign?.id;
    clearUserData();
    navigate(campaignId ? `/${campaignId}` : "/");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/poweroil.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Power Oil Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-center mb-4">
              <img
                src="/header-img.png"
                alt="Power Oil"
                className="h-16 md:h-20 object-contain"
              />
            </div>
          </motion.div>

          {/* Thank You Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-brand-green to-brand-green-dark rounded-full flex items-center justify-center border-4 border-yellow-300 shadow-2xl"
          >
            <FaHeart className="text-white text-6xl" />
          </motion.div>

          {/* Thank You Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Thank You!
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Thank you for participating in Power Oil's Spin the Wheel
              promotion!
            </p>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 mb-8"
          >
            <p className="text-gray-700 mb-4">
              We appreciate your participation. Stay tuned for more exciting
              promotions and offers from Power Oil!
            </p>
            <div className="text-sm text-gray-600">
              <p>✨ Follow us on social media for updates</p>
              <p>🎁 Look out for future campaigns</p>
              <p>🛒 Find Power Oil at your nearest store</p>
            </div>
          </motion.div>

          {/* Social Media Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <p className="text-gray-700 font-semibold mb-4">Connect with us:</p>
            <div className="flex justify-center gap-4">
              <a
                href="https://facebook.com/poweroilnigeria"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg"
                aria-label="Facebook"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://twitter.com/poweroilnigeria"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition shadow-lg"
                aria-label="Twitter"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="https://instagram.com/poweroilnigeria"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
            </div>
          </motion.div>

          {/* Home Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoHome}
            className="px-8 py-4 bg-gradient-to-r from-brand-green to-brand-green-dark text-white font-bold text-lg rounded-lg hover:shadow-lg transition inline-flex items-center gap-2"
          >
            <FaHome /> Return to Home
          </motion.button>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 pt-6 border-t border-gray-200"
          >
            <p className="text-sm text-gray-500">
              © 2024 Power Oil Nigeria. All rights reserved.
            </p>
            <div className="mt-2 space-x-4 text-xs">
              <a href="#" className="text-gray-500 hover:text-gray-700">
                Terms & Conditions
              </a>
              <span className="text-gray-400">|</span>
              <a href="#" className="text-gray-500 hover:text-gray-700">
                Privacy Policy
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ThankYouPage;
