/** Autor:@elsoprimeDev */

import mongoose, { Schema, Document } from 'mongoose';

export type PersonsType = Document & {
    dni: string;
    name: string;
    lastname: string;
    date: Date;
    gender: string;
    address: string;
    phone: string;
    region: string;
    province: string;
    commune: string;
    education: string;
    license: string;
    dateContract: Date;
    afp: string;
    isapre: string;
    bank: string;
    status: string;
    companyId: mongoose.Types.ObjectId;
};

const PersonsSchema: Schema = new Schema({
    dni: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    region: {
        type: String,
        required: true,
    },
    province: {
        type: String,
        required: true,
    },
    commune: {
        type: String,
        required: true,
    },
    education: {
        type: String,
        required: true,
    },
    license: {
        type: String,
        required: true,
    },
    dateContract: {
        type: Date,
        required: true,
    },
    afp: {
        type: String,
        required: true,
    },
    isapre: {
        type: String,
        required: true,
    },
    bank: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
});

const Persons = mongoose.model<PersonsType>('Persons', PersonsSchema);
export default Persons;
