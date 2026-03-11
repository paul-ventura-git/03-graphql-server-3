import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import axios from 'axios';
import { users, orders } from './db.js';
import fs from 'fs';

// -------- SCHEMA ----------
const typeDefs = `#graphql
  type User {
    id: ID
    name: String
    city: String
    orders: [Order]
  }

  type Order {
    id: ID
    total: Int
  }

  type Post {
    id: ID
    title: String
  }

  type Config {
    appName: String
    version: String
  }

  type Query {
    users: [User]
    user(id: ID!): User
    posts: [Post]
    config: Config
  }
`;

// -------- RESOLVERS ----------
const resolvers = {
  Query: {

    users: () => users,

    user: (_, { id }) => users.find(u => u.id === id),

    posts: async () => {
      const res = await axios.get(
        "https://jsonplaceholder.typicode.com/posts?_limit=3"
      );
      return res.data;
    },

    config: () => {
      const raw = fs.readFileSync("./config.json");
      return JSON.parse(raw);
    }
  },

  User: {
    orders: (user) =>
      orders.filter(o => o.userId === user.id)
  }
};

// -------- SERVER ----------
const server = new ApolloServer({
  typeDefs,
  resolvers
});

// forma correcta en Apollo v4
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 }
});

console.log(`🚀 Server ready at ${url}`);