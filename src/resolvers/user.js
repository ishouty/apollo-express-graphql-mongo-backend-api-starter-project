import { combineResolvers } from 'graphql-resolvers'
import {
  AuthenticationError,
  UserInputError,
  ApolloError,
} from 'apollo-server'

import { path } from 'ramda'

import { isAdmin, isUserOrAdmin } from './auth'

import { generateNewToken } from '../services/auth/token'
import logger from '../logger'
import { errorResponse } from '../constants'

export default {
  Query: {
    users: async (parent, args, { models } = context) => {
      logger.info('calling lists of users')
      return await models.User.find().exec()
    },
    user: async (parent, { id } = args, { models, me } = context) => {
      logger.info('calling user by id')
      return await models.User.findById(id)
    },
    me: async (parent, args, { models, me } = context) => {
      logger.info('calling user to get details')
      if (!me) {
        throw new AuthenticationError(errorResponse.notLoggedIn)
      }

      return await models.User.findById(me.id)
    },
  },

  Mutation: {
    signUp: combineResolvers(
      isAdmin,
      async (
        parent,
        { email, password, firstName, lastName, userType } = args,
        { models, req },
      ) => {
        try {
          const user = await models.User.create({
            email: email.toLowerCase(),
            firstName,
            lastName,
            userType,
            password,
          })

          const clientId = path(['headers', 'clientid'], req)

          if (!clientId) {
            throw new ApolloError('Missing clientId')
          }

          const token = await generateNewToken({
            ...user,
            userId: user._id,
            clientId, // pass the header to generate new tokens
          })

          return token
        } catch (e) {
          logger.error('Could not create user: ' + e)
          throw new ApolloError('Could not create user' + e)
        }
      },
    ),
    updateUser: combineResolvers(
      isUserOrAdmin,
      async (
        parent,
        { id, firstName, lastName, userType, email } = args,
        { models } = context,
      ) => {
        const userUpdate = await models.User.findOneAndUpdate(
          { _id: id },
          {
            email,
            firstName,
            lastName,
            userType,
          },
          { new: true },
        )

        return userUpdate
      },
    ),

    deleteUser: combineResolvers(
      isAdmin,
      async (parent, { id } = args, { models }) => {
        const user = await models.User.findById(id)

        if (user) {
          await user.remove()
          return true
        }
        return false
      },
    ),
  },

}
