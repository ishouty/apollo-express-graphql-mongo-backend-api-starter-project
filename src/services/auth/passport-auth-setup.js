import passport from 'passport'
import logger from '../../logger'
import 'dotenv/config' //environments with .env

// The authentication strategies we are using to authenticate

// two authentication strategy for oauth passport js
// 1. client password combines with the basic strategy to allow to authenticate the client
// 2. bearer strategy is used to authenticate oauth via access tokens. Users will only allowed to access session if they have a valid session

import basicStrategy from 'passport-http'
import clientPasswordStrategy from 'passport-oauth2-client-password' //client
import bearerStrategy from 'passport-http-bearer' // used for access token exchanging

// connecting to mongoose to check details that we have valid user case

import User from '../../models/user'
import Client from '../../models/client'
import AccessToken from '../../models/accessToken'

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients. They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens. The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate. Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header). While this approach is not recommended by
 * the specification, in practice it is quite common.
 */

const verifyUsernamePassword = (username, password, done) => {
  logger.info('verifyUsernamePassword', username, password)

  Client.findOne({ clientId: username }, function (err, client) {
    console.log('password', client)
    if (err) {
      return done(err)
    }

    if (!client) {
      return done(null, false)
    }

    if (client.clientSecret !== password) {
      logger.info(
        '****** passport-auth-setup.js ClientPasswordStrategy FAILED PASSWORD ****** ',
      )

      return done(null, false)
    }

    return done(null, client)
  })
}

const verifyClient = (clientId, clientSecret, done) => {
  logger.info('verifyClient', clientId, clientSecret)

  Client.findOne({ clientId: clientId }, (err, client) => {
    logger.info(client, 'client details')
    if (err) {
      logger.error('error happened on client', err)
      return done(err)
    }

    if (!client) {
      return done(null, false)
    }

    if (client.clientSecret !== clientSecret) {
      logger.info(
        '****** passport-auth-setup.js ClientPasswordStrategy FAILED PASSWORD ****** ',
      )

      return done(null, false)
    }

    console.log('sucess!!')

    return done(null, client)
  })
}

passport.use(new basicStrategy.BasicStrategy(verifyUsernamePassword))

passport.use(new clientPasswordStrategy.Strategy(verifyClient))

passport.use(
  new bearerStrategy.Strategy((accessToken, done) => {
    logger.info(
      '****** passport-auth-setup.js BearerStrategy ****** ',
    )

    AccessToken.findOne({ token: accessToken }, (err, token) => {
      logger.info('****** passport-auth-setup.js found token ****** ')

      if (err) {
        logger.error(err)
        return done(err)
      }

      if (!token) {
        logger.error(
          'passport-auth-setup.js token not found from result',
        )
        return done(null, false)
      }

      if (
        Math.round((Date.now() - token.created) / 1000) >
        token.created
      ) {
        AccessToken.deleteOne({ token: accessToken }, (err) => {
          if (err) {
            return done(err)
          }
        })

        return done(null, false, { message: 'Token expired' })
      }

      User.findById(token.userId, (err, user) => {
        if (err) {
          return done(err)
        }

        if (!user) {
          return done(null, false, { message: 'Unknown user' })
        }

        var info = { scope: '*' }
        done(null, user, info)
      })
    })
  }),
)
