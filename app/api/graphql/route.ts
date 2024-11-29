import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from '@/app/graphql/schema/types/schema';
import { resolvers } from '@/app/graphql/resolvers/resolvers';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => {
    const session = await getServerSession();
    return {
      prisma,
      session,
    };
  },
});

export { handler as GET, handler as POST }; 
