import {
    AuthFailureError
} from '../core/error.response.js';
import rbac from './role.middleware.js'
/**
 * 
 * @param {string} action  // read ,delete,update,
 * @param {string} resource // profile, order, discount,...
 */
const grantAccess = (action, resource) => {

    return async (req, res, next) => {
        try {
            const rol_name = 'user';
            const permission = rbac.can(rol_name)[action](resource);
            if (!permission.granted) {
                throw new AuthFailureError("You don't have permission to access this route!!!")
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}

export {
    grantAccess
}