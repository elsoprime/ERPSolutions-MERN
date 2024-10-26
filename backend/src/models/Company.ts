/** Autor:@elsoprimeDev */
/** Models Company */

import mongoose, {Schema, Document, PopulatedDoc, Types} from 'mongoose'
import {IFacility} from './Facility'

export interface ICompany extends Document {
  companyName: string
  rutOrDni: string
  description: string
  email: string
  incorporationDate: Date
  industry: string
  address: string
  phoneNumber: string
  facilities: PopulatedDoc<IFacility & Document>[]
}

export const CompanySchema: Schema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    rutOrDni: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: false,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    incorporationDate: {
      type: Date,
      required: true,
      set: (date: string | number | Date) => {
        const utcDate = new Date(date)
        utcDate.setUTCHours(0, 0, 0, 0) // Establecer la hora a medianoche UTC
        return utcDate
      }
    },
    industry: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: false,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: false,
      trim: true
    },
    facilities: [
      {
        type: Types.ObjectId,
        ref: 'Facility'
      }
    ]
  },
  {timestamps: true}
)

const Company = mongoose.model<ICompany>('Company', CompanySchema)
export default Company
