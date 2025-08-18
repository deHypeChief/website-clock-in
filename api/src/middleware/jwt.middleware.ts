import { jwt } from '@elysiajs/jwt';
import Elysia from 'elysia'
import { SessionAuthConfig } from '../configs/auth.config';


export const jwtSessionAccess = new Elysia({
    name: "sessionAccessJwt",
}).use(
    jwt({
        name: "sessionAccessJwt",
        secret: Bun.env.JWT_SESSION_SECRET as string,
        exp: SessionAuthConfig.accessToken.jwtExp,
    })
);

export const jwtSessionRefresh = new Elysia({
    name: "sessionRefreshJwt",
}).use(
    jwt({
        name: "sessionRefreshJwt",
        secret: Bun.env.JWT_SESSION_SECRET as string,
        exp: SessionAuthConfig.refreshToken.jwtExp,
    })
);


export interface SessionPayload {
    sessionId: string;
    email: string;
    role: string;
}
