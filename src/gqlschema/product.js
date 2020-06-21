import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
    products(filter: Filter, limit: Int): [Product]
    product(id: ID!): Product!
    allUserProducts(userId: ID!): [Product]
  }

  input Filter {
    userId: ID
    title: String
    description: String
    dateBetween: dateBetween
  }

  input dateBetween {
    startDate: Date!
    endDate: Date!
  }

  extend type Mutation {
    createProduct(
      userId: ID!
      title: String!
      description: String
      price: Int!
      imagesUrl: [String]
    ): Product!

    deleteProduct(id: ID!): Boolean

    editProduct(
      id: ID!
      userId: ID!
      title: String!
      description: String
      price: Int!
      imagesUrl: [String]
    ): Product!
  }

  type Product {
    productId: ID!
    title: String!
    description: String!
    price: Int!
    imagesUrl: [String]
    createdAt: Date!
    userId: String
  }
`
