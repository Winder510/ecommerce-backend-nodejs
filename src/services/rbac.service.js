import {
    BadRequestError
} from "../core/error.response.js";
import resourceModel from "../models/resource.model.js"
import roleModel from "../models/role.model.js";

const createResource = async ({
    name,
    slug,
    description
}) => {

    const resourceExists = await resourceModel.findOne({
        $or: [{
                src_name: name
            },
            {
                src_slug: slug
            }
        ]
    });

    if (resourceExists) throw new BadRequestError("Exists resource")


    const resource = await resourceModel.create({
        src_name: name,
        src_description: description,
        src_slug: slug
    })
    return resource
}
const getListResource = async ({
    userId,
    limit = 30,
    offset = 0,
    search
}) => {
    // check admin tai middleware

    const resource = await resourceModel.aggregate([{
        $project: {
            _id: 0,
            name: '$src_name',
            slug: '$src_slug',
            description: '$src_description',
            resourceId: '$_id',
            createAt: 1
        }
    }])
    return resource
}
const createRole = async ({
    name,
    slug,
    description,
    grants = []
}) => {

    // check exists

    const roleExists = await roleModel.findOne({
        $or: [{
                rol_name: name
            },
            {
                rol_slug: slug
            }, {
                rol_grants: grants,
            }
        ]
    });

    if (roleExists) throw new BadRequestError("Exists role")

    // 
    const role = await roleModel.create({
        rol_name: name,
        rol_slug: slug,
        rol_description: description,
        rol_grants: grants,
    })

    return role;
}
const getListRole = async () => {
    // 
    const roles = await roleModel.aggregate([{
            $unwind: '$rol_grants',

        }, {
            $lookup: {
                from: 'Resources',
                localField: 'rol_grants.resource',
                foreignField: "_id",
                as: 'resource'
            }
        }, {

            $unwind: '$resource',
        },
        {
            $project: {
                role: "$rol_name",
                resource: "$resource.src_name",
                action: "$rol_grants.actions",
                attributes: "$rol_grants.attributes",
                _id: 0
            }
        }, {

            $unwind: '$action',
        },


    ])

    return roles
}
export {
    getListRole,
    createResource,
    getListResource,
    createRole
}