import mongoose from 'mongoose';

export interface IVisitor {
    sessionClientId: mongoose.Types.ObjectId;
    name: string;
    phone?: string;
}

const visitorSchema = new mongoose.Schema<IVisitor>({
    sessionClientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SessionClient',
    },
    name: { type: String, required: true },
    phone: { type: String, default: '' }
}, { timestamps: true });

export const Visitor = mongoose.model<IVisitor>('Visitor', visitorSchema);
