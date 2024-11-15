import { CREATED, SuccessResponse } from '../core/success.response.js';
import AccessService from '../services/access.service.js';
import { AttributeGroupService } from '../services/attributeGroup.service.js';

class AttributeGroupController {
    create = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new attribute success',
            metadata: await AttributeGroupService.createNew(req.body),
        }).send(res);
    };

    delete = async (req, res, next) => {
        new SuccessResponse({
            message: 'delete attribute success',
            metadata: await AttributeGroupService.deleteById(req.body),
        }).send(res);
    };

    update = async (req, res, next) => {
        new SuccessResponse({
            message: 'update attribute success',
            metadata: await AttributeGroupService.updateById(req.body),
        }).send(res);
    };
}
export default new AttributeGroupController();
