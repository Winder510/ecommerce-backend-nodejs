import AccessControl from 'accesscontrol';

let grantList = [{
        "role": "admin",
        "resource": "order",
        "action": "read:any", // Cho get-all-for-admin, get-one-for-admin
        "attributes": "*"
    },
    {
        "role": "admin",
        "resource": "order",
        "action": "update:any", // Cho change-status
        "attributes": "*"
    },
    {
        "role": "user",
        "resource": "order",
        "action": "create:own", // Cho orderByUser
        "attributes": "*"
    }
];

export default new AccessControl(grantList);