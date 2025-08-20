import { t } from 'elysia'

export const AttendanceValidator = {
    employeeKioskClock: {
        body: t.Object({
            employeeId: t.String(),
            action: t.Optional(t.Enum({ IN: 'IN', OUT: 'OUT' }))
        }),
        detail: { tags: ['Attendance'] }
    },
    employeePublicStatus: {
        query: t.Object({
            employeeId: t.String(),
            limit: t.Optional(t.Number())
        }),
        detail: { tags: ['Attendance'] }
    },
    visitorClock: {
        body: t.Object({ 
            action: t.Enum({ IN: 'IN', OUT: 'OUT' }), 
            hostEmployeeId: t.Optional(t.String()),
            visitType: t.Optional(t.Enum({ regular: 'regular', inspection: 'inspection' }))
        }),
        detail: { tags: ['Attendance'] }
    },
    adminQuery: {
        query: t.Object({
            actorType: t.Optional(t.Enum({ employee: 'employee', visitor: 'visitor' })),
            actorId: t.Optional(t.String()),
            from: t.Optional(t.String()),
            to: t.Optional(t.String())
        }),
        detail: { tags: ['Attendance'] }
    }
}
 