/** Autor:@elsoprimeDev */

import mongoose, { Schema, Document, Types } from 'mongoose';

const categoryGenerator = {
    DIESEL: 'Diesel',
    WIND: 'Eolico',
    BESS: 'BESS',
    PHOTOVOLTAIC: 'Fotovoltaico',
    OTHER: 'Otros'
} as const

const generatorStatus = {
    OPERATIONAL: 'Operativo',
    MAINTENANCE: 'Mantenimiento',
    IDLE: 'INACTIVO'
} as const

export type TypesGenerator = typeof categoryGenerator[keyof typeof categoryGenerator]
export type GeneratorStatus = typeof generatorStatus[keyof typeof generatorStatus]

// Definimos un tipo para los equipos generadores
export interface IGenerator extends Document {
  name: string; 
  capacity: number; // Capacidad del generador en kW o MW
  location: string;
  manufacturer: string;
  installationDate: Date;
  status: GeneratorStatus;
  category: TypesGenerator;
  additionalInfo?: string; // Información adicional específica para el tipo de generador
}

// Esquema base para los equipos generadores
const GeneratorSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  }, 
  capacity: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  manufacturer: {
    type: String,
    required: true,
  },
  installationDate: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: Object.values(categoryGenerator),
    default: categoryGenerator.OTHER
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(generatorStatus),
    default: generatorStatus.IDLE
  },
  additionalInfo: {
    type: String,
  },

  plantId: {
    type: Schema.Types.ObjectId,
    ref:'Plant',
    required: true,
  },
  
}, { timestamps: true });

// Creación del modelo basado en el esquema
const Generator = mongoose.model<IGenerator>('Generator', GeneratorSchema);

export default Generator;
