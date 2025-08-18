import Elysia from "elysia";
import { EmployeeValidator } from "../_setup";
import ErrorHandler from "../../../services/errorHandler.service";
import { SessionClient } from "../../auth/_model";
import SuccessHandler from "../../../services/successHandler.service";
import { Employee } from "../_model";
import AuthHandler from "../../../services/authHandler.service";
import { jwtSessionAccess, jwtSessionRefresh } from "../../../middleware/jwt.middleware";

const signEmployee = new Elysia()
    .use(jwtSessionAccess)
    .use(jwtSessionRefresh)
    .post("/sign", async ({
        cookie: { sessionAccess, sessionRefresh },
        request,
        sessionAccessJwt,
        sessionRefreshJwt,
        headers,
        set,
        body
    }) => {
        try {
            const { email, password } = body as any;

            const checkClient = await SessionClient.findOne({ email })
            if (!checkClient) {
                return ErrorHandler.ValidationError(set, "Invalid credentials")
            }

            const checkPassword = await checkClient.comparePassword(password)
            if (!checkPassword) {
                return ErrorHandler.ValidationError(set, "Invalid credentials")
            }

            const employee = await Employee.findOne({ sessionClientId: checkClient._id })
            if (!employee) {
                return ErrorHandler.ValidationError(set, "Invalid credentials")
            }

            await AuthHandler.signSession(
                set,
                checkClient,
                request,
                headers,
                sessionAccess,
                sessionRefresh,
                sessionAccessJwt,
                sessionRefreshJwt
            )

            return SuccessHandler(
                set,
                "Employee Signed In",
                {
                    _id: employee._id.toString(),
                    sessionClientId: employee.sessionClientId.toString(),
                    employeeId: employee.employeeId,
                    department: employee.department,
                    title: employee.title
                }
            )
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error signing employee",
                error
            )
        }
    }, EmployeeValidator.login)

export default signEmployee
