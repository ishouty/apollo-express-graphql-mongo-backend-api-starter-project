import 'dotenv/config' //environments with .env

// general files to set up express such as logger, cors body parser eyc..
import express from 'express'
import morgan from 'morgan' // logging on server
import helmet from 'helmet' // middlewear deals with security headers for express
import logger from './logger'
import bodyParser from 'body-parser'
import cors from 'cors' // sort out cors issue

import { context, formatError } from './services/apollo/config'
// mongoose schemas and connection to mongodb via mongoose
import { connectDb } from './models' // models schema from mongoose

// routes for api
import routesApi from './routes/api' // general routes

// Authetication
import passport from 'passport' // middlewear authentication service
import './services/auth/passport-auth-setup' // setup passport auth strategy for authentication configuration

// Apollo server
import {
  ApolloServer, // gui to server
} from 'apollo-server-express'
import gqlschema from './gqlschema' // typeDefs used for graphql schema to appollo server
import resolvers from './resolvers' // resolvers to map queries to function and return data from queries

// initialise
const app = express() // start express server

app.use(cors()) // enable cors with default cors to resolve issues with headers
app.use(morgan(process.env.ENVIRONMENT)) // auto logging
app.use(helmet())
app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api', routesApi) // general routes e.g authentication and general content with the use of apollo or graphql.
app.get('/json', () => {
  return {}
})

// use passport js middlewear to allow allow users to authenticate before playing with apollo server play ground
app.use('/graphql', (request, response, next) => {
  passport.authenticate('bearer', { session: false }, (err, user) => {
    response.locals.user = user
    next()
  })(request, response, next)
})

// await for database to be connected before calling appollo

connectDb()
  .then((result) => {
    app.listen(process.env.PORT, () => {
      logger.info('Database connection successful')
      logger.info('Express server has started')
    })

    logger.info(`${process.env.ENVIRONMENT} : starting environment`)

    const server = new ApolloServer({
      introspection: true,
      typeDefs: gqlschema, // graphql schemas
      resolvers, // resolvers which mixture of both data mutation which has the connection to moongoose
      formatError,
      context: context,
    })

    server.applyMiddleware({ app, path: '/graphql' }) // connect express to gui server
  })
  .catch((e) => {
    logger.error('App starting error:' + e.stack)
    process.exit(1) // exit the server
  })
