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
    
    if (!session?.user?.email) {
      return {
        req,
        res,
        prisma,
        session: null,
        userId: undefined
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    return {
      req,
      res,
      prisma,
      session,
      userId: user?.id,
      user
    };
  },
});

export { handler as GET, handler as POST }; 
