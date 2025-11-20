import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [location, setLocation] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [spinResult, setSpinResult] = useState(null);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    // Get or create device ID
    let storedDeviceId = localStorage.getItem('power_oil_device_id');
    if (!storedDeviceId) {
      storedDeviceId = uuidv4();
      localStorage.setItem('power_oil_device_id', storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    // Load user from localStorage if exists
    const storedUser = localStorage.getItem('power_oil_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }

    // Load campaign from localStorage if exists
    const storedCampaign = localStorage.getItem('power_oil_campaign');
    if (storedCampaign) {
      try {
        setCampaign(JSON.parse(storedCampaign));
      } catch (error) {
        console.error('Error parsing stored campaign:', error);
      }
    }

    // Load location from localStorage if exists
    const storedLocation = localStorage.getItem('power_oil_location');
    if (storedLocation) {
      try {
        setLocation(JSON.parse(storedLocation));
      } catch (error) {
        console.error('Error parsing stored location:', error);
      }
    }

    // Load coordinates from localStorage if exists
    const storedCoordinates = localStorage.getItem('power_oil_coordinates');
    if (storedCoordinates) {
      try {
        setCoordinates(JSON.parse(storedCoordinates));
      } catch (error) {
        console.error('Error parsing stored coordinates:', error);
      }
    }
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('power_oil_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('power_oil_user');
    }
  };

  const updateCampaign = (campaignData) => {
    setCampaign(campaignData);
    if (campaignData) {
      localStorage.setItem('power_oil_campaign', JSON.stringify(campaignData));
    } else {
      localStorage.removeItem('power_oil_campaign');
    }
  };

  const updateLocation = (locationData) => {
    setLocation(locationData);
    if (locationData) {
      localStorage.setItem('power_oil_location', JSON.stringify(locationData));
    } else {
      localStorage.removeItem('power_oil_location');
    }
  };

  const updateCoordinates = (coords) => {
    setCoordinates(coords);
    if (coords) {
      localStorage.setItem('power_oil_coordinates', JSON.stringify(coords));
    } else {
      localStorage.removeItem('power_oil_coordinates');
    }
  };

  const updateSpinResult = (result) => {
    setSpinResult(result);
  };

  const clearUserData = () => {
    setUser(null);
    setCampaign(null);
    setLocation(null);
    setCoordinates(null);
    setSpinResult(null);
    localStorage.removeItem('power_oil_user');
    localStorage.removeItem('power_oil_campaign');
    localStorage.removeItem('power_oil_location');
    localStorage.removeItem('power_oil_coordinates');
  };

  const value = {
    user,
    campaign,
    location,
    coordinates,
    spinResult,
    deviceId,
    updateUser,
    updateCampaign,
    updateLocation,
    updateCoordinates,
    updateSpinResult,
    clearUserData
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};



