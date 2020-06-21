import mongoose from 'mongoose'

let RefreshToken = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    unique: true,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
})

RefreshToken.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

export default mongoose.model('RefreshToken', RefreshToken)
