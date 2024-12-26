import {
    AuthFailureError,
    ForbiddenError
} from '../core/error.response.js';
import roleModel from '../models/role.model.js';
import userModel from '../models/user.model.js';

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

            //    rbac.setGrants(await getListRole())

            const user = await userModel.findById(req.user.userId).populate('usr_role');
            const roleName = user.usr_role.rol_name;
            console.log("🚀 ~ return ~ roleName:", roleName)


            const permission = await rbac.can(roleName)[action](resource);

            if (!permission.granted) {
                throw new ForbiddenError("You don't have permission to access this route!");
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