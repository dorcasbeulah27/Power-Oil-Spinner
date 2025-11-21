import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaTrophy } from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { userAPI, getCurrentPosition } from "../services/api";
import SpinWheel from "../components/SpinWheel";

const SpinWheelPage = () => {
  const navigate = useNavigate();
  const {
    user,
    campaign,
    location,
    coordinates,
    deviceId,
    updateCoordinates,
    updateSpinResult,
  } = useUser();

  const [loading, setLoading] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [checking, setChecking] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [prizes, setPrizes] = useState([]);
  const [eligibilityReason, setEligibilityReason] = useState(null);
  const [noPrizesAvailable, setNoPrizesAvailable] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);

  useEffect(() => {
    if (!user || !user.phoneVerified) {
      // Preserve campaignId when navigating to register
      const campaignId = campaign?.id;
      navigate(campaignId ? `/register?campaignId=${campaignId}` : "/register");
      return;
    }

    if (!campaign) {
      toast.error("No active campaign found");
      navigate("/");
      return;
    }

    checkEligibility();
  }, [user, campaign]);

  useEffect(() => {
    // Fetch available prizes (filtered by max wins limits) when eligible and location is set
    if (eligible && campaign && location) {
      fetchAvailablePrizes();
    }
  }, [eligible, campaign, location]);

  const fetchAvailablePrizes = async () => {
    try {
      const response = await userAPI.getAvailablePrizes({
        campaignId: campaign.id,
        locationId: location.id,
      });

      if (response.data.success) {
        const availablePrizes = response.data.prizes || [];
        setPrizes(availablePrizes);
        setNoPrizesAvailable(availablePrizes.length === 0);
      }
    } catch (error) {
      console.error("Error fetching available prizes:", error);
      setNoPrizesAvailable(true);
      setPrizes([]);
    }
  };

  const checkEligibility = async () => {
    setChecking(true);

    try {
      // Get coordinates - use stored coordinates first, then try GPS, then use location coordinates
      let coords = coordinates;

      if (!coords) {
        // Try to get GPS coordinates
        try {
          coords = await getCurrentPosition();
          updateCoordinates(coords);
        } catch (error) {
          // GPS failed, try using location coordinates if available
          if (location && location.latitude && location.longitude) {
            coords = {
              latitude: parseFloat(location.latitude),
              longitude: parseFloat(location.longitude),
            };
            updateCoordinates(coords);
          } else {
            toast.error(
              "Unable to determine location. Please enable GPS or ensure store location is set."
            );
            setChecking(false);
            setEligible(false);
            return;
          }
        }
      }

      // Ensure we have coordinates before checking eligibility
      if (!coords || !coords.latitude || !coords.longitude) {
        toast.error("Location coordinates are required to check eligibility");
        setChecking(false);
        setEligible(false);
        return;
      }

      // Check eligibility
      const response = await userAPI.checkEligibility({
        userId: user.id,
        campaignId: campaign.id,
        locationId: location.id,
        latitude: coords.latitude,
        longitude: coords.longitude,
        deviceId,
      });

      if (response.data.eligible) {
        setEligible(true);
        setEligibilityReason(null);
        // Prizes will be fetched in the useEffect when eligible becomes true
      } else {
        setEligible(false);
        const reason = response.data.reason || "You are not eligible to spin";
        setEligibilityReason(reason);
        toast.error(reason);
      }
    } catch (error) {
      console.error("Eligibility check error:", error);
      const errorMessage =
        error.response?.data?.reason || error.response?.data?.error || "Failed to check eligibility";
      setEligibilityReason(errorMessage);
      setEligible(false);
      toast.error(errorMessage);
    } finally {
      setChecking(false);
    }
  };

  const handleSpin = async () => {
    if (!eligible || spinning) return;

    setSelectedPrize(null); // Reset selected prize for new spin
    setSpinning(true);
    setLoading(true);

    try {
      // Get current IP address
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();

      // Ensure we have coordinates
      let coords = coordinates;
      if (!coords && location && location.latitude && location.longitude) {
        coords = {
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
        };
      }

      if (!coords) {
        toast.error("Location coordinates are required");
        setSpinning(false);
        setLoading(false);
        return;
      }

      const response = await userAPI.spinWheel({
        userId: user.id,
        campaignId: campaign.id,
        locationId: location.id,
        latitude: coords.latitude,
        longitude: coords.longitude,
        deviceId,
        ipAddress: ipData.ip,
      });

      if (response.data.success) {
        // Get the selected prize from the result
        const resultPrize = response.data.result?.prize;
        if (resultPrize) {
          setSelectedPrize(resultPrize);
        }
        
        // Save result
        updateSpinResult(response.data.result);

        // Wait for animation to complete
        setTimeout(() => {
          navigate("/result");
        }, 4000);
      }
    } catch (error) {
      console.error("Spin error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to spin. Please try again.";
      toast.error(errorMessage);
      setSpinning(false);
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking eligibility...</p>
        </div>
      </div>
    );
  }

  if (!eligible) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center"
        >
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Not Eligible
          </h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-left rounded">
            <p className="text-red-700 font-semibold mb-2">Reason:</p>
            <p className="text-red-600">
              {eligibilityReason || "You are not currently eligible to spin. Please check the requirements and try again."}
            </p>
          </div>
          <button
            onClick={() => {
              // Preserve campaignId when navigating back
              const campaignId = campaign?.id;
              navigate(campaignId ? `/${campaignId}` : "/");
            }}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold rounded-lg hover:shadow-lg transition"
          >
            Go Back Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (noPrizesAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center"
        >
          <div className="text-6xl mb-4">🎰</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Prizes Available
          </h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 text-left rounded">
            <p className="text-yellow-700 font-semibold mb-2">Message:</p>
            <p className="text-yellow-600">
              All prizes have reached their daily or location limits. Please try again later or visit another location.
            </p>
          </div>
          <button
            onClick={() => {
              // Preserve campaignId when navigating back
              const campaignId = campaign?.id;
              navigate(campaignId ? `/${campaignId}` : "/");
            }}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold rounded-lg hover:shadow-lg transition"
          >
            Go Back Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/poweroil.png')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        {/* Power Oil Header */}
        <div className="mb-4">
          <div className="flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-yellow-300 shadow-lg">
              <img
                src="/header-img.png"
                alt="Power Oil"
                className="h-16 md:h-20 object-contain"
              />
            </div>
          </div>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <FaTrophy className="text-yellow-300" />
          Spin to Win!
        </h2>
        <p className="text-xl text-white/90">
          Tap the wheel to spin and win amazing prizes!
        </p>
        <p className="text-white/70 mt-2">
          Location: <span className="font-semibold">{location?.name}</span>
        </p>
      </motion.div>

      {/* Spin Wheel Component */}
      <SpinWheel
        prizes={prizes}
        onSpin={handleSpin}
        spinning={spinning}
        disabled={loading || !eligible}
        selectedPrize={selectedPrize}
      />

      {/* Instructions */}
      {!spinning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-3">
              How to Play:
            </h3>
            <ol className="text-white/90 text-sm space-y-2 text-left list-decimal list-inside">
              <li>Tap on the wheel to spin</li>
              <li>Wait for the wheel to stop</li>
              <li>Claim your prize if you win!</li>
              <li>Follow redemption instructions</li>
            </ol>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SpinWheelPage;
