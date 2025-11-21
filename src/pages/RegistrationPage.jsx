import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaStore,
  FaLocationArrow,
  FaInfoCircle,
} from "react-icons/fa";
import { useUser } from "../context/UserContext";
import { userAPI, getCurrentPosition } from "../services/api";

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const {
    updateUser,
    updateLocation,
    updateCoordinates,
    updateCampaign,
    deviceId,
    campaign,
  } = useUser();

  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [selectedStoreLocation, setSelectedStoreLocation] = useState("");
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);

  useEffect(() => {
    // Check for campaignId in URL params
    const campaignIdFromUrl = searchParams.get("campaignId");

    if (!campaign) {
      if (campaignIdFromUrl) {
        fetchActiveCampaign(campaignIdFromUrl);
      } else {
        fetchActiveCampaign();
      }
    }
    getUserLocation();
  }, [searchParams]);

  const fetchActiveCampaign = async (campaignId = null) => {
    try {
      const response = await userAPI.getActiveCampaign(campaignId || "");
      if (response.data.success) {
        updateCampaign(response.data.campaign);
      }
    } catch (error) {
      console.error("Error fetching campaign:", error);
      toast.error("Failed to load campaign. Please go back and try again.");
    }
  };

  const getUserLocation = async () => {
    try {
      const coords = await getCurrentPosition();
      setUserCoords(coords);
      updateCoordinates(coords);
      setLocationPermissionDenied(false);
      // Fetch locations immediately with GPS coordinates
      fetchLocationsWithCoords(coords);
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationPermissionDenied(true);
      toast.error("Location access is required. Please enable GPS to continue.");
    }
  };

  const fetchLocationsWithCoords = async (coords) => {
    setLocationLoading(true);
    try {
      // Fetch by coordinates only
      const params = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      // Add campaignId if available to filter by campaign-mapped locations
      if (campaign?.id) {
        params.campaignId = campaign.id;
      }

      const response = await userAPI.getLocations(params);
      if (response.data.success) {
        const fetchedLocations = response.data.locations || [];
        setLocations(fetchedLocations);
        
        // Auto-select the first location (nearest one, sorted by distance)
        // Works for both single and multiple items in the array
        if (fetchedLocations.length > 0) {
          setValue("storeOutlet", String(fetchedLocations[0].id), {
            shouldValidate: true,
          });
          setSelectedStoreLocation(String(fetchedLocations[0].id));
        }
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleRetryLocation = async () => {
    setLocationLoading(true);
    try {
      const coords = await getCurrentPosition();
      setUserCoords(coords);
      updateCoordinates(coords);
      setLocationPermissionDenied(false);
      toast.success("Location detected successfully!");
      await fetchLocationsWithCoords(coords);
    } catch (error) {
      console.error("Error getting location:", error);
      toast.error("Unable to access location. Please enable GPS permissions.");
      setLocationPermissionDenied(true);
    } finally {
      setLocationLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!campaign) {
      toast.error("No active campaign found");
      return;
    }

    // Ensure we have a selected store
    if (!data.storeOutlet) {
      toast.error("Please select a store/outlet");
      return;
    }

    setLoading(true);

    try {
      // Get selected location to extract coordinates if GPS is not available
      const selectedLocation = locations.find(
        (loc) => String(loc.id) === data.storeOutlet
      );

      if (!selectedLocation) {
        toast.error("Selected location not found");
        setLoading(false);
        return;
      }

      // Ensure we have GPS coordinates
      if (!userCoords) {
        toast.error("Location access is required. Please enable GPS to continue.");
        setLoading(false);
        return;
      }

      const finalCoords = userCoords;

      const registrationData = {
        ...data,
        consentGiven: true,
        deviceId,
        latitude: finalCoords.latitude,
        longitude: finalCoords.longitude,
        ipAddress: await fetch("https://api.ipify.org?format=json")
          .then((res) => res.json())
          .then((data) => data.ip)
          .catch(() => "unknown"),
      };

      const response = await userAPI.register(registrationData);

      if (response.data.success) {
        toast.success("Registration successful!");

        const newUser = {
          id: response.data.userId,
          ...response.data.user,
        };
        updateUser(newUser);

        updateLocation(selectedLocation);
        // Ensure coordinates are stored
        updateCoordinates(finalCoords);

        // Call eligibility check after registration
        try {
          const eligibilityResponse = await userAPI.checkEligibility({
            userId: newUser.id,
            campaignId: campaign.id,
            locationId: selectedLocation.id,
            latitude: finalCoords.latitude,
            longitude: finalCoords.longitude,
            deviceId,
          });

          if (!eligibilityResponse.data.eligible) {
            toast.warning(
              eligibilityResponse.data.reason ||
                "You may not be eligible to spin. Please continue to verify your phone number."
            );
          }
        } catch (error) {
          console.error("Eligibility check error:", error);
          // Continue to OTP even if eligibility check fails
        }

        // Send OTP and navigate to verification
        await userAPI.requestOTP(data.phoneNumber);
        toast.info("OTP sent to your phone number");

        navigate("/verify");
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.error || "Registration failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
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
                  className="h-16 md:h-20 object-contain"
                />
              </div>
            </motion.div>
            <motion.h2
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-3xl md:text-4xl font-bold text-gray-800 mb-2"
            >
              Register to <span className="text-power-yellow">Spin & Win!</span>
            </motion.h2>
            <p className="text-gray-600">Fill in your details to get started</p>
          </div>

          {/* Location Status */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaLocationArrow className="text-brand-green" />
                <span className="font-semibold text-gray-700">
                  Location Status
                </span>
              </div>
              {userCoords && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>

            {userCoords ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Using your current location to find nearest store
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <FaInfoCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Location access is required to continue. Please enable GPS permissions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRetryLocation}
                  disabled={locationLoading}
                  className="w-full mt-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {locationLoading ? "Detecting Location..." : "Enable Location Access"}
                </button>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaUser className="inline mr-2 text-brand-green" />
                Full Name *
              </label>
              <input
                type="text"
                {...register("fullName", { required: "Full name is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition"
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaPhone className="inline mr-2 text-power-yellow" />
                Phone Number *
              </label>
              <input
                type="tel"
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  // pattern: {
                  //   value: /^[0-9]{11}$/,
                  //   message: "Please enter a valid 11-digit phone number",
                  // },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-power-yellow focus:border-transparent outline-none transition"
                placeholder="08012345678"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaEnvelope className="inline mr-2 text-gray-500" />
                Email Address (Optional)
              </label>
              <input
                type="email"
                {...register("email", {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-power-yellow focus:border-transparent outline-none transition"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender *
              </label>
              <select
                {...register("gender", { required: "Gender is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-power-yellow focus:border-transparent outline-none transition bg-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.gender.message}
                </p>
              )}
            </div>

            {/* Store/Outlet */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaStore className="inline mr-2 text-blue-600" />
                Nearest Store/Outlet *
              </label>
              <select
                {...register("storeOutlet", {
                  required: "Store selection is required",
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-power-yellow focus:border-transparent outline-none transition bg-white"
                disabled={locationLoading || !userCoords || locations.length === 0}
              >
                <option value="">
                  {!userCoords
                    ? "Enable location access first"
                    : locationLoading
                    ? "Loading nearest location..."
                    : locations.length === 0
                    ? "No locations available nearby"
                    : locations.length === 1
                    ? "Nearest Store (Auto-selected)"
                    : "Select Nearest Store"}
                </option>
                {locations.map((location) => (
                  <option key={location.id} value={String(location.id)}>
                    {location.name} - {location.city}
                    {location.distance &&
                      ` (${(location.distance / 1000).toFixed(1)}km away)`}
                  </option>
                ))}
              </select>
              {errors.storeOutlet && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.storeOutlet.message}
                </p>
              )}
              {locations.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {locations.length} store(s) found
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start bg-gray-50 p-4 rounded-lg">
              <input
                type="checkbox"
                {...register("consent", {
                  required: "You must agree to continue",
                })}
                className="mt-1 mr-3 h-5 w-5 text-power-yellow focus:ring-power-yellow border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-power-blue hover:underline font-medium"
                >
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-power-blue hover:underline font-medium"
                >
                  Privacy Policy
                </a>
                . I consent to Power Oil collecting and processing my data for
                this promotion.
              </label>
            </div>
            {errors.consent && (
              <p className="text-red-500 text-sm">{errors.consent.message}</p>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-brand-green to-brand-green-dark hover:from-brand-green-dark hover:to-brand-green-darker text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Registering...
                </span>
              ) : (
                "Continue to Verification"
              )}
            </motion.button>
          </form>

          {/* Back button */}
          <div className="text-center mt-6">
            <button
              onClick={() => {
                const campaignId = searchParams.get("campaignId");
                navigate(campaignId ? `/${campaignId}` : "/");
              }}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationPage;
