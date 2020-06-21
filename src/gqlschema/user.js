import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    users: [User!]
    user(id: ID!): User
    me: User
  }

  extend type Mutation {
    signUp(
      email: String!
      password: String!
      firstName: String
      lastName: String
      userType: String
    ): Token!

    signIn(login: String!, password: String!): Token!
    updateUser(
      id: String!
      email: String!
      firstName: String
      lastName: String
      userType: String!
    ): User

    deleteUser(id: ID!): Boolean!
  }

  type Token {
    accessToken: String
    refreshToken: String
    expiresIn: String
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String
    userType: String!
  }
`
