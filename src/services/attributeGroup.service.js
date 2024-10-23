import attributeGroupModel from '../models/attributeGroup.model.js';

export class AttributeGroupService {
    static async createNew(groupData) {
        const newAttributeGroup = new attributeGroupModel(groupData);

        const savedAttributeGroup = await newAttributeGroup.save();

        return savedAttributeGroup;
    }

    static async deleteById(groupId) {
        const deletedAttributeGroup = await attributeGroupModel.findOneAndDelete({
            groupId: groupId,
        });
        return deletedAttributeGroup;
    }

    // resend all properties like create if you want update
    static async updateById({ groupId, updateData }) {
        const updateOptions = {
            new: true,
        };
        const updatedAttributeGroup = await attributeGroupModel.findOneAndReplace(
            {
                _id: groupId,
            },
            updateData,
            updateOptions,
        );
        return updatedAttributeGroup;
    }
}
