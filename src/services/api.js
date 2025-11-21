import axios from "axios";

const API_BASE_URL =
 `${process.env.VITE_API_BASE_URL}/api` || "https://poweroil-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// User API
export const userAPI = {
  register: (userData) => api.post("/user/register", userData),

  requestOTP: (phoneNumber) => api.post("/user/otp/request", { phoneNumber }),

  verifyOTP: (phoneNumber, otp) =>
    api.post("/user/otp/verify", { phoneNumber, otp }),

  checkEligibility: (data) => api.post("/user/eligibility", data),

  spinWheel: (data) => api.post("/user/spin", data),

  getLocations: (params) => {
    // Ensure campaignId is passed if available
    return api.get("/user/locations", { params });
  },

  getActiveCampaign: (params) => api.get(`/user/campaign/active/${params}`),

  getAvailablePrizes: (params) => api.get("/user/prizes/available", { params }),
};

// Geolocation helper
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("lat", position.coords.latitude);

        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

export default api;
