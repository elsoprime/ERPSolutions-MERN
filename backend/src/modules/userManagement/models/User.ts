/**
 * @description User model definition
 * @module models/User
 * @requires mongoose
 * @author Esteban Leonardo Soto @elsoprimeDev
 */

import mongoose, {Schema, Document, Types} from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  status: string
  confirmed: boolean
  role: string
  companyId: Types.ObjectId
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: false
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    required: false
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'EnhancedCompany',
    required: false
  }
})

const User = mongoose.model<IUser>('User', UserSchema)
export default User
