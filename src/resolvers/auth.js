import { ForbiddenError, AuthenticationError } from 'apollo-server'
import { combineResolvers, skip } from 'graphql-resolvers'
import { errorResponse, userType } from '../constants/index'

export const isAuthenticated = (parent, args, { me } = context) =>
  me ? skip : new ForbiddenError(errorResponse.notLoggedIn)

export const isAdmin = combineResolvers(
  isAuthenticated,
  (parent, args, { me } = context) => {
    return me.userType === userType.admin
      ? skip
      : new ForbiddenError(errorResponse.forbidden)
  },
)

export const isUserOrAdmin = combineResolvers(
  isAuthenticated,
  (parent, { id } = args, { me } = context) => {
    if (
      String(id) === String(me._id) ||
      me.userType === userType.admin
    ) {
      return skip
    } else {
      return new ForbiddenError(errorResponse.noPermissions)
    }
  },
)

export const isProductOwnerOrAdmin = async (
  parent,
  { id } = args,
  { models, me } = context,
) => {
  const product = await models.Product.findById(id)

  if (me.userType == userType.admin) {
    return skip
  }

  if (product.userId !== me._id) {
    throw new ForbiddenError(errorResponse.forbidden)
  }
}

export const generateToken = async (
  parent,
  { id } = args,
  { models, me } = context,
) => {}
