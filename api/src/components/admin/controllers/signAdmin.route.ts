import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import { SessionClient } from "../../auth/_model";
import SuccessHandler from "../../../services/successHandler.service";
import AuthHandler from "../../../services/authHandler.service";
import { jwtSessionAccess, jwtSessionRefresh } from "../../../middleware/jwt.middleware";
import { AdminValidator } from "../_setup";
import { Admin } from "../_model";

const signAdmin = new Elysia()
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
            const { email, password } = body;

            const checkAdmin = await SessionClient.findOne({ email })
            if (!checkAdmin) {
                return ErrorHandler.ValidationError(set, "Invalid credentials")
            }

            const checkPassword = await checkAdmin.comparePassword(password)
            if (!checkPassword) {
                return ErrorHandler.ValidationError(set, "Invalid credentials")
            }

            const admin = await Admin.findOne({ sessionClientId: checkAdmin._id })
            if (!admin) {
                return ErrorHandler.ValidationError(set, "Invalid credentials")
            }

            // set cookies
            await AuthHandler.signSession(
                set,
                checkAdmin,
                request,
                headers,
                sessionAccess,
                sessionRefresh,
                sessionAccessJwt,
                sessionRefreshJwt
            )



            return SuccessHandler(
                set,
                "Admin Signed In",
                {
                    ...admin.toObject(),
                    sessionClientId: admin.sessionClientId.toString(),
                    _id: (admin._id as string | { toString(): string }).toString()
                }
            )
        } catch (error) {
            return ErrorHandler.ServerError(set, "Error signing admin")
        }
    }, AdminValidator.login)


export default signAdmin