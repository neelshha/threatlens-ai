'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn('google');
    } catch (err) {
      console.error('Google Sign-In error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto mt-20 px-6 py-8 bg-[#0e1629] text-white border border-[#3942f2] rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Welcome to <span className="text-[#3942f2]">ThreatLens AI</span></h2>
      <p className="text-sm text-neutral-400 text-center mb-8">AI-powered threat report analysis at your fingertips.</p>

      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 py-2 px-4 bg-[#3942f2] hover:bg-[#4a52f5] transition text-white font-medium text-sm rounded-md disabled:opacity-50"
        disabled={loading}
      >
        <FcGoogle className="text-xl bg-white rounded-full" />
        {loading ? 'Redirecting to Google...' : 'Sign in with Google'}
      </button>
    </div>
  );
}
