import _ from 'lodash'

export const getInfoData = ({
    fields = [],
    object = {}
}) => {
    return _.pick(object, fields)
}

export const getSelectData = (select) => {
    return Object.fromEntries(select.map(e => [e, 1]))
}

export const unGetSelectData = (unSelect) => {
    return Object.fromEntries(unSelect.map(e => [e, 0]))
}

export const removeUndefinedNullObject = (obj) => {
    const result = {};

    Object.keys(obj).forEach((k) => {
        const current = obj[k];

        if ([null, undefined].includes(current)) return;
        if (Array.isArray(current)) return;

        if (typeof current === "object") {
            result[k] = removeUndefinedNullObject(current);
            return;
        }

        result[k] = current;
    });

    return result;
};