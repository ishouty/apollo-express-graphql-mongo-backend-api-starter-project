import { combineResolvers, skip } from 'graphql-resolvers'
import { UserInputError, ApolloError } from 'apollo-server-express'
import mongoose from 'mongoose'
import { isAuthenticated, isProductOwnerOrAdmin } from './auth'
import { path } from 'ramda'

import { userType, sortType, errorResponse } from '../constants/index'
import { escape } from 'validator'
import logger from '../logger'
import moment from 'moment'

/**
 * filter function to
 * @param {*} filter
 */
export const productFilter = (filter) => {
  let filterItems = {
    ...filter,
  }

  if (path(['userId'], filterItems)) {
    filterItems._userId = mongoose.Types.ObjectId(filterItems.userId)
    delete filterItems.userId
  }

  if (path(['title'], filterItems)) {
    filterItems.title = new RegExp(`${filterItems.title}`, 'ig')
  }

  if (path(['description'], filterItems) !== undefined) {
    filterItems.description = new RegExp(
      `${filterItems.description}`,
      'ig',
    )
  }

  if (path(['dateBetween'], filterItems) !== undefined) {
    try {
      filterItems.createdAt = {
        $gte: moment(filterItems.dateBetween.startDate),
        $lte: moment(filterItems.dateBetween.endDate),
      }
      delete filterItems.dateBetween
    } catch (e) {
      throw new UserInputError(errorResponse.invalidDateEntered)
    }
  }

  logger.debug('productFilter : ', filterItems)

  return filterItems
}

export default {
  Query: {
    // return all products from list
    products: combineResolvers(
      isAuthenticated,
      async (
        parent,
        { filter, limit = 100, sort = { createdAt: sortType.asc } },
        { models },
      ) => {
        const filterItems = productFilter(filter)

        const products = await models.Product.find(
          filterItems,
          null,
          {
            limit: limit,
          },
        )

        return products
      },
    ),
    // return product by id
    product: combineResolvers(
      isAuthenticated,
      async (parent, { id } = args, { models, me } = context) => {
        return await models.Product.findById(id)
      },
    ),

    allUserProducts: combineResolvers(
      isAuthenticated,
      isProductOwnerOrAdmin,
      async (
        parent,
        { id, filter } = args,
        { me, models } = conext,
      ) => {
        const filterObj = {
          ...filter,
          id: id,
        }

        const products = models.Product.find(filterObj, null, {})
      },
    ),
  },

  Mutation: {
    createProduct: combineResolvers(
      isAuthenticated,
      async (
        parent,
        { userId, title, description, price, imagesUrl } = args,
        { models, me } = context,
      ) => {
        const user = me.userType == userType.admin ? userId : me._id

        let product = await models.Product.create({
          _userId: mongoose.Types.ObjectId(user),
          title: escape(title), // sanitizer html mark up for security
          description: escape(description), // sanitizer html mark up for security
          price,
          imagesUrl,
        })

        return product
      },
    ),

    editProduct: combineResolvers(
      isAuthenticated,
      isProductOwnerOrAdmin,
      async (
        parent,
        { id, title, description, price, imagesUrl, userId },
        { me, models },
      ) => {
        const product = await models.Product.findByIdAndUpdate(id, {
          title,
          description,
          price,
          imagesUrl,
          userId,
        })

        return product
      },
    ),

    deleteProduct: combineResolvers(
      isAuthenticated,
      isProductOwnerOrAdmin,
      async (parent, { id }, { me, models }) => {
        const product = await models.Product.findById(id)

        if (product) {
          await product.remove()
          return true
        }
        return false
      },
    ),
  },
}
