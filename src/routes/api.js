import express from 'express'
import { apiVersion } from '../constants/index'
import oauth from '../services/auth/oauth2'

const router = express.Router()

router.get('/ping', (request, response, next) => {
  response.json({
    version: apiVersion,
    message: 'running api server',
    date: new Date(),
  })
})

router.post('/login', oauth.token)

export default router
