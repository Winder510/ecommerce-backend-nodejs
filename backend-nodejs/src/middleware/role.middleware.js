import AccessControl from 'accesscontrol';

const grantList = [{
        role: "admin",
        resource: "order",
        action: "read:any", // For get-all-for-admin, get-one-for-admin
        attributes: "*",
    },
    {
        role: "admin",
        resource: "order",
        action: "update:any", // For change-status
        attributes: "*",
    },
    {
        role: "user",
        resource: "order",
        action: "create:own", // For orderByUser
        attributes: "*",
    },
    {
        role: "user",
        resource: "order",
        action: "read:own", // For getOneOrderByUser, getListOrderByUser
        attributes: "*",
    },
    {
        role: "user",
        resource: "order",
        action: "update:own", // For cancelOrderByUser
        attributes: "*",
    },
];

export default new AccessControl(grantList);