import mongoose from 'mongoose';

export type AttendanceAction = 'IN' | 'OUT';
export type ActorType = 'employee' | 'visitor';
export type VisitType = 'regular' | 'inspection';

export interface IAttendanceRecord {
    actorType: ActorType;
    actorId: mongoose.Types.ObjectId; // Employee._id or Visitor._id
    timestamp: Date;
    action: AttendanceAction;
    hostEmployeeId?: mongoose.Types.ObjectId; // For visitors
    visitType?: VisitType; // For visitors: regular or inspection
}

const attendanceSchema = new mongoose.Schema<IAttendanceRecord>({
    actorType: { type: String, enum: ['employee', 'visitor'], required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    timestamp: { type: Date, default: Date.now },
    action: { type: String, enum: ['IN', 'OUT'], required: true },
    hostEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    visitType: { type: String, enum: ['regular', 'inspection'], default: 'regular' }
}, { timestamps: true });

export const Attendance = mongoose.model<IAttendanceRecord>('Attendance', attendanceSchema);
