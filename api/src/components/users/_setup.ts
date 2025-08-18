import { t } from 'elysia'

export const UserValidator = {
    create: {
        body: t.Object({
            profile: t.String(),
            username: t.String({ minLength: 3, maxLength: 50 }),
            email: t.String({ format: 'email' }),
            password: t.String({ minLength: 8 }),
            fullName: t.String(),
            phoneNumber: t.String(),
            gender: t.Enum({ male: 'male', female: 'female', other: 'other' }),
            dateOfBirth: t.String({ format: 'date' }),
            referalToken: t.String()
        }),
        query: t.Object({
            role: t.Enum({ user: 'user' }, {
                error: "Invalid role provided. Valid role is: user."
            })
        }),
        response: t.Optional(
            t.Object({
                success: t.Boolean(),
                message: t.String(),
                data: t.Object({
                    user: t.Object({
                        sessionClientId: t.String(),
                        username: t.String(),
                        phoneNumber: t.String(),
                        dateOfBirth: t.String({ format: 'date-time' }),
                        gender: t.Enum({ male: 'male', female: 'female', other: 'other' }),
                        _id: t.String(),
                        createdAt: t.String({ format: 'date-time' }),
                        updatedAt: t.String({ format: 'date-time' }),
                        __v: t.Number()
                    })
                })
            })
        ),
        detail: {
            tags: ['User']
        }
    },
    login: {
        body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String()
        }),
        response: t.Optional(
            t.Object({
                success: t.Boolean(),
                message: t.String(),
                data: t.Object({
                    _id: t.String(),
                    sessionClientId: t.String(),
                    username: t.String(),
                    phoneNumber: t.String(),
                    dateOfBirth: t.String(),
                    gender: t.Enum({ male: 'male', female: 'female', other: 'other' }),
                    __v: t.Number()
                })
            })
        ),
        detail: {
            tags: ['User']
        }
    },
    oauth: {
        params: t.Object({
            type: t.Enum({ google: "google", instagram: "instagram", x: "x" })
        }),
        query: t.Object({
            xUsername: t.Optional(t.String())
        }),
        response: t.Optional(
            t.Object({
                success: t.Boolean(),
                message: t.String(),
                data: t.Record(t.String(), t.Any()) // Can be more specific if needed
            })
        ),
        detail: {
            tags: ['User']
        }
    },
    usernameLinking: {
        params: t.Object({
            type: t.Enum({ x: "x" })
        }),
        query: t.Object({
            username: t.String({ minLength: 3, maxLength: 50 })
        }),
        response: t.Optional(
            t.Object({
                success: t.Boolean(),
                message: t.String(),
                data: t.Record(t.String(), t.Any()) // Can be more specific if needed
            })
        ),
        detail: {
            tags: ['User'],
            description: 'Link a username to the user account'
        }
    },
    authStatus: {
        response: t.Optional(
            t.Object({
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
                        createdAt: t.String({ format: 'date-time' }),
                        updatedAt: t.String({ format: 'date-time' }),
                        __v: t.Number()
                    }),
                    user: t.Object({
                        _id: t.String(),
                        sessionClientId: t.String(),
                        username: t.String(),
                        phoneNumber: t.String(),
                        dateOfBirth: t.String({ format: 'date-time' }),
                        gender: t.Enum({ male: 'male', female: 'female', other: 'other' }),
                        __v: t.Number()
                    })
                })
            })
        ),
        detail: {
            tags: ['User'],
            description: "Get user info once the user is signed in"
        }
    },
    getUser: {
        detail: {
            tags: ['Admin'],
            description: 'Fetches all single users full profile.'
        }
    }
}