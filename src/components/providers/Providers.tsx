'use client';

import React from 'react';
import { TenantProvider } from '@/lib/tenantStore';

export function Providers({ children }: { children: React.ReactNode }) {
  return <TenantProvider>{children}</TenantProvider>;
}
