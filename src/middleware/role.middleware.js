import AccessControl from 'accesscontrol';

let grantList = [{
        role: 'admin',
        resource: 'profile',
        action: 'create:any',
        attributes: '*'
    },

    {
        role: 'user',
        resource: 'profile',
        action: 'delete:any',
        attributes: '*'
    }
];

export default new AccessControl(grantList)