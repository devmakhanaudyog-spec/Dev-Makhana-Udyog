import React, { useState, useEffect } from 'react';
import axios from '../utils/api';
import toast from 'react-hot-toast';
import { Clock, Mail, RefreshCw } from 'lucide-react';

export default function OTPVerificationModal({ email, onVerifySuccess, onClose }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle OTP input
  const handleOTPChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus to next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-otp', { 
        email: email.toLowerCase(), 
        otp: otpCode 
      });

      toast.success('Email verified successfully!');
      onVerifySuccess(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      // Focus back to first input
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await axios.post('/api/auth/resend-otp', { email: email.toLowerCase() });
      toast.success('OTP sent to your email');
      setTimeLeft(600);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      // Focus to first input
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <Mail className="text-green-600 dark:text-green-400" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Email</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Enter the 6-digit code we sent to</p>
          <p className="font-semibold text-gray-800 dark:text-gray-200 break-all">{email}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {/* OTP Input */}
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-2xl font-bold focus:border-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition"
                disabled={loading}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <Clock size={16} className={timeLeft <= 60 ? 'text-red-500' : 'text-amber-500'} />
            <span className={`font-semibold ${timeLeft <= 60 ? 'text-red-500' : 'text-amber-500'}`}>
              Valid for {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-gradient-to-r from-green-700 via-green-600 to-green-400 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>

          {/* Resend Button */}
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resendLoading}
            className="w-full text-green-600 dark:text-green-400 py-2 font-semibold hover:text-green-700 dark:hover:text-green-300 disabled:text-gray-400 dark:disabled:text-gray-600 transition flex items-center justify-center gap-2"
          >
            {resendLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Sending...
              </>
            ) : canResend ? (
              <>
                <RefreshCw size={16} />
                Resend OTP
              </>
            ) : (
              `Resend in ${minutes}:${seconds.toString().padStart(2, '0')}`
            )}
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full text-gray-500 dark:text-gray-400 py-2 font-medium hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              Change Email
            </button>
          )}
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Tip:</strong> Check your spam folder if you don't see the email within a minute.
          </p>
        </div>
      </div>
    </div>
  );
}
