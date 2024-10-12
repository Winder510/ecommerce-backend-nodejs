import categoryModel from '../models/category.model.js';
import {
    BadRequestError
} from '../core/error.response.js'
export class CategoryService {
    static async createCategory({
        name,
        description
    }) {
        const foungCategory = await categoryModel.findOne({
            category_name: name
        }).lean()

        if (foungCategory) throw new BadRequestError("Name of category is exists")

        const newCategory = await categoryModel.create({
            category_name: name,
            category_description: description,
        })

        return newCategory;
    }

    static async updateCategory({
        categoryId,
        name,
        description
    }) {
        const category = await categoryModel.findById(categoryId);
        if (!category) {
            throw new BadRequestError("CategoryId not found")
        }

        category.category_name = name;
        category.category_description = description;

        const updatedCategory = await category.save();

        return updatedCategory;

    }

    static async deleteCategory({
        categoryId
    }) {
        // Find and delete the category by its ID
        const deletedCategory = await categoryModel.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            throw new BadRequestError('Category not found');
        }

        return deletedCategory;

    }
}