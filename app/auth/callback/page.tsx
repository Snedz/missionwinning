import { Suspense } from 'react';
import { AuthCallbackPage } from '@/page-components/AuthCallbackPage';

export default function AuthCallbackRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground text-sm">
          Completing sign-in…
        </div>
      }
    >
      <AuthCallbackPage />
    </Suspense>
  );
}
