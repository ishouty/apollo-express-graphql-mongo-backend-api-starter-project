import { GraphQLDateTime } from 'graphql-iso-date'

import userResolvers from './user'
import productResolvers from './product'

const customScalarResolver = {
  Date: GraphQLDateTime,
}

export default [customScalarResolver, userResolvers, productResolvers]
