import { Cookie } from "elysia";
import { SessionAuthConfig } from "../configs/auth.config";
import { Session, SessionClient } from "../components/auth/_model";
import { JWTPayloadSpec } from "@elysiajs/jwt";
import ErrorHandler from "./errorHandler.service";
import { HTTPHeaders } from "elysia/dist/types";
import { ElysiaCookie } from "elysia/dist/cookies";

class AuthHandler {
    private static setSessionCookie(
        cookieAccess: Cookie<string | undefined>,
        accessToken: string,
        cookieRefresh: Cookie<string | undefined>,
        refreshToken: string
    ) {
        cookieAccess.set({
            value: accessToken,
            ...SessionAuthConfig.accessToken.cookie
        })
        cookieRefresh.set({
            value: refreshToken,
            ...SessionAuthConfig.refreshToken.cookie
        })
    }


    private static async handleRefreshToken(
        set: { headers: HTTPHeaders; status?: number | string; redirect?: string; cookie?: Record<string, ElysiaCookie> },
        sessionId: string,
        refreshToken: string,
        accessToken: string,
        refreshMetadata: {
            ipAddress: string;
            userAgent: string;
        }
    ) {
        try {
            const { ipAddress, userAgent } = refreshMetadata;

            const session = await SessionClient.findById(sessionId);

            if (!session) {
                throw new Error('Session not found');
            }

            const existingRefreshToken = await Session.findOne({
                sessionClientId: session._id,
                userAgent,
            });

            if (existingRefreshToken) {
                existingRefreshToken.lastAccessed = new Date();
                existingRefreshToken.refreshToken = refreshToken;
                existingRefreshToken.accessToken = accessToken;
                await existingRefreshToken.save();
            } else {
                const newSession = await Session.create({
                    sessionClientId: session._id,
                    refreshToken,
                    accessToken,
                    ip: ipAddress,
                    userAgent,
                    lastAccessed: new Date(),
                });

                session.sessions.push(newSession._id);
                await session.save();
            }

            return {
                tokenData: {
                    email: session.email,
                    role: session.role,
                    sessionId: session._id.toString()
                }
            };
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error while handling refresh token",
                error
            )
        }
    }


    static async signSession(
        set: { headers: HTTPHeaders; status?: number | string; redirect?: string; cookie?: Record<string, ElysiaCookie> },
        session: any,
        request: Request,
        headers: Record<string, string | undefined>,
        cookieAccess: Cookie<string | undefined>,
        cookieRefresh: Cookie<string | undefined>,
        sessionAccessJwt: { sign: any; verify?: (jwt?: string) => Promise<false | (Record<string, string | number> & JWTPayloadSpec)>; },
        sessionRefreshJwt: { sign: any; verify?: (jwt?: string) => Promise<false | (Record<string, string | number> & JWTPayloadSpec)>; }
    ) {
        try {
            const plainSession = session.toObject ? session.toObject() : session;

            const tokenPayload = {
                sessionClientId: plainSession._id.toString(),
                email: plainSession.email,
                role: plainSession.role
            };

            const [accessToken, refreshToken] = await Promise.all([
                sessionAccessJwt.sign(tokenPayload),
                sessionRefreshJwt.sign(tokenPayload),
            ]);

            const directIp = request.headers.get('x-forwarded-for')?.split(',')[0]
                || request.headers.get('cf-connecting-ip')
                || request.headers.get('x-real-ip')
                || 'Unknown';

            this.setSessionCookie(
                cookieAccess,
                accessToken,
                cookieRefresh,
                refreshToken
            )

            const sessionClient = await this.handleRefreshToken(set, session._id, refreshToken, accessToken, {
                ipAddress: directIp,
                userAgent: headers["user-agent"] as string
            })

            return { sessionClient }
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error while signing session",
                error
            )
        }
    }
}

export default AuthHandler;