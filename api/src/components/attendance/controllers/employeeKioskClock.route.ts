import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { Attendance } from "../_model";
import { AttendanceValidator } from "../_setup";
import { Employee } from "../../employees/_model";

// Public kiosk clock route for employees (no auth)
const employeeKioskClock = new Elysia({ prefix: "/employee" })
  .post("/kiosk-clock", async ({ set, body }) => {
    try {
      const { employeeId, action } = body as any;
      if (!employeeId) return ErrorHandler.ValidationError(set, "employeeId is required");

      const employee = await Employee.findOne({ employeeId });
      if (!employee) return ErrorHandler.ValidationError(set, "Employee not found");

      // Determine implied action if not provided: alternate last action
      const last = await Attendance.findOne({ actorType: 'employee', actorId: employee._id }).sort({ timestamp: -1 });
      let finalAction = action;
      if (!finalAction) {
        finalAction = last?.action === 'IN' ? 'OUT' : 'IN';
      }

      // Enforce valid sequence: cannot IN twice in a row, cannot OUT if not currently IN
      if (finalAction === 'IN') {
        if (last?.action === 'IN') {
          return ErrorHandler.ValidationError(set, 'Already clocked in. Please clock out first.');
        }
      } else if (finalAction === 'OUT') {
        if (!last || last.action !== 'IN') {
          return ErrorHandler.ValidationError(set, 'You are not clocked in. Please clock in first.');
        }
      }

      const record = await Attendance.create({
        actorType: 'employee',
        actorId: employee._id,
        action: finalAction,
        timestamp: new Date()
      });

      return SuccessHandler(set, `Employee clock ${finalAction}`, record, true)
    } catch (error) {
      return ErrorHandler.ServerError(set, "Error clocking employee (kiosk)", error)
    }
  }, AttendanceValidator.employeeKioskClock);

export default employeeKioskClock;
