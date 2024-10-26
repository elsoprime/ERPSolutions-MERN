/** Autor:@elsoprimeDev */
import mongoose, {Schema, Document, Types} from 'mongoose'

//Definimos el estado de la Instalación
const factilityStatus = {
  INACTIVE: 'inactive',
  ACTIVE: 'active'
} as const

export type FacilityStatus =
  (typeof factilityStatus)[keyof typeof factilityStatus]

// Definimos la Interfaz del Modelo
export interface IFacility extends Document {
  nameFacility: string
  systemType: string
  facilitySystem: string
  feeder: string
  startService: Date
  operationMode: string
  startMode: string
  installedPower: number
  availablePower: number
  profileImage: string
  location: {
    region: string
    province: string
    comuna: string
  }
  status: FacilityStatus
  company: Types.ObjectId
  generators: Types.ObjectId[]
}

export const FacilitySchema: Schema = new Schema(
  {
    nameFacility: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    systemType: {
      type: String,
      trim: true,
      required: true
    },
    facilitySystem: {
      type: String,
      trim: true,
      required: true
    },
    feeder: {
      type: String,
      trim: true,
      required: true
    },
    startService: {
      type: Date,
      required: true
    },
    operationMode: {
      type: String,
      trim: true,
      required: true
    },
    startMode: {
      type: String,
      trim: true,
      required: true
    },
    installedPower: {
      type: Number,
      required: true
    },
    availablePower: {
      type: Number,
      required: true
    },
    profileImage: {
      type: String,
      required: false
    },
    location: {
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
    status: {
      type: String,
      enum: Object.values(factilityStatus),
      default: factilityStatus.ACTIVE
    },
    company: {
      type: Types.ObjectId,
      ref: 'Company'
    },
    generators: [
      {
        type: Types.ObjectId,
        ref: 'Generator'
      }
    ]
  },
  {timestamps: true}
)

const Facility = mongoose.model<IFacility>('Facility', FacilitySchema)
export default Facility
