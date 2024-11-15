import { SuccessResponse } from '../core/success.response.js';
import { newTemplate } from '../services/template.service.js';

class TemplateController {
    newTemplate = async (req, res, next) => {
        return new SuccessResponse({
            message: 'create new template',
            metadata: await newTemplate(req.body),
        }).send(res);
    };
}

export default new TemplateController();
