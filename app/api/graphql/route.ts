import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from '@/app/graphql/schema/types/schema';
import { resolvers } from '@/app/graphql/resolvers/resolvers';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => {
    const session = await getServerSession(authOptions);
    return {
      req,
      res,
      prisma,
      session,
      userId: session?.user?.id ? parseInt(session.user.id) : undefined
    };
  },
});

export { handler as GET, handler as POST }; 
