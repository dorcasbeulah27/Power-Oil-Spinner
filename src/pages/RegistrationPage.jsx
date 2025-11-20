import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
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
    watch,
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
  const [locationMethod, setLocationMethod] = useState("auto"); // 'auto' or 'manual'
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);

  const selectedState = watch("state");
  const selectedCity = watch("city");

  const nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
    "FCT",
  ];
  console.log(campaign, "andjiags");

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

  useEffect(() => {
    // Fetch locations when state or city changes in manual mode
    if (locationMethod === "manual" && selectedState && selectedCity) {
      fetchLocations();
    }
  }, [selectedState, selectedCity, locationMethod]);

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
      setLocationMethod("auto");
      setLocationPermissionDenied(false);
      // Fetch locations immediately with auto location
      fetchLocationsWithCoords(coords);
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationPermissionDenied(true);
      setLocationMethod("manual");
      toast.info("Please enter your state and city to find nearby stores");
    }
  };

  const fetchLocationsWithCoords = async (coords) => {
    setLocationLoading(true);
    try {
      // When using GPS, fetch by coordinates only (no state/city filter)
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
        setLocations(response.data.locations);
        if (response.data.locations.length === 1) {
          setValue("storeOutlet", String(response.data.locations[0].id), {
            shouldValidate: true,
          });
          setSelectedStoreLocation(String(response.data.locations[0].id));
        }
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchLocations = async () => {
    if (locationMethod === "manual" && (!selectedState || !selectedCity)) {
      return;
    }

    setLocationLoading(true);
    try {
      const params = {
        state: selectedState,
        city: selectedCity,
      };

      // Add campaignId if available to filter by campaign-mapped locations
      if (campaign?.id) {
        params.campaignId = campaign.id;
      }

      // Only include coordinates if location is enabled (auto mode)
      // In manual mode, we only filter by state/city
      if (locationMethod === "auto" && userCoords) {
        params.latitude = userCoords.latitude;
        params.longitude = userCoords.longitude;
      }

      const response = await userAPI.getLocations(params);
      if (response.data.success) {
        setLocations(response.data.locations);
        // Reset store selection when locations change
        setValue("storeOutlet", "");
        setSelectedStoreLocation("");

        if (response.data.locations.length === 1) {
          setValue("storeOutlet", String(response.data.locations[0].id), {
            shouldValidate: true,
          });
          setSelectedStoreLocation(String(response.data.locations[0].id));
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
      setLocationMethod("auto");
      setLocationPermissionDenied(false);
      toast.success("Location detected successfully!");
      await fetchLocationsWithCoords(coords);
    } catch (error) {
      console.error("Error getting location:", error);
      toast.error("Unable to access location. Please enter manually.");
      setLocationPermissionDenied(true);
    } finally {
      setLocationLoading(false);
    }
  };

  const switchToManualMode = () => {
    setLocationMethod("manual");
    setLocations([]);
    setValue("storeOutlet", "");
    setSelectedStoreLocation("");
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

      // Determine coordinates: use GPS if available, otherwise use store location
      let finalCoords = userCoords;
      if (
        !finalCoords &&
        selectedLocation.latitude &&
        selectedLocation.longitude
      ) {
        // Use store location coordinates when GPS is disabled
        finalCoords = {
          latitude: parseFloat(selectedLocation.latitude),
          longitude: parseFloat(selectedLocation.longitude),
        };
        // Store these coordinates in context for eligibility check
        updateCoordinates(finalCoords);
      }

      // If still no coordinates, we can't proceed
      if (!finalCoords) {
        toast.error(
          "Unable to determine location. Please enable GPS or select a store with location data."
        );
        setLoading(false);
        return;
      }

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

  // Helper function to check location permission status
  const checkLocationPermission = async () => {
    try {
      // Check if Geolocation API is available
      if (!navigator.geolocation) {
        console.log("Geolocation not supported");
        setLocationPermission({
          locationGranted: false,
          message: "Geolocation not supported",
        });
        return false;
      }

      // Try to get current position
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Permission granted
            console.log(position, "Location permission: GRANTED");
            setLocationPermission({
              locationGranted: true,
              message: "Permission granted",
            });
            resolve(true);
          },
          (error) => {
            // Permission denied or other error
            if (error.code === error.PERMISSION_DENIED) {
              console.log("Location permission: DENIED");
              setLocationPermission({
                locationGranted: false,
                message: "Permission denied",
              });
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              console.log("Location information is unavailable");
              setLocationPermission({
                locationGranted: false,
                message: "Position unavailable",
              });
            } else if (error.code === error.TIMEOUT) {
              console.log("Location request timed out");
              setLocationPermission({
                locationGranted: false,
                message: "Request timed out",
              });
            }
            setLocationPermission({
              locationGranted: false,
              message: "",
            });
            resolve(false);
          }
        );
      });
    } catch (error) {
      console.error("Error checking location permission:", error);
      return false;
    }
  };

  // Add this useEffect to RegistrationPage
  useEffect(() => {
    const checkPermission = async () => {
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        toast.warning(
          "Please enable location access for better store recommendations"
        );
      }
    };

    checkPermission();
  }, []);

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

          {/* Location Method Toggle */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaLocationArrow className="text-brand-green" />
                <span className="font-semibold text-gray-700">
                  Location Method
                </span>
              </div>
              {locationMethod === "auto" && userCoords && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Active
                </span>
              )}
            </div>

            {locationMethod === "auto" && userCoords ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Using your current location
                </span>
                <button
                  type="button"
                  onClick={switchToManualMode}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Enter Manually
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    {locationPermissionDenied
                      ? "Location access denied. Please enter your state and city below."
                      : "Enable location for automatic store detection or enter manually."}
                  </p>
                </div>
                {locationPermissionDenied && (
                  <button
                    type="button"
                    onClick={handleRetryLocation}
                    disabled={locationLoading}
                    className="w-full mt-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {locationLoading ? "Detecting..." : "Enable Auto Location"}
                  </button>
                )}
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

            {/* State and City - Always visible in manual mode */}
            {locationMethod === "manual" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline mr-2 text-red-500" />
                    State *
                  </label>
                  <select
                    {...register("state", { required: "State is required" })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-power-yellow focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="">Select State</option>
                    {nigerianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    {...register("city", { required: "City is required" })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-power-yellow focus:border-transparent outline-none transition"
                    placeholder="Enter your city"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>
            )}

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
                disabled={locationLoading || locations.length === 0}
              >
                <option value="">
                  {locationLoading
                    ? "Loading locations..."
                    : locationMethod === "manual" &&
                      (!selectedState || !selectedCity)
                    ? "Please select state and city first"
                    : locations.length === 0
                    ? "No locations available"
                    : "Select Store"}
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
