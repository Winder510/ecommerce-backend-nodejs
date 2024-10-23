import categoryModel from '../models/category.model.js';
import { BadRequestError } from '../core/error.response.js';
export class CategoryService {
    static async createCategory({ name, description, parentId }) {
        const foungCategory = await categoryModel
            .findOne({
                category_name: name,
            })
            .lean();
        if (foungCategory) throw new BadRequestError('Name of category is exists');

        const newCategory = await categoryModel.create({
            category_name: name,
            category_description: description,
            category_parent_Id: parentId,
        });

        return newCategory;
    }

    static async updateCategory({ categoryId, name, description }) {
        const category = await categoryModel.findById(categoryId);
        if (!category) {
            throw new BadRequestError('CategoryId not found');
        }

        category.category_name = name;
        category.category_description = description;

        const updatedCategory = await category.save();

        return updatedCategory;
    }

    static async deleteCategory({ categoryId }) {
        // Find and delete the category by its ID
        const deletedCategory = await categoryModel.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            throw new BadRequestError('Category not found');
        }

        return deletedCategory;
    }
    static async getSubCategories(parentId) {
        const subCategories = await categoryModel
            .find({
                category_parentId: parentId,
            })
            .select('category_name category_description category_slug');

        return Promise.all(
            subCategories.map(async (subCategory) => {
                const children = await this.getSubCategories(subCategory._id); // Gọi đệ quy để lấy danh mục con
                return {
                    ...subCategory.toObject(),
                    children, // Thêm danh mục con vào danh mục cha
                };
            }),
        );
    }

    static async getCategories() {
        const categories = await categoryModel
            .find({
                category_parentId: null,
            })
            .select('category_name category_description category_slug');

        return Promise.all(
            categories.map(async (category) => {
                const children = await this.getSubCategories(category._id); // Lấy danh mục con cho từng danh mục cha
                return {
                    ...category.toObject(),
                    children, // Thêm danh mục con vào danh mục cha
                };
            }),
        );
    }

    static async getParentCategory() {
        return await categoryModel
            .find({
                category_parentId: null,
            })
            .select('category_name category_description category_slug')
            .lean();
    }
}
