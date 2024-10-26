/** Autor: @elsoprimeDEV */

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    status: string;
    token: boolean;
    role: string;
    companyId: mongoose.Types.ObjectId;
}

const UserSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    token: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        required: true,
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
