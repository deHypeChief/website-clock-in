import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { Attendance } from "../_model";
import { Visitor } from "../../visitors/_model";
import { Employee } from "../../employees/_model";
import { SessionClient } from "../../auth/_model";

// Public kiosk clock route (no auth)
const visitorKioskClock = new Elysia({ prefix: "/visitor" })
  .post("/kiosk-clock", async ({ set, body }) => {
    try {
      const { email, name, action, hostEmployeeId, visitType } = body as any;
      if (!email || !name || !action) {
        return ErrorHandler.ValidationError(set, "Missing required fields");
      }

      let host: any = null;
      const isInspection = visitType === 'inspection';
      if (!isInspection) {
        if (!hostEmployeeId) return ErrorHandler.ValidationError(set, "Host employee is required for regular visits");
        host = await Employee.findById(hostEmployeeId);
        if (!host) return ErrorHandler.ValidationError(set, "Host employee not found");
      }

      let client = await SessionClient.findOne({ email });
      if (!client) {
        const tmpPass = Math.random().toString(36).slice(2) + Date.now().toString(36);
        client = await SessionClient.create({ email, password: tmpPass, fullName: name, role: ["visitor"] });
      } else if (!client.fullName) {
        client.fullName = name;
        await client.save();
      }

      let visitor = await Visitor.findOne({ sessionClientId: client._id });
      if (!visitor) {
        visitor = await Visitor.create({ sessionClientId: client._id, name });
      } else if (!visitor.name) {
        visitor.name = name;
        await visitor.save();
      }

      const record = await Attendance.create({
        actorType: 'visitor',
        actorId: visitor._id,
        hostEmployeeId: host?._id,
        visitType: isInspection ? 'inspection' : 'regular',
        action,
        timestamp: new Date()
      });

      return SuccessHandler(set, `Visitor clock ${action}`, record, true)
    } catch (error) {
      return ErrorHandler.ServerError(set, "Error clocking visitor (kiosk)", error)
    }
  });

export default visitorKioskClock;
