'use client';

import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token
      localStorage.setItem('token', data.token);

      // Redirect or show success
      alert('Login successful!');
      window.location.href = '/dashboard'; // Or any protected page
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-white">Login</h2>

      <label className="block mb-2 text-sm font-medium text-neutral-700 dark:text-white">Email</label>
      <input
        type="email"
        className="w-full p-2 border rounded mb-4 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label className="block mb-2 text-sm font-medium text-neutral-700 dark:text-white">Password</label>
      <input
        type="password"
        className="w-full p-2 border rounded mb-4 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        type="submit"
        className="w-full py-2 px-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded hover:opacity-90 transition"
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}