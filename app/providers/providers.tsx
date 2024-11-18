'use client'

import { ApolloProvider } from '@apollo/client'
import { client } from '../lib/apollo-client'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  )
} 
