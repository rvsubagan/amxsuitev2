'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    setLoading(true);
    signIn('keycloak'); // provider ID
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-100 text-base-content">
      <div className="bg-base-200 p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Sign in to Alps1 AMX
        </h1>

        {error && (
          <div className="alert alert-error mb-4">
            <span>❌ Error: {error}</span>
          </div>
        )}

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? 'Redirecting...' : 'Sign in with Keycloak'}
        </button>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        Loading…
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
