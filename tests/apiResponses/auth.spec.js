import * as api from './api'
import models, { connectDb } from '../../src/models'

import mongoose from 'mongoose'
import { userType } from '../../src/constants/index'

let db
let expectedUsers
let expectedUser

let authHeadersConfig = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: '',
    clientId: 'android',
  },
}

describe('authenication', () => {
  beforeEach(async (done) => {
    db = await connectDb('mongodb://localhost:27017/test-apollo')

    expectedUsers = await models.User.find()

    expectedUser = expectedUsers.filter(
      (user) => user.userType !== userType.admin,
    )[0]

    done()
  })

  afterEach(async () => {
    await db.connection.close()
  })

  describe('login', () => {
    describe('signing in through email and password', () => {
      const expiresIn = '86400'
      const tokenLength = 64

      it('an admin user can sign in and recieve access token', async () => {
        const signedIn = await api.signIn({
          client_id: 'android',
          grant_type: 'password',
          client_secret: 'SomeRandomCharsAndNumbers',
          username: 'admin@test.com',
          password: 'Test@1234',
        })

        expect(signedIn.data.refresh_token.length).toEqual(
          tokenLength,
        )
        expect(signedIn.data.access_token.length).toEqual(tokenLength)
        expect(signedIn.data.userType).toEqual(userType.admin)
        expect(signedIn.data.expires_in).toEqual(expiresIn)

        authHeadersConfig.headers.Authorization = `Bearer ${signedIn.data.access_token}`
      })

      it('a user can sign in and recieve access token', async (done) => {
        const signedIn = await api.signIn({
          client_id: 'android',
          grant_type: 'password',
          client_secret: 'SomeRandomCharsAndNumbers',
          username: 'user@test.com',
          password: 'Test@1234',
        })

        expect(signedIn.data.refresh_token.length).toEqual(
          tokenLength,
        )
        expect(signedIn.data.access_token.length).toEqual(tokenLength)
        expect(signedIn.data.userType).toEqual(userType.user)
        expect(signedIn.data.expires_in).toEqual(expiresIn)
        done()
      })

      it('should return 403 and error message if email or password is incorrect', async (done) => {
        await models.User.findOneAndUpdate(
          { email: 'user@test.com' },
          { loginAttempts: 0 },
        )

        const result = await api.signIn({
          client_id: 'android',
          grant_type: 'password',
          client_secret: 'SomeRandomCharsAndNumbers',
          username: 'user@test.com',
          password: 'wrongPassword@12345',
        })

        const { error, error_description } = result.response.data
        const { status, statusText } = result.response

        expect(status).toEqual(403)
        expect(statusText).toEqual('Forbidden')
        expect(error).toContain('invalid_grant')
        expect(error_description).toContain(
          'Invalid resource owner credentials',
        )
        done()
      })

      it('should block user account if user is login more than 3 times', async (done) => {
        await models.User.findOneAndUpdate(
          { email: 'user@test.com' },
          { loginAttempts: 3 },
        )

        await api
          .signIn({
            client_id: 'android',
            grant_type: 'password',
            client_secret: 'SomeRandomCharsAndNumbers',
            username: 'user@test.com',
            password: 'wrongPassword',
          })
          .catch((errorResponse) => {
            const { status, statusText } = errorResponse.response
            const { error } = errorResponse.response.data

            expect(status).toEqual(500)
            expect(statusText).toEqual('Internal Server Error')
            expect(error).toContain('server_error')
          })

        await models.User.findOneAndUpdate(
          { email: 'user@test.com' },
          { loginAttempts: 0 },
        )
        done()
      })
    })
  })

  describe('signUp', () => {
    it('admin user can register a user', async (done) => {
      await models.User.deleteOne({
        email: 'test@ishouty.com',
      })

      const expectedNewUser = {
        email: 'test@ishouty.com',
        firstName: 'test ',
        lastName: 'test',
        password: 'test@1234',
        userType: 'user',
      }

      const signUpResult = await api.signUp(
        expectedNewUser,
        authHeadersConfig,
      )

      const newUserResult = await models.User.find({
        email: 'test@ishouty.com',
      })

      expect(
        signUpResult.data.data.signUp.accessToken.length,
      ).toEqual(64)

      expect(newUserResult.length).toEqual(1)
      expect(expectedNewUser.email).toEqual(newUserResult[0].email)
      expect(expectedNewUser.firstName).toEqual(
        newUserResult[0].firstName,
      )
      expect(expectedNewUser.lastName).toEqual(
        newUserResult[0].lastName,
      )
      expect(expectedNewUser.userType).toEqual(
        newUserResult[0].userType,
      )
      done()
    })

    it('admin user can register a admin user', async (done) => {
      const expectedNewUser = {
        email: 'adminmock@ishouty.com',
        firstName: 'test ',
        lastName: 'test',
        password: 'test@1234',
        userType: 'admin',
      }

      const signupResult = await api.signUp(
        expectedNewUser,
        authHeadersConfig,
      )

      const newUserResult = await models.User.find({
        email: 'adminmock@ishouty.com',
      })

      expect(newUserResult.length).toEqual(1)
      expect(expectedNewUser.email).toEqual(newUserResult[0].email)
      expect(expectedNewUser.firstName).toEqual(
        newUserResult[0].firstName,
      )
      expect(expectedNewUser.lastName).toEqual(
        newUserResult[0].lastName,
      )
      expect(expectedNewUser.userType).toEqual(
        newUserResult[0].userType,
      )
      done()
    })
  })
})
