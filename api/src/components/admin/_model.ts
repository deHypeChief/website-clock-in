import mongoose, { Document, Schema, Model, model } from "mongoose";

const permissionsList = ["all", "read", "write"] as const;

interface IAdmin extends Document {
    sessionClientId: mongoose.Types.ObjectId;
    adminTitle: string;
    permissions: string[];
    isSuperAmdin: boolean;
}

const AdminSchema: Schema = new Schema({
    sessionClientId: { type: mongoose.Schema.Types.ObjectId, ref: "SessionClient"},
    adminTitle: { type: String, default: "" },
    permissions: { type: [String], enum: permissionsList},
    isSuperAmdin: {type: Boolean, default: false }
});

const Admin: Model<IAdmin> = model<IAdmin>("Admin", AdminSchema);

export { Admin, IAdmin, permissionsList };