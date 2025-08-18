import { t } from 'elysia'

export const VisitorValidator = {
    create: {
        body: t.Object({
            profile: t.Optional(t.String()),
            fullName: t.String({ minLength: 3 }),
            email: t.String({ format: 'email' }),
            password: t.String({ minLength: 6 }),
            name: t.String({ minLength: 2 }),
            phone: t.Optional(t.String())
        }),
        detail: { tags: ['Visitor'] }
    },
    login: {
        body: t.Object({ email: t.String({ format: 'email' }), password: t.String() }),
        detail: { tags: ['Visitor'] }
    },
    authStatus: {
        detail: { tags: ['Visitor'], description: 'Get visitor info once signed in' }
    }
}
