import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaLock, FaRedo } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { userAPI } from "../services/api";

const OTPVerificationPage = () => {
  const navigate = useNavigate();
  const { user, campaign, location, coordinates, deviceId, updateUser } =
    useUser();
  const [searchParams] = useSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!user) {
      // Preserve campaignId when navigating to register
      const campaignId = searchParams.get("campaignId") || campaign?.id;
      navigate(campaignId ? `/register?campaignId=${campaignId}` : "/register");
      return;
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [user, navigate]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData
      .split("")
      .concat(Array(6 - pastedData.length).fill(""));
    setOtp(newOtp);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await userAPI.verifyOTP(user.phoneNumber, otpCode);

      if (response.data.success) {
        toast.success("Phone number verified successfully!");

        // Update user verification status
        const updatedUser = {
          ...user,
          phoneVerified: true,
        };
        updateUser(updatedUser);

        // Check eligibility before navigating to spin
        if (campaign && location && coordinates) {
          try {
            const eligibilityResponse = await userAPI.checkEligibility({
              userId: updatedUser.id,
              campaignId: campaign.id,
              locationId: location.id,
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              deviceId,
            });

            if (eligibilityResponse.data.eligible) {
              navigate("/spin");
            } else {
              toast.error(
                eligibilityResponse.data.reason ||
                  "You are not eligible to spin"
              );
              // Still navigate but the spin page will show the error
              navigate("/spin");
            }
          } catch (error) {
            console.error("Eligibility check error:", error);
            // Navigate anyway, spin page will handle it
            navigate("/spin");
          }
        } else {
          // Navigate to spin page (it will check eligibility)
          navigate("/spin");
        }
      } else {
        toast.error(response.data.message || "Invalid OTP");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      const errorMessage =
        error.response?.data?.message || "Verification failed";
      toast.error(errorMessage);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResending(true);

    try {
      const response = await userAPI.requestOTP(user.phoneNumber);

      if (response.data.success) {
        toast.success("OTP resent successfully!");
        setCountdown(60);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/poweroil.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Header with Power Oil Branding */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="mb-4"
            >
              <div className="flex items-center justify-center mb-3">
                <img
                  src="/header-img.png"
                  alt="Power Oil"
                  className="h-14 md:h-18 object-contain"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 bg-gradient-to-br from-brand-green to-brand-green-dark rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <FaLock className="text-white text-3xl" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Verify Your Phone
            </h2>
            <p className="text-gray-600">
              Enter the 6-digit code sent to
              <br />
              <span className="font-semibold text-gray-800">
                {user?.phoneNumber}
              </span>
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-8">
            <div className="flex justify-center gap-2 md:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-power-yellow focus:ring-2 focus:ring-power-yellow/20 outline-none transition"
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <motion.button
            onClick={handleVerify}
            disabled={loading || otp.some((d) => !d)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all mb-4 ${
              loading || otp.some((d) => !d)
                ? "bg-gray-400 cursor-not-allowed text-gray-600"
                : "bg-gradient-to-r from-brand-green to-brand-green-dark hover:from-brand-green-dark hover:to-brand-green-darker text-white shadow-lg"
            }`}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </motion.button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className={`text-sm font-semibold ${
                countdown > 0 || resending
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-power-blue hover:text-power-blue/80"
              }`}
            >
              <FaRedo className="inline mr-1" />
              {resending
                ? "Resending..."
                : countdown > 0
                ? `Resend in ${countdown}s`
                : "Resend OTP"}
            </button>
          </div>

          {/* Back button */}
          <div className="text-center mt-6">
            <button
              onClick={() => {
                // Preserve campaignId when navigating back
                const campaignId =
                  searchParams.get("campaignId") || campaign?.id;
                navigate(
                  campaignId
                    ? `/register?campaignId=${campaignId}`
                    : "/register"
                );
              }}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Change Phone Number
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerificationPage;
