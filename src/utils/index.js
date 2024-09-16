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