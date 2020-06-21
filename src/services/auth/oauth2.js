import 'dotenv/config' //environments with .env

import oauth2orize from 'oauth2orize'
import passport from 'passport'
import crypto from 'crypto'

import logger from '../../logger'

import { connectDb } from '../../models/index'

// Access directly to models
import User from '../../models/user'
import AccessToken from '../../models/accessToken'
import RefreshToken from '../../models/refreshToken'
//import models from '../../models/index'

const tokenExpiry = process.env.TOKEN_LIFE
const loginAttempts = process.env.LOGIN_ATTEMPTS
const loginBlockConcurrentLogin =
  process.env.LOGIN_BLOCK_CONCURRENT_LOGIN

// create OAuth 2.0 server framework to get access tokens for valid credentals
const aserver = oauth2orize.createServer()

// Generic error handler
var errFn = (cb, err) => {
  if (err) {
    return cb(err)
  }
}

// Destroys any old tokens and generates a new access and refresh token
const generateTokens = (data, done) => {
  logger.debug('****** Generate generateTokens ****** ')

  let expiredBoundary = new Date() - tokenExpiry

  const userId = data.userId
  logger.debug(
    '****** Deleting expired Tokens for user ' + userId + ' ****** ',
  )
  const expiredToken = { userId, created: { $lt: expiredBoundary } }
  RefreshToken.find(expiredToken, function (err, token) {
    token.remove
  })

  AccessToken.deleteOne(expiredToken, errorHandler)

  logger.debug('****** Deleted expired Tokens for this user****** ')

  let userType = data.userType

  // curries in `done` callback so we don't need to pass it
  var errorHandler = errFn.bind(undefined, done),
    refreshToken,
    refreshTokenValue,
    token,
    tokenValue

  tokenValue = crypto.randomBytes(32).toString('hex')
  refreshTokenValue = crypto.randomBytes(32).toString('hex')
  data.token = tokenValue

  logger.debug('Checking if user is already logged in')
  logger.debug(
    'Allow concurrent logins? ' + !loginBlockConcurrentLogin,
  )
  AccessToken.findOne(expiredToken, function (err, user) {
    if (err) {
      logger.debug('Error finding logged-in user' + err)
    } else {
      if (user && loginBlockConcurrentLogin === true) {
        logger.error(
          'User attempting second login - disallowed by config',
        )
        done({ error: 'user already logged in' })
      } else {
        logger.info(
          'Removing existing refresh and access token and require a new access token ',
        )

        RefreshToken.remove({ userId: data.userId }, errorHandler)
        AccessToken.remove({ userId: data.userId }, errorHandler)
        token = new AccessToken(data)

        data.token = refreshTokenValue
        refreshToken = new RefreshToken(data)

        refreshToken.save(errorHandler)

        token.save((err) => {
          if (err) {
            logger.error(err)
            return done(err)
          }

          logger.debug('access token has now been created')

          done(null, tokenValue, refreshTokenValue, {
            expires_in: tokenExpiry,
            userType: userType,
            userId: data.userId,
          })
        })
      }
    }
  })
}

// Exchange username & password for access token.
aserver.exchange(
  oauth2orize.exchange.password(
    (client, username, password, scope, done) => {
      logger.debug('****** aserver.exchange ****** ')
      logger.debug(username)

      User.findOne({ email: username.toLowerCase() }, (err, user) => {
        if (!user) {
          return done(null, false)
        }

        if (err) {
          return done(err)
        }

        if (!user || !user.checkPassword(password, user)) {
          logger.info('****** log attempted login  ****** ')
          user.loginAttempts = user.loginAttempts + 1
          user.save()
        }

        if (user.loginAttempts >= loginAttempts) {
          logger.info(
            '****** aserver.exchange account is blocked block****** ',
          )

          if (user.loginAttempts === loginAttempts) {
            logger.info(
              '****** aserver.exchange send email your account is blocked ****** ',
            )
            //send a email
          }

          //dont allow them to login
          return done('error response')
        }

        if (!user || !user.checkPassword(password)) {
          logger.info(
            '****** aserver.exchange failed password or login ****** ',
          )

          return done(null, false)
        }

        var model = {
          userId: user._id,
          userType: user.userType,
          clientId: client.clientId,
        }

        //reset login count
        user.loginAttempts = 0
        user.save()

        generateTokens(model, done)
      })
    },
  ),
)

// Exchange refreshToken for access token.
aserver.exchange(
  oauth2orize.exchange.refreshToken(
    (client, refreshToken, scope, done) => {
      logger.debug(
        '****** refresh token exchange generateTokens ****** ',
      )
      RefreshToken.findOne(
        { token: refreshToken, clientId: client.clientId },
        (err, token) => {
          if (err) {
            return done(err)
          }

          if (!token) {
            return done(null, false)
          }

          User.findById(token.userId, (err, user) => {
            if (err) {
              return done(err)
            }
            if (!user) {
              return done(null, false)
            }

            var model = {
              userId: user.userId,
              clientId: client.clientId,
            }

            generateTokens(model, done)
          })
        },
      )
    },
  ),
)

// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = [
  passport.authenticate(['basic', 'oauth2-client-password'], {
    session: false,
  }),
  aserver.token(),
  aserver.errorHandler(),
]
