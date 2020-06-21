import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0.0,
    },
    imagesUrl: {
      type: Array,
      required: false,
      default: [],
    },
    _userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

productSchema.virtual('productId').get(function () {
  return this.id.toString()
})

productSchema.virtual('userId').get(function () {
  return this._userId.toString()
})

const Product = mongoose.model('Product', productSchema)

export default Product
