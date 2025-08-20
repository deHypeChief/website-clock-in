import { t } from 'elysia'

export const EmployeeValidator = {
    create: {
        body: t.Object({
            profile: t.Optional(t.String()),
            fullName: t.String({ minLength: 3 }),
            email: t.String({ format: 'email' }),
            password: t.Optional(t.String({ minLength: 8 })),
            employeeId: t.String({ minLength: 2 }),
            department: t.Optional(t.String()),
            title: t.Optional(t.String()),
        }),
        response: t.Optional(
            t.Object({ success: t.Boolean(), message: t.String() })
        ),
        detail: { tags: ['Employee'] }
    },
    login: {
        body: t.Object({
            email: t.String({ format: 'email' }),
            password: t.String()
        }),
        detail: { tags: ['Employee'] }
    },
    authStatus: {
        detail: { tags: ['Employee'], description: 'Get employee info once signed in' }
    }
}
