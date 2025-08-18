import mongoose from 'mongoose';

export interface IEmployee {
    sessionClientId: mongoose.Types.ObjectId;
    fullName?: string;
    employeeId: string;
    department?: string;
    title?: string;
}

const employeeSchema = new mongoose.Schema<IEmployee>({
    sessionClientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SessionClient',
    },
    fullName: {
        type: String,
        index: true,
        default: ''
    },
    employeeId: {
        type: String,
        required: true,
        unique: true,
    },
    department: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    }
}, { timestamps: true });

export const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);
