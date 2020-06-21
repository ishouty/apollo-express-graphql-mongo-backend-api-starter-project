import mongoose from 'mongoose'

import User from './user'
import Product from './product'
import AccessToken from './accessToken'
import RefreshToken from './refreshToken'
import Client from './client'

import logger from '../logger'

const connectDb = () => {
  if (process.env.DATABASE_URL) {
    return mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  }

  mongoose.connection.on('connected', (error) => {
    logger.debug('moongoose connected to mongodb connection')
  })
}

const models = {
  User,
  AccessToken,
  Client,
  RefreshToken,
  Product,
}

export { connectDb }

export default models
