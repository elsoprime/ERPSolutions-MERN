import mongoose, {Schema, Document, Types} from 'mongoose'

/**
 * Modelo para tokens de confirmación y recuperación de contraseña
 * Incluye campos para tipo de token, estado de uso, fecha de expiración y control de intentos.
 * Utiliza un índice TTL para eliminar automáticamente tokens expirados.
 * Permite búsquedas eficientes mediante un índice compuesto.
 */

interface IToken extends Document {
  token: string
  user: Types.ObjectId
  type: 'confirmation' | 'recovery'
  used: boolean // Para marcar si el token ya fue usado en caso de recuperación de contraseña o confirmación
  createdAt: Date
  expiresAt: Date // Campo explícito para la expiración
  attempts: number // Para control de intentos
}

const TokenSchema: Schema = new Schema({
  token: {type: String, required: true, unique: true},
  user: {type: Types.ObjectId, ref: 'User', required: true},
  type: {type: String, enum: ['confirmation', 'recovery'], required: true},
  used: {type: Boolean, default: false},
  createdAt: {type: Date, default: Date.now},
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 3600000), // 1 hora desde creación
    index: {expires: 0} // TTL index para auto-eliminar documentos expirados
  },
  attempts: {type: Number, default: 0}
})

// Índice compuesto para búsquedas eficientes
TokenSchema.index({token: 1, type: 1})

const Token = mongoose.model<IToken>('Token', TokenSchema)

export default Token
