import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { SessionClient } from "../../auth/_model";
import { Employee } from "../_model";
import { EmployeeValidator } from "../_setup";

const registerEmployee = new Elysia()
    .post("/register", async ({ set, body }) => {
    const { email, password, fullName, profile, employeeId, department, title } = body as any;

        try {
            const checkEmail = await SessionClient.findOne({ email })
            if (checkEmail) {
                return ErrorHandler.ValidationError(set, "The email provided is already in use.")
            }

            const clientPayload: any = {
                email,
                fullName,
                role: ["employee"],
                profile
            }
            if (password && String(password).trim().length > 0) {
                clientPayload.password = password
            }
            const newClient = await SessionClient.create(clientPayload)

            if (!newClient) {
                return ErrorHandler.ServerError(
                    set,
                    "Error while creating employee session"
                );
            }

            const newEmployee = await Employee.create({
                sessionClientId: newClient._id,
                fullName: fullName,
                employeeId,
                department,
                title
            })

            if (!newEmployee) {
                await SessionClient.findByIdAndDelete(newClient._id)
                return ErrorHandler.ServerError(
                    set,
                    "Error while creating employee"
                );
            }

            return SuccessHandler(
                set,
                "Employee Created",
                {
                    employee: newEmployee,
                },
                true
            )
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error registering employee",
                error
            );
        }
    }, EmployeeValidator.create)

export default registerEmployee
