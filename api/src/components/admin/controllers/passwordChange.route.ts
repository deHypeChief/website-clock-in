import Elysia, { t } from 'elysia';
import { isSessionAuth } from '../../../middleware/authSession.middleware';
import ErrorHandler from '../../../services/errorHandler.service';
import SuccessHandler from '../../../services/successHandler.service';
import { SessionClient } from '../../auth/_model';

const passwordChange = new Elysia()
  .use(isSessionAuth('admin'))
  .post('/password/change', async ({ set, body, store }) => {
    try {
      const { currentPassword, newPassword } = body;
      const sessionData: any = (store as any);
      const session = sessionData.session;

      if (!session?._id) {
        return ErrorHandler.UnauthorizedError(set, 'Invalid session');
      }

      const clientWithPassword = await SessionClient.findById(session._id);
      if (!clientWithPassword) {
        return ErrorHandler.UnauthorizedError(set, 'Session client not found');
      }

      if (!clientWithPassword.password) {
        return ErrorHandler.ValidationError(set, 'Password change not allowed for social accounts');
      }

      const matches = await Bun.password.verify(currentPassword, clientWithPassword.password);
      if (!matches) {
        return ErrorHandler.ValidationError(set, 'Current password is incorrect');
      }

      clientWithPassword.password = newPassword; // hashed by pre-save hook
      await clientWithPassword.save();

      return SuccessHandler(set, 'Password updated successfully', undefined, true);
    } catch (err) {
      return ErrorHandler.ServerError(set, 'Error changing password', err);
    }
  }, {
    body: t.Object({
      currentPassword: t.String({ minLength: 6 }),
      newPassword: t.String({ minLength: 6 })
    })
  });

export default passwordChange;
