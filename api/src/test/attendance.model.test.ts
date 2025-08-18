import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import connectDB from "../configs/db.config";
import mongoose from "mongoose";
import { Attendance } from "../components/attendance/_model";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  // Close Mongoose connection after tests
  await mongoose.connection.close();
});

describe("Attendance model validations", () => {
  it("rejects invalid action", async () => {
    let error: any;
    try {
      // @ts-ignore testing invalid enum
      await Attendance.create({ actorType: 'employee', actorId: new mongoose.Types.ObjectId(), action: 'INVALID' });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
  });

  it("rejects invalid actorType", async () => {
    let error: any;
    try {
      // @ts-ignore testing invalid enum
      await Attendance.create({ actorType: 'something', actorId: new mongoose.Types.ObjectId(), action: 'IN' });
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();
  });

  it("creates valid employee and visitor attendance records", async () => {
    const empRec = await Attendance.create({ actorType: 'employee', actorId: new mongoose.Types.ObjectId(), action: 'IN' });
    expect(empRec._id).toBeDefined();
    const visRec = await Attendance.create({ actorType: 'visitor', actorId: new mongoose.Types.ObjectId(), action: 'OUT', hostEmployeeId: new mongoose.Types.ObjectId() });
    expect(visRec._id).toBeDefined();
  });
});
