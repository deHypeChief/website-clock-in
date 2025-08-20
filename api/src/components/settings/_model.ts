import { model, Schema } from "mongoose";

interface ISettingAdmin {
    lateCutoff?: string; // HH:mm (24h)
    taskType: {
        corePoint: number;
        dailyPoint: number;
        collabPoint: number;
        specialPoint: number;
        giveawayPoint: number;
        genOnePoint: number;
        directRefPoint: number;
    }
}

const SettingsAdminSchema = new Schema<ISettingAdmin>({
    lateCutoff: { type: String, default: "09:00" },
    taskType: {
        corePoint: { type: Number, default: 0 },
        dailyPoint: { type: Number, default: 0 },
        collabPoint: { type: Number, default: 0 },
        specialPoint: { type: Number, default: 0 },
        giveawayPoint: { type: Number, default: 0 },
        genOnePoint: { type: Number, default: 0 },
        directRefPoint: { type: Number, default: 0 },
    }
})

const SettngsAdmin = model<ISettingAdmin>("Settngs Admin", SettingsAdminSchema)

export { SettngsAdmin }