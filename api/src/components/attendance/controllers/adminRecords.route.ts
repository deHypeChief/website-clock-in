import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { Attendance } from "../_model";
import { AttendanceValidator } from "../_setup";
import { isSessionAuth } from "../../../middleware/authSession.middleware";
import { Employee } from "../../employees/_model";
import { Visitor } from "../../visitors/_model";
import { SessionClient } from "../../auth/_model";

const adminRecords = new Elysia({ prefix: "/admin" })
    .use(isSessionAuth("admin"))
    .get("/records", async ({ set, query }) => {
        try {
            const { actorType, actorId, from, to } = query as any;
            const filter: any = {};
            if (actorType) filter.actorType = actorType;
            if (actorId) filter.actorId = actorId;
            if (from || to) {
                filter.timestamp = {} as any
                if (from) (filter.timestamp as any).$gte = new Date(from)
                if (to) (filter.timestamp as any).$lte = new Date(to)
            }

            // Fetch base attendance records first (lean for performance)
            const baseRecords = await Attendance.find(filter)
                .sort({ timestamp: -1 })
                .lean();

            if (baseRecords.length === 0) {
                return SuccessHandler(set, "Attendance records fetched", baseRecords)
            }

            // Collect referenced IDs for enrichment
            const employeeActorIds = new Set<string>();
            const visitorActorIds = new Set<string>();
            const hostEmployeeIds = new Set<string>();

            for (const r of baseRecords as any[]) {
                if (r.actorType === 'employee' && r.actorId) employeeActorIds.add(String(r.actorId));
                if (r.actorType === 'visitor' && r.actorId) visitorActorIds.add(String(r.actorId));
                if (r.hostEmployeeId) hostEmployeeIds.add(String(r.hostEmployeeId));
            }

            // Load employees (actors and hosts), with sessionClient populated
            const allEmployeeIds = Array.from(new Set<string>([...employeeActorIds, ...hostEmployeeIds]));
            const employees = allEmployeeIds.length
                ? await Employee.find({ _id: { $in: allEmployeeIds } })
                    .populate('sessionClientId')
                    .lean()
                : [];
            const employeeMap = new Map<string, any>(employees.map((e: any) => [String(e._id), e]));

            // Load visitors (actors)
            const visitors = visitorActorIds.size
                ? await Visitor.find({ _id: { $in: Array.from(visitorActorIds) } }).lean()
                : [];
            const visitorMap = new Map<string, any>(visitors.map((v: any) => [String(v._id), v]));

            // Attach populated refs
            const enriched = baseRecords.map((r: any) => {
                const actor = r.actorType === 'employee'
                    ? employeeMap.get(String(r.actorId)) || null
                    : visitorMap.get(String(r.actorId)) || null;
                const host = r.hostEmployeeId ? (employeeMap.get(String(r.hostEmployeeId)) || null) : null;
                return { ...r, actorId: actor, hostEmployeeId: host };
            });

            return SuccessHandler(set, "Attendance records fetched", enriched)
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error fetching attendance records", error)
        }
    }, AttendanceValidator.adminQuery)
    .post('/visitor/force-clock-out', async ({ set, body }) => {
        try {
            const { actorId, email, visitType } = (body || {}) as any;
            let visitorId = actorId;
            if (!visitorId && email) {
                const client = await SessionClient.findOne({ email }).lean();
                if (client) {
                    const visitor = await Visitor.findOne({ sessionClientId: client._id }).lean();
                    if (visitor) visitorId = String(visitor._id);
                }
            }
            if (!visitorId) return ErrorHandler.ValidationError(set, 'Visitor identifier required');

            // Check last action to ensure currently IN
            const match: any = { actorType: 'visitor', actorId: visitorId };
            if (visitType === 'inspection' || visitType === 'regular') match.visitType = visitType;
            const last = await Attendance.findOne(match)
                .sort({ timestamp: -1 })
                .lean();
            if (!last || last.action !== 'IN') {
                return ErrorHandler.ValidationError(set, 'Visitor is not currently clocked in');
            }

            const outRecord = await Attendance.create({
                actorType: 'visitor',
                actorId: visitorId,
                action: 'OUT',
                timestamp: new Date(),
                hostEmployeeId: last.hostEmployeeId,
                visitType: last.visitType || 'regular'
            });
            return SuccessHandler(set, 'Visitor clocked out by admin', outRecord, true);
        } catch (error) {
            return ErrorHandler.ServerError(set, 'Error force clocking out visitor', error);
        }
    })

export default adminRecords
