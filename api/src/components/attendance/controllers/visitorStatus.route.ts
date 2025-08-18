import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { Attendance } from "../_model";
import { SessionClient } from "../../auth/_model";
import { Visitor } from "../../visitors/_model";

// Public status endpoint by email for visitor kiosk
const visitorStatus = new Elysia({ prefix: "/visitor" })
	.get("/status", async ({ set, query }) => {
		try {
			const { email, limit } = (query || {}) as any;
			if (!email || typeof email !== 'string') {
				return ErrorHandler.ValidationError(set, "Email is required");
			}
			const lim = Number(limit ?? 10);
			const client = await SessionClient.findOne({ email }).lean();
			if (!client) {
				return SuccessHandler(set, "Visitor status fetched", {
					currentlyClockedIn: false,
					recentRecords: []
				});
			}
			const visitor = await Visitor.findOne({ sessionClientId: client._id }).lean();
			if (!visitor) {
				return SuccessHandler(set, "Visitor status fetched", {
					currentlyClockedIn: false,
					recentRecords: []
				});
			}
			const records = await Attendance.find({ actorType: 'visitor', actorId: visitor._id })
				.sort({ timestamp: -1 })
				.limit(Math.max(1, Math.min(lim, 50)))
				.lean();
			const last = records[0];
			const currentlyClockedIn = last?.action === 'IN';
			return SuccessHandler(set, "Visitor status fetched", {
				currentlyClockedIn,
				recentRecords: records
			});
		} catch (error) {
			return ErrorHandler.ServerError(set, "Error fetching visitor status", error);
		}
	});

export default visitorStatus;
