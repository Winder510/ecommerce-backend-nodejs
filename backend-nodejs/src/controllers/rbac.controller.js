import {
    SuccessResponse
} from '../core/success.response.js';
import {
    createRole,
    getListResource,
    getListRole,
    createResource,
    getListRoleForSelect,
    getAllRoleWithGrant,
    updateRolePermission
} from '../services/rbac.service.js';

const newRole = async (req, res, next) => {
    new SuccessResponse({
        message: 'create role',
        metadata: await createRole(req.body),
    }).send(res);
};
const newResource = async (req, res, next) => {
    new SuccessResponse({
        message: 'create Resource',
        metadata: await createResource(req.body),
    }).send(res);
};
const listResource = async (req, res, next) => {
    new SuccessResponse({
        message: 'listResource listResource',
        metadata: await getListResource(req.body),
    }).send(res);
};
const listRole = async (req, res, next) => {
    new SuccessResponse({
        message: 'listRole',
        metadata: await getListRole(req.body),
    }).send(res);
};



///



const listRoleForDisplay = async (req, res, next) => {
    new SuccessResponse({
        message: 'listRole',
        metadata: await getListRoleForSelect(req.body),
    }).send(res);
};

const allRoleWithGrant = async (req, res, next) => {
    new SuccessResponse({
        message: 'listRole',
        metadata: await getAllRoleWithGrant(),
    }).send(res);
};


const updateRole = async (req, res, next) => {
    new SuccessResponse({
        message: 'update role',
        metadata: await updateRolePermission(req.body),
    }).send(res);
};

export {
    newRole,
    newResource,
    listRole,
    listResource,
    listRoleForDisplay,
    allRoleWithGrant,
    updateRole
};