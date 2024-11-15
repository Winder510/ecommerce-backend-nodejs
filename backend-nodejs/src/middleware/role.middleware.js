import AccessControl from 'accesscontrol';

// let grantList = [{
//         role: 'admin',
//         resource: 'profile',
//         action: 'create:any',
//         attributes: '*',
//     },
//     {
//         role: 'user',
//         resource: 'profile',
//         action: 'delete:any',
//         attributes: '*',
//     },
//     {
//         role: 'user',
//         resource: 'profile',
//         action: 'read:own',
//         attributes: '*',
//     },
// ];

export default new AccessControl();