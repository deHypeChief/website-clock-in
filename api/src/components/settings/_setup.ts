import { t } from 'elysia'

export const SettingsValidator = {
  setLateCutoff: {
    body: t.Object({ lateCutoff: t.String({ pattern: "^([01]\\d|2[0-3]):[0-5]\\d$" }) }),
    detail: { tags: ['Settings'] }
  }
}
