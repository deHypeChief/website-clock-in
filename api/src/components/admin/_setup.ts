import { t } from 'elysia'

export const AdminValidator = {
    create: {
        body: t.Object({
            email: t.String({
                format: 'email',
                error: "Invalid email format."
            }),
            password: t.String({
                minLength: 6,
                pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).+$",
                error: "Password should be at least 6 characters and include uppercase, lowercase, number, and special character."
            }),
            fullName: t.String({ minLength: 3, maxLength: 50, error: "Full name should be between 3 and 50 characters." })
        }),
        query: t.Object({
            role: t.Enum({ user: 'admin', developer: 'developer', creator: 'creator' }, {
                error: "Invalid role provided. Valid roles are: admin, developer, creator."
            })
        }),
        response: t.Object({
            success: t.Boolean(),
            message: t.String(),
            data: t.Optional(t.Object({
                sessionClientId: t.String(),
                adminTitle: t.String(),
                permissions: t.Array(t.String()),
                isSuperAmdin: t.Boolean(),
                _id: t.String(),
                __v: t.Number()
            }))
        }),
        detail: {
            tags: ['Admin']
        }
    },
    login: {
        body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String()
        }),
        response: t.Optional(t.Object({
            success: t.Boolean(),
            message: t.String(),
            data: t.Object({
                sessionClientId: t.String(),
                adminTitle: t.String(),
                permissions: t.Array(t.String()),
                isSuperAmdin: t.Boolean(),
                _id: t.String(),
                __v: t.Number()
            })
        })),
        detail: {
            tags: ['Admin']
        }
    },
    authStatus: {
        response: t.Object({
            success: t.Boolean(),
            message: t.String(),
            data: t.Object({
                isAuthenticated: t.Boolean(),
                session: t.Object({
                    _id: t.String(),
                    email: t.String({ format: 'email' }),
                    profile: t.String(),
                    fullName: t.String(),
                    role: t.Array(t.String()),
                    sessions: t.Array(t.String()),
                    isSocialAuth: t.Boolean(),
                    isEmailVerified: t.Boolean(),
                    createdAt: t.String(),
                    updatedAt: t.String(),
                    __v: t.Number()
                }),
                admin: t.Object({
                    _id: t.String(),
                    sessionClientId: t.String(),
                    adminTitle: t.String(),
                    permissions: t.Array(t.String()),
                    isSuperAmdin: t.Boolean(),
                    __v: t.Number()
                })
            })
        }),
        detail: {
            tags: ['Admin'],
            description: "Get admin info once the admin has signed in"
        }
    }
}