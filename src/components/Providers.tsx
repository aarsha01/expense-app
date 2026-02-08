'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ReactNode } from 'react';

function SettingsWrapper({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return (
    <SettingsProvider userId={user?.id}>
      {children}
    </SettingsProvider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SettingsWrapper>
        {children}
      </SettingsWrapper>
    </AuthProvider>
  );
}
