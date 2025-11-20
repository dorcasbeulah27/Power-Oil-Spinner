import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import SpinWheelPage from './pages/SpinWheelPage';
import ResultPage from './pages/ResultPage';
import ThankYouPage from './pages/ThankYouPage';

// Context
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App min-h-screen">
          <Routes>
            <Route path="/:id" element={<LandingPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/verify" element={<OTPVerificationPage />} />
            <Route path="/spin" element={<SpinWheelPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;



