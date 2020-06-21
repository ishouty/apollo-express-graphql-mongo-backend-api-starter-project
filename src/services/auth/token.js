import 'dotenv/config' //environments with .env
import crypto from 'crypto'
import logger from '../../logger'

// Access directly to models
import AccessToken from '../../models/accessToken'
import RefreshToken from '../../models/refreshToken'

const tokenExpiry = process.env.TOKEN_LIFE
const loginBlockConcurrentLogin =
  process.env.LOGIN_BLOCK_CONCURRENT_LOGIN

// Generic error handler
const errFn = (cb, err) => {
  if (err) {
    return cb(err)
  }
}

/**
 * Destroys any old tokens and generates a new access and refresh token
 * @param {*} data
 */
export const generateNewToken = async (data) => {
  return new Promise((resolve, reject) => {
    logger.debug('****** Generate generateTokens ****** ')

    const userId = data.userId
    const userType = data.userType
    const expiredBoundary = new Date() - tokenExpiry
    const expiredToken = { userId, created: { $lt: expiredBoundary } }
    // curries in `done` callback so we don't need to pass it
    const errorHandler = errFn.bind(undefined, reject)

    logger.debug(
      '****** Deleting expired Tokens for user ' +
        userId +
        ' ****** ',
    )

    RefreshToken.find(expiredToken, function (err, token) {
      if (err) {
        reject(err)
      }
      token.remove
    })

    AccessToken.deleteOne(expiredToken, errorHandler)

    logger.debug('****** Deleted expired Tokens for this user****** ')

    logger.debug('Checking if user is already logged in')
    logger.debug(
      'Allow concurrent logins? ' + !loginBlockConcurrentLogin,
    )

    AccessToken.findOne(expiredToken, function (err, user) {
      if (err) {
        reject(err)
        logger.debug('Error finding logged-in user' + err)
      } else {
        if (user && loginBlockConcurrentLogin === true) {
          logger.error(
            'User attempting second login - disallowed by config',
          )
          reject({ error: 'user already logged in' })
        } else {
          logger.info(
            'Removing existing refresh and access token and require a new access token ',
          )

          // delete all tokens from refresh and access tokens
          RefreshToken.deleteMany(
            { userId: data.userId },
            errorHandler,
          )
          AccessToken.deleteMany(
            { userId: data.userId },
            errorHandler,
          )

          const tokenValue = crypto.randomBytes(32).toString('hex')
          const refreshTokenValue = crypto
            .randomBytes(32)
            .toString('hex')

          const token = new AccessToken({
            ...data,
            token: tokenValue,
          })

          const refreshToken = new RefreshToken({
            ...data,
            token: refreshTokenValue,
          })

          refreshToken.save(errorHandler)

          return token.save((err) => {
            if (err) {
              logger.error(err)
              return reject(err)
            }

            logger.debug('access token has now been created!!!')

            return resolve({
              accessToken: tokenValue,
              refreshToken: refreshTokenValue,
              expiresIn: tokenExpiry,
            })
          })
        }
      }
    })
  })
}
