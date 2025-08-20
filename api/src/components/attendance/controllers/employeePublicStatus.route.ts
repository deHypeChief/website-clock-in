import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { Attendance } from "../_model";
import { AttendanceValidator } from "../_setup";
import { Employee } from "../../employees/_model";

// Public status for a specific employee by employeeId
const employeePublicStatus = new Elysia({ prefix: "/employee" })
  .get("/public-status", async ({ set, query }) => {
    try {
      const { employeeId, limit = 10 } = (query as any) || {};
      if (!employeeId) return ErrorHandler.ValidationError(set, "employeeId is required");

      const employee = await Employee.findOne({ employeeId }).populate('sessionClientId');
      if (!employee) return ErrorHandler.ValidationError(set, "Employee not found");

      const records = await Attendance.find({ actorType: 'employee', actorId: employee._id })
        .sort({ timestamp: -1 })
        .limit(Math.max(1, Math.min(Number(limit) || 10, 100)))
        .lean();

      const last = records[0];
      const currentlyClockedIn = last?.action === 'IN';
      const lastInAt = currentlyClockedIn ? last.timestamp : null;

      return SuccessHandler(set, "Employee status fetched", {
        employee,
        currentlyClockedIn,
        lastInAt,
        recentRecords: records
      });
    } catch (error) {
      return ErrorHandler.ServerError(set, "Error fetching employee public status", error);
    }
  }, AttendanceValidator.employeePublicStatus);

export default employeePublicStatus;
