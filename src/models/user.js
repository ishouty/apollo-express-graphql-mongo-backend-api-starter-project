import mongoose from 'mongoose'
import crypto from 'crypto'
import { isEmail } from 'validator'
import { userInputErrorResponse } from '../constants/index'

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  created: {
    type: Date,
    default: Date.now,
  },
})

//mongoosejs.com/docs/guide.html#methods -> do not use arrow functions loses context of this
userSchema.methods.encryptPassword = function (password) {
  return crypto
    .createHmac('sha1', this.salt)
    .update(password)
    .digest('hex')
  //more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512).toString('hex');
}

//mongoosejs.com/docs/guide.html#methods -> do not use arrow functions loses context of this
userSchema.methods.checkPassword = function (password, user) {
  return this.encryptPassword(password) === this.hashedPassword
}

userSchema.virtual('userId').get(function () {
  return this.id
})

userSchema
  .virtual('password')
  .set(function (password) {
    this._plainPassword = password
    this.salt = crypto.randomBytes(32).toString('hex')
    this.hashedPassword = this.encryptPassword(password)
  })
  .get(() => {
    return this._plainPassword
  })

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(32).toString('hex')
  this._plainPassword = password
  this.hashedPassword = this.encryptPassword(password)
}

const User = mongoose.model('User', userSchema)

export default User
