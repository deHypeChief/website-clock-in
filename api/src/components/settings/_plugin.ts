import Elysia from "elysia";
import { isSessionAuth } from "../../middleware/authSession.middleware";
import { SettngsAdmin } from "./_model";
import { SettingsValidator } from "./_setup";
import SuccessHandler from "../../services/successHandler.service";
import ErrorHandler from "../../services/errorHandler.service";

const settingsPlugin = new Elysia({ prefix: "/settings" })
  // Get current lateCutoff (public for UI rendering)
  .get("/late-cutoff", async ({ set }) => {
    try {
      const doc = await SettngsAdmin.findOne();
      const lateCutoff = doc?.lateCutoff || "09:00";
      return SuccessHandler(set, "Late cutoff fetched", { lateCutoff }, true);
    } catch (error) {
      return ErrorHandler.ServerError(set, "Error fetching settings", error);
    }
  })
  // Set lateCutoff (admin only)
  .use(isSessionAuth("admin"))
  .post("/late-cutoff", async ({ set, body }) => {
    try {
      const { lateCutoff } = body as any;
      const doc = await SettngsAdmin.findOne();
      if (doc) {
        doc.lateCutoff = lateCutoff;
        await doc.save();
      } else {
        await SettngsAdmin.create({ lateCutoff, taskType: {} as any });
      }
      return SuccessHandler(set, "Late cutoff saved", { lateCutoff }, true);
    } catch (error) {
      return ErrorHandler.ServerError(set, "Error saving settings", error);
    }
  }, SettingsValidator.setLateCutoff);

export default settingsPlugin;
