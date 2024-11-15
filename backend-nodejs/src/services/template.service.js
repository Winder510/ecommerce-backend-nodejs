import templateModel from '../models/template.model.js';
import { BadRequestError } from '../core/error.response.js';
import { htmlEmailRemind, htmlEmailToken } from '../utils/template.html.js';
const newTemplate = async ({ name = 'HTML EMAIL TOKEN', html = htmlEmailRemind() }) => {
    const foundTemp = await templateModel
        .findOne({
            temp_name: name,
        })
        .lean();

    if (foundTemp) throw new BadRequestError('Template already exists');

    const newTem = templateModel.create({
        temp_name: name, //unique
        temp_html: html,
    });

    return newTem;
};

const getTemplate = async ({ name }) => {
    const foundTemp = await templateModel
        .findOne({
            temp_name: name,
        })
        .lean();

    return foundTemp;
};

export { getTemplate, newTemplate };
