import logger from '../../logger'
import { path } from 'ramda'
import { AuthenticationError } from 'apollo-server'
import models, { connectDb } from '../../models/index'
import { errorResponse } from '../../constants/index'

/**
 * middlewear layer to allow to check requests which could be used for authentication
 */
export const context = async ({ req, res, connection }) => {
  const me = path(['locals', 'user'], res)

  //context is middlewear and used for every requests through apollo server
  if (connection) {
    logger.debug('connection request object !!!!', connection)
  }

  if (res) {
    logger.info(
      `middlewear authenication checking ${req.headers.authorization}`,
    )
    if (me) {
      logger.info('user is authenicated and able to proceed')

      // this is used within the resolvers
      return {
        models,
        me,
        req,
      }
    } else {
      logger.error('Could not authenicate user, permission denied')

      throw new AuthenticationError(errorResponse.notLoggedIn)
    }
  }
}

/**
 * Response back to client of error and formating error
 */
export const formatError = (error) => {
  // remove the internal sequelize error message
  // leave only the important validation error

  const message = error.message
    .replace('SequelizeValidationError: ', '')
    .replace('Validation error: ', '')

  return {
    ...error,
    message,
  }
}
