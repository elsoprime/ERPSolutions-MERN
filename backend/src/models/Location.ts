/** Autor: @elsoprimeDev */

import mongoose, {Schema, Document} from 'mongoose'

export interface ILocation extends Document {
  region: string
  province: string
  comuna: string
}

const LocationSchema: Schema = new Schema(
  {
    region: {
      type: String,
      required: true
    },
    province: {
      type: String,
      required: true
    },
    comuna: {
      type: String,
      required: true
    }
  },
  {timestamps: true}
)

const Location = mongoose.model<ILocation>('Location', LocationSchema)
export default Location
