import * as api from './api'
import models, { connectDb } from '../../src/models'
import moment from 'moment'
import mongoose from 'mongoose'

let db
let productHeadersConfig = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: '',
    clientId: 'android',
  },
}
let productAdminHeadersConfig = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: '',
    clientId: 'android',
  },
}

describe('product', () => {
  beforeEach(async (done) => {
    jest.clearAllMocks()

    db = await connectDb('mongodb://localhost:27017/test-apollo')

    const signedIn = await api.signIn({
      client_id: 'android',
      grant_type: 'password',
      client_secret: 'SomeRandomCharsAndNumbers',
      username: 'admin@test.com',
      password: 'Test@1234',
    })

    productHeadersConfig.headers.Authorization = `Bearer ${signedIn.data.access_token}`

    done()
  })

  afterEach(async (done) => {
    await db.connection.close()
    done()
  })

  describe('Query', () => {
    describe('products(filter: Filter, limit: Int): [Product]', () => {
      it('should get an error when requesting list of products if not authenicated', async (done) => {
        const result = await api.products({}, {})
        expect(result.response.data.errors[0].message).toContain(
          'Context creation failed: Please log in before making this request',
        )
        done()
      })

      it('should get a list of products', async (done) => {
        const result = await api.products({}, productHeadersConfig)
        const { products } = result.data.data
        expect(products.length).toBeGreaterThan(1)
        done()
      })

      it('should get a list of products with filter userId', async (done) => {
        const expectedProduct = await models.Product.findOne()

        const result = await api.products(
          { filter: { userId: expectedProduct.userId } },
          productHeadersConfig,
        )

        result.data.data.products.map((product, index) => {
          expect(product.userId).toEqual(expectedProduct.userId)
        })
        done()
      })

      it('should get a list of products with filter title', async (done) => {
        const expectedProduct = await models.Product.findOne()
        const result = await api.products(
          { filter: { title: expectedProduct.title } },
          productHeadersConfig,
        )

        result.data.data.products.map((product) => {
          expect(product.title).toContain(expectedProduct.title)
        })
        done()
      })

      it('should get a list of products with filter description', async (done) => {
        const expectedProduct = await models.Product.findOne()
        const result = await api.products(
          { filter: { description: expectedProduct.description } },
          productHeadersConfig,
        )

        result.data.data.products.map((product) => {
          expect(product.description).toContain(
            expectedProduct.description,
          )
          expect(product.title).toContain(expectedProduct.title)
        })
        done()
      })

      it('should get a list of products with filter date range between', async (done) => {
        const expectedProduct = await models.Product.findOne()
        const dateResult = await api.products(
          {
            filter: {
              dateBetween: {
                startDate: expectedProduct.createdAt,
                endDate: expectedProduct.createdAt,
              },
            },
          },
          productHeadersConfig,
        )

        dateResult.data.data.products.map((product) => {
          expect(product.description).toContain(
            expectedProduct.description,
          )
          expect(moment(product.createdAt).format()).toEqual(
            moment(expectedProduct.createdAt).format(),
          )
        })

        done()
      })
    })

    describe('product(id: ID!): Product!', () => {
      it('should get product details', async (done) => {
        const expectedProduct = await models.Product.findOne()

        const result = await api.product(
          { id: expectedProduct._id },
          productHeadersConfig,
        )

        const {
          title,
          description,
          productId,
        } = result.data.data.product

        expect(title).toContain(expectedProduct.title)
        expect(description).toContain(expectedProduct.description)
        expect(productId).toContain(expectedProduct._id)
        done()
      })
    })
  })

  describe('Mutation', () => {
    describe('createProduct', () => {
      it('should be able to create a product', async (done) => {
        const me = await api.me(productHeadersConfig)

        const expectedTitle = `Example title - ${Math.random()}`
        const expectedDescription = `Example description - ${Math.random()}`

        const createResult = await api.createProduct(
          {
            userId: me.data.data.me.id,
            title: expectedTitle,
            description: expectedDescription,
            price: 20,
            imagesUrl: ['test'],
          },
          productHeadersConfig,
        )

        const createdProductId =
          createResult.data.data.createProduct.productId

        const product = await api.product(
          { id: createdProductId },
          productHeadersConfig,
        )

        const {
          userId,
          productId,
          title,
          description,
        } = product.data.data.product

        expect(productId).toContain(createdProductId)
        expect(title).toContain(expectedTitle)
        expect(description).toContain(expectedDescription)

        const removeProduct = await models.Product.remove({
          _id: mongoose.Types.ObjectId(productId),
        })

        done()
      })

      it('should throw an error if not admin or authenticated', async (done) => {
        const expectedTitle = `Example title - ${Math.random()}`
        const expectedDescription = `Example description - ${Math.random()}`

        const createResult = await api.createProduct(
          {
            userId: '2u292u9u2',
            title: expectedTitle,
            description: expectedDescription,
            price: 20,
            imagesUrl: ['test'],
          },
          {},
        )

        expect(
          createResult.response.data.errors[0].message,
        ).toContain(
          'Context creation failed: Please log in before making this request',
        )

        done()
      })
    })

    describe('editProduct( id: $id userId: $userId title: $title description: $description price: $price imagesUrl: $imagesUrl ) : Product!', () => {
      it('user should be able to edit a product', async (done) => {
        const existingProduct = await models.Product.findOne()
        const title = 'update product test 123'
        const price = 45

        const updatedProduct = await api.editProduct(
          {
            id: existingProduct._id,
            userId: existingProduct._userId,
            title: title,
            description: 'updated product description',
            imagesUrl: [],
            price: price,
          },
          productHeadersConfig,
        )

        expect(updatedProduct.data.data.editProduct).toEqual({
          title: title,
          description: 'updated product description',
          price: price,
          productId: mongoose.Types.ObjectId(
            existingProduct._id,
          ).toString(),
          userId: mongoose.Types.ObjectId(
            existingProduct._userId,
          ).toString(),
          imagesUrl: [],
        })

        done()
      })
    })

    describe('deleteProduct(id: ID!): Boolean', () => {
      it('should be able to delete a product as an admin user', async (done) => {
        const signedIn = await api.signIn({
          client_id: 'android',
          grant_type: 'password',
          client_secret: 'SomeRandomCharsAndNumbers',
          username: 'admin@test.com',
          password: 'Test@1234',
        })
        productAdminHeadersConfig.headers.Authorization = `Bearer ${signedIn.data.access_token}`

        const expectedTitle = `Example title - delete product - ${Math.random()}`
        const expectedDescription = `Example description - delete product - ${Math.random()}`
        const me = await api.me(productAdminHeadersConfig)

        const createResult = await api.createProduct(
          {
            userId: me.data.data.me.id,
            title: expectedTitle,
            description: expectedDescription,
            price: 20,
            imagesUrl: ['test'],
          },
          productAdminHeadersConfig,
        )

        const createdProductId =
          createResult.data.data.createProduct.productId

        const deleteProduct = await api.deleteProduct(
          { id: createdProductId },
          productAdminHeadersConfig,
        )

        expect(deleteProduct.data.data.deleteProduct).toBeTruthy()

        done()
      })
    })

    it.skip('should not be able to delete product if not the owner or admin', async () => {})
  })
})
