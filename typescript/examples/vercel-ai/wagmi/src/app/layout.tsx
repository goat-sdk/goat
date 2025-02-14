'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { FC, PropsWithChildren } from 'react';
import { WagmiProvider } from 'wagmi';

import config from '../config';

const RootLayout: FC<PropsWithChildren> = ({ children }) => {
    const client = new QueryClient();

  return (
    <html lang="en">
      <body>
      <WagmiProvider config={config}>
          <QueryClientProvider client={client}>
              {children}
          </QueryClientProvider>
      </WagmiProvider>
      </body>
    </html>
  );
};

export default RootLayout;
