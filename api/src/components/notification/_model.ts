import { model, Schema, Types } from "mongoose";

interface INotifyUser {
    sessionId: Types.ObjectId;
    type: string;
    title: string;
    message: string;
    createdAt?: Date;
}

interface INotifyAdmin {
    type: string;
    message: string;
    title: string;
}


const NotifyUserSchema = new Schema<INotifyUser>({
    sessionId: {
        type: Schema.Types.ObjectId,
        ref: 'SessionClient',
    },
    type: {
        type: String,
    },
    title: {
        type: String,
    },
    message: {
        type: String,
    }
}, { timestamps: true })

NotifyUserSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const NotifyAdminSchema = new Schema<INotifyAdmin>({
    type: {
        type: String,
    },
    title: {
        type: String,
    },
    message: {
        type: String,
    }
}, { timestamps: true })

NotifyAdminSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });


export const NotifyUser = model<INotifyUser>('NotificationUser', NotifyUserSchema)
export const NotifyAdmin = model<INotifyAdmin>('NotificationAdmin,', NotifyAdminSchema)