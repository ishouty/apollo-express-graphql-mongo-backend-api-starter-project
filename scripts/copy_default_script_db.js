import models, { connectDb } from '../src/models'
import { model } from 'mongoose'

const init = async () => {
  console.log('*********** CONNECTING DATABASE *************')

  const db = await connectDb('mongodb://localhost:27017/test-apollo')
}

const create_initial_users = async () => {
  // will need to change this to the right path to database

  const newAdminUser = await models.User.create({
    userType: 'admin',
    email: 'admin-dummy4@test.com',
    password: 'Test@1234',
    firstName: 'test',
    lastName: 'test',
  })

  console.log('*********** 1. CREATED ADMIN USER *************')
  console.log(newAdminUser)
  console.log('*********** 1. CREATED ADMIN USER *************')

  const newUser = await models.User.create({
    email: 'user4@test.com',
    firstName: 'test',
    lastName: 'test',
    userType: 'user',
    password: 'Test@1234',
  })

  console.log('*********** 2. CREATED USER *************')
  console.log(newUser)
  console.log('*********** 2. CREATED USER *************')
}

const create_initial_products = async () => {
  const user = await models.User.findOne()
  const expectedTitle = `Example title - ${Math.random()}`
  const expectedDescription = `Example description - ${Math.random()}`

  const newProduct = await models.Product.create({
    userId: user.id,
    title: expectedTitle,
    description: expectedDescription,
    price: 20,
    imagesUrl: ['test'],
  })

  console.log('*********** 3. CREATED PRODUCT *************')
  console.log(newProduct)
  console.log('*********** 3. CREATED PRODUCT *************')
}

const closeConnection = async () => {
  console.log('*********** CLOSING DATABASE *************')

  await db.connection.close()
  process.exit(1)
}

const create_initial_clients = async () => {
  const newClients = await models.Client.create({
    name: 'Android API v1',
    clientId: 'android',
    clientSecret: 'SomeRandomCharsAndNumbers',
  })

  console.log('*********** 4. CREATED CLIENT *************')
  console.log(newClients)
  console.log('*********** 4. CREATED CLIENT *************')
}

init()

create_initial_users()
create_initial_products()
create_initial_clients()

closeConnection()
