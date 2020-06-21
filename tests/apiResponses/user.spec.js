import * as api from './api'
import models, { connectDb } from '../../src/models'

import mongoose from 'mongoose'
import { userType } from '../../src/constants/index'

let db
let expectedUsers
let expectedUser

let userHeadersConfig = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: '',
    clientId: 'android',
  },
}

let headersConfigUser = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: '',
    clientId: 'android',
  },
}

describe('user', () => {
  beforeEach(async (done) => {
    jest.clearAllMocks()
    db = await connectDb('mongodb://localhost:27017/test-apollo')

    expectedUsers = await models.User.find()

    expectedUser = expectedUsers.filter(
      (user) => user.userType !== userType.admin,
    )[0]

    const signedIn = await api.signIn({
      client_id: 'android',
      grant_type: 'password',
      client_secret: 'SomeRandomCharsAndNumbers',
      username: 'admin@test.com',
      password: 'Test@1234',
    })

    userHeadersConfig.headers.Authorization = `Bearer ${signedIn.data.access_token}`

    done()
  })

  afterEach(async () => {
    await db.connection.close()
  })

  describe('userdetails', () => {
    describe('user(id: String!): User', () => {
      it('should return a user when user can be found', async (done) => {
        const expectedResult = {
          data: {
            user: {
              id: expectedUser.id,
              email: expectedUser.email,
              userType: userType.user,
            },
          },
        }

        const result = await api.user(
          { id: expectedUser.id },
          userHeadersConfig,
        )

        expect(result.data).toEqual(expectedResult)

        done()
      })

      it('should return null when user cannot be found', async (done) => {
        const expectedResult = {
          data: {
            user: null,
          },
        }

        const result = await api.user(
          {
            id: new mongoose.Types.ObjectId(),
          },
          userHeadersConfig,
        )

        expect(result.data).toEqual(expectedResult)
        done()
      })
    })

    describe('me', () => {
      it('should return me my user details', async (done) => {
        const result = await api.me(userHeadersConfig)
        const { email, firstName, lastName } = result.data.data.me

        expect(email).toContain('admin@test.com')
        expect(firstName).toContain('test')
        expect(lastName).toContain('test')
        done()
      })
    })
  })

  describe('users: [User!]', () => {
    it('should returns a list of users', async (done) => {
      const result = await api.users(userHeadersConfig)
      expect(result.data.data.users.length).toBeGreaterThan(2)
      done()
    })
  })

  describe('deleteUser(id: String!): Boolean!', () => {
    it('should admin user is able to delete a user', async (done) => {
      const expectedNewUser = {
        email: 'deleteuser@ishouty.com',
        firstName: 'test ',
        lastName: 'test',
        password: 'test@1234',
        userType: 'user',
      }

      await api.signUp(expectedNewUser, userHeadersConfig)

      const newUser = await db.models.User.findOne({
        email: expectedNewUser.email,
      })

      const deleteUserResult = await api.deleteUser(
        {
          id: newUser._id,
        },
        userHeadersConfig,
      )

      expect(deleteUserResult.data.data.deleteUser).toBeTruthy()
      done()
    })

    it('should return an error because only admins can delete a user', async (done) => {
      const expectedNewUser = {
        email: 'deleteUser@ishouty.com',
        firstName: 'test ',
        lastName: 'test',
        password: 'Test@1234',
        userType: 'user',
      }

      const newUser = await api.signUp(
        expectedNewUser,
        userHeadersConfig,
      )

      const loginNewUser = await api.signIn({
        client_id: 'android',
        grant_type: 'password',
        client_secret: 'SomeRandomCharsAndNumbers',
        username: expectedNewUser.email,
        password: expectedNewUser.password,
      })

      headersConfigUser.headers.Authorization = `Bearer ${loginNewUser.data.access_token}`

      const deleteUserResult = await api.deleteUser(
        { id: loginNewUser.data.userId },
        headersConfigUser,
      )

      expect(deleteUserResult.data.errors[0].message).toContain(
        'Sorry, you cannot access this feature.',
      )
      done()
    })
  })

  describe('update user ', () => {
    describe('updateUser(username: String!): User!', () => {
      it('should be able to update user details if userType is admin', async (done) => {
        const signedIn = await api.signIn({
          client_id: 'android',
          grant_type: 'password',
          client_secret: 'SomeRandomCharsAndNumbers',
          username: 'admin@test.com',
          password: 'Test@1234',
        })

        userHeadersConfig.headers.Authorization = `Bearer ${signedIn.data.access_token}`

        const expectedUpdatedUser = {
          id: expectedUser.id,
          email: 'user@test.com',
          firstName: 'andy huhu',
          lastName: 'nguyen',
          userType: 'user',
        }

        const result = await api.updateUser(
          expectedUpdatedUser,
          userHeadersConfig,
        )
        const resultUpdatedUser = result.data.data.updateUser

        expect(resultUpdatedUser.id).toEqual(expectedUpdatedUser.id)
        expect(resultUpdatedUser.email).toEqual(
          expectedUpdatedUser.email,
        )
        expect(resultUpdatedUser.firstName).toEqual(
          expectedUpdatedUser.firstName,
        )
        expect(resultUpdatedUser.lastName).toEqual(
          expectedUpdatedUser.lastName,
        )
        expect(resultUpdatedUser.userType).toEqual(
          expectedUpdatedUser.userType,
        )
        done()
      })

      it('should be able to update user details if user is the owner', async (done) => {
        const signedIn = await api.signIn({
          client_id: 'android',
          grant_type: 'password',
          client_secret: 'SomeRandomCharsAndNumbers',
          username: 'user@test.com',
          password: 'Test@1234',
        })

        const { userId, access_token } = signedIn.data

        const expectedUpdatedUser = {
          id: userId,
          email: 'user@test.com',
          firstName: 'owner',
          lastName: 'changed',
          userType: 'user',
        }

        const updatedResult = await api.updateUser(
          expectedUpdatedUser,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${access_token}`,
              client: 'android',
            },
          },
        )

        const updatedUserResult = updatedResult.data.data.updateUser

        expect(updatedUserResult.id).toEqual(expectedUpdatedUser.id)
        expect(updatedUserResult.email).toEqual(
          expectedUpdatedUser.email,
        )
        expect(updatedUserResult.firstName).toEqual(
          expectedUpdatedUser.firstName,
        )
        expect(updatedUserResult.lastName).toEqual(
          expectedUpdatedUser.lastName,
        )
        expect(updatedUserResult.userType).toEqual(
          expectedUpdatedUser.userType,
        )
        done()
      })

      it('should return error permission if user is not owner or admin ', async (done) => {
        const signedIn = await api.signIn({
          client_id: 'android',
          grant_type: 'password',
          client_secret: 'SomeRandomCharsAndNumbers',
          username: 'user@test.com',
          password: 'Test@1234',
        })

        const { access_token } = signedIn.data

        const expectedUpdatedUser = {
          id: 'fakeId',
          email: 'user@test.com',
          firstName: 'owner',
          lastName: 'changed',
          userType: 'user',
        }

        const updatedResult = await api.updateUser(
          expectedUpdatedUser,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${access_token}`,
              client: 'android',
            },
          },
        )

        expect(updatedResult.data.errors[0].message).toEqual(
          'You do not have permissions',
        )
        done()
      })
    })
  })
})
