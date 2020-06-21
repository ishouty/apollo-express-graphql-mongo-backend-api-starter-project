import mongoose from 'mongoose'

// AccessToken schema which is used for oauthorize framework to valid credentials
export const AccessTokenSchema = new mongoose.Schema({
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

AccessTokenSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 },
)

export default mongoose.model('AccessToken', AccessTokenSchema)
