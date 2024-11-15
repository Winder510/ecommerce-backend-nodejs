import {
    AuthFailureError
} from '../core/error.response.js';
import {
    getListRole
} from '../services/rbac.service.js';
import rbac from './role.middleware.js';

/**
 * Middleware để kiểm tra quyền truy cập.
 * @param {string} action - Hành động muốn thực hiện (e.g., 'read', 'delete', 'update').
 * @param {string} resource - Tài nguyên cần truy cập (e.g., 'profile', 'order', 'discount').
 * @returns {function} Middleware function để kiểm tra quyền truy cập.
 */
const grantAccess = (action, resource) => {
    return async (req, res, next) => {
        try {
            rbac.setGrants(await getListRole())
            const roleName = req.user?.role || 'user'; // Lấy vai trò từ req.user hoặc mặc định là 'user'
            const permission = await rbac.can(roleName)[action](resource);

            if (!permission.granted) {
                throw new AuthFailureError("You don't have permission to access this route!");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export {
    grantAccess
};