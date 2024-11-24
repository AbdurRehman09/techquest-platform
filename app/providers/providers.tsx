'use client'

import { SessionProvider } from 'next-auth/react';
import { ApolloProvider } from '@apollo/client'
import { client } from '../lib/apollo-client'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ApolloProvider client={client}>
        {children}
      </ApolloProvider>
    </SessionProvider>
  )
} 
