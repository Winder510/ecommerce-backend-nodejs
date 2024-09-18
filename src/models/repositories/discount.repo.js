import {
    getSelectData,
    unGetSelectData
} from "../../utils";


export const findAllDiscountCodeUnSelect = async ({
    limit = 50,
    page = 1,
    sort = 'ctime',
    filter,
    unSelect,
    model
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? {
        _id: -1
    } : {
        _id: 1
    }
    const discounts = await model.find(filter).sort(sortBy).skip(skip).limit(limit).select(unGetSelectData(unSelect)).lean();

    return discounts;
}


export const findAllDiscountCodeSelect = async ({
    limit = 50,
    page = 1,
    sort = 'ctime',
    filter,
    select,
    model
}) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? {
        _id: -1
    } : {
        _id: 1
    }
    const discounts = await model.find(filter).sort(sortBy).skip(skip).limit(limit).select(getSelectData(select)).lean();

    return discounts;
}

export const checkDiscountExists = async ({
    filter
}) => {
    const foundDiscount = await discountModel.findOne(filter).lean();
    return foundDiscount
}