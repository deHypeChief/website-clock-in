import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { isSessionAuth } from "../../../middleware/authSession.middleware";
import { Attendance } from "../_model";
import { Employee } from "../../employees/_model";

// Provides status and recent history for the currently authenticated employee
const employeeStatus = new Elysia({ prefix: "/employee" })
	.use(isSessionAuth("employee"))
	.get("/status", async ({ set, session, query }) => {
		try {
			const limit = Number((query as any)?.limit ?? 20);
			const employee = await Employee.findOne({ sessionClientId: session._id }).populate('sessionClientId');
			if (!employee) return ErrorHandler.ValidationError(set, "Employee profile not found");

			const records = await Attendance.find({ actorType: 'employee', actorId: employee._id })
				.sort({ timestamp: -1 })
				.limit(Math.max(1, Math.min(limit, 100)))
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
			return ErrorHandler.ServerError(set, "Error fetching employee status", error);
		}
	});

export default employeeStatus;
