import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { typeDefs } from '../../graphql/schema/types/schema'
import { resolvers } from '../../graphql/resolvers/resolvers'

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const handler = startServerAndCreateNextHandler(server)

export { handler as GET, handler as POST } 
