import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { typeDefs } from '../../graphql/schema/types/schema'
import { resolvers } from '../../graphql/resolvers/resolvers'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      locations: error.locations,
      path: error.path,
    };
  },
})

const handler = startServerAndCreateNextHandler(server, {
  context: async (req: Request) => {
    return {
      req,
      prisma,
    };
  }
});

export async function POST(req: Request) {
  try {
    return await handler(req);
  } catch (error) {
    console.error('Handler error:', error);
    return new Response(JSON.stringify({
      errors: [{ message: 'Internal server error' }]
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function GET(req: Request) {
  return handler(req);
} 
