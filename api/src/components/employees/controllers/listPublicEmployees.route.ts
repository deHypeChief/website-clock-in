import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { Employee } from "../_model";

// Public, minimal employees listing for kiosk/visitor host selection
const listPublicEmployees = new Elysia()
  .get("/public", async ({ set, query }) => {
    try {
      const { q } = (query as any) || {};
      let employees: any[];
      if (q && typeof q === 'string') {
        const regex = new RegExp(q, 'i');
        // Use aggregation to match against SessionClient.fullName too
        employees = await Employee.aggregate([
          {
            $lookup: {
              from: 'sessionclients',
              localField: 'sessionClientId',
              foreignField: '_id',
              as: 'sessionClientId'
            }
          },
          { $unwind: '$sessionClientId' },
          {
            $match: {
              $or: [
                { fullName: { $regex: regex } },
                { employeeId: { $regex: regex } },
                { department: { $regex: regex } },
                { 'sessionClientId.fullName': { $regex: regex } }
              ]
            }
          },
          { $project: { employeeId: 1, department: 1, title: 1, sessionClientId: 1 } }
        ]) as any[];
      } else {
        employees = await Employee.find()
          .populate("sessionClientId")
          .select("employeeId department title sessionClientId") as any;
      }
      return SuccessHandler(set, "Employees fetched", employees);
    } catch (error) {
      return ErrorHandler.ServerError(set, "Error fetching employees", error);
    }
  }, { detail: { tags: ["Employee"], description: "Public employees list (minimal fields)" } });

export default listPublicEmployees;
