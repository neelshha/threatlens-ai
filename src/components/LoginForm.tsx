'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn('google'); // Redirects to Google OAuth
    } catch (err) {
      console.error('Google Sign-In error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md text-center">
      <h2 className="text-xl font-semibold mb-6 text-neutral-800 dark:text-white">Sign in to ThreatLens AI</h2>
      <button
        onClick={handleGoogleLogin}
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? 'Redirecting...' : 'Sign in with Google'}
      </button>
    </div>
  );
}