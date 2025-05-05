'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
      <div className="bg-white dark:bg-black p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-6">Sign in with Google</h2>
        <button
          onClick={() => signIn('google')}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded hover:opacity-80 transition"
        >
          Sign in with Google
        </button>
      </div>
    </main>
  );
}