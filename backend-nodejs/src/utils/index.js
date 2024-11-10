import _ from 'lodash';
import mongoose from 'mongoose';

export const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick(object, fields);
};

export const getSelectData = (select) => {
    return Object.fromEntries(select.map((e) => [e, 1]));
};

export const unGetSelectData = (unSelect) => {
    return Object.fromEntries(unSelect.map((e) => [e, 0]));
};

export const removeUndefinedNullObject = (obj) => {
    const result = {};

    Object.keys(obj).forEach((k) => {
        const current = obj[k];

        if ([null, undefined].includes(current)) return;
        if (Array.isArray(current)) return;

        if (typeof current === 'object') {
            result[k] = removeUndefinedNullObject(current);
            return;
        }

        result[k] = current;
    });

    return result;
};
export const convertToObjectIdMongodb = (id) => mongoose.Types.ObjectId(id);

export const replacePlaceHolder = ({ template, params }) => {
    Object.keys(params).forEach((k) => {
        const placeholer = `{{${k}}}`;
        template = template.replace(new RegExp(placeholer, 'g'), params[k]);
    });

    return template;
};

export function getUsernameFromEmail(email) {
    const username = email.split('@')[0];
    return username;
}

export function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}
export const randomNummber = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

export async function processSale(spuId, quantity) {
    await spuModel.findByIdAndUpdate(spuId, {
        $inc: {
            totalSold: quantity,
        },
    });
    await skuModel.findOneAndUpdate(
        {
            spuId,
        },
        {
            $inc: {
                quantitySold: quantity,
            },
        },
    );
}

export const updateStockStatus = function (quantity) {
    if (quantity === 0) {
        return 'out of stock';
    } else if (quantity > 0 && quantity < 5) {
        return 'low stock';
    } else {
        return 'in stock';
    }
};
