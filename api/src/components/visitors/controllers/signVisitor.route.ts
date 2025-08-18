import Elysia from "elysia";
import { VisitorValidator } from "../_setup";
import ErrorHandler from "../../../services/errorHandler.service";
import { SessionClient } from "../../auth/_model";
import SuccessHandler from "../../../services/successHandler.service";
import { Visitor } from "../_model";
import AuthHandler from "../../../services/authHandler.service";
import { jwtSessionAccess, jwtSessionRefresh } from "../../../middleware/jwt.middleware";

const signVisitor = new Elysia()
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

            const visitor = await Visitor.findOne({ sessionClientId: checkClient._id })
            if (!visitor) {
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
                "Visitor Signed In",
                {
                    _id: visitor._id.toString(),
                    sessionClientId: visitor.sessionClientId.toString(),
                    name: visitor.name,
                    phone: visitor.phone
                }
            )
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error signing visitor",
                error
            )
        }
    }, VisitorValidator.login)

export default signVisitor
