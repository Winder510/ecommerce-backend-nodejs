import {
    CategoryService
} from '../services/category.service.js';
import {
    SuccessResponse
} from '../core/success.response.js';

class CategoryController {
    static async createCategory(req, res, next) {
        const {
            name,
            description,
            parentId,
            thumb
        } = req.body;

        const result = await CategoryService.createCategory({
            name,
            description,
            parentId,
            thumb
        });

        new SuccessResponse({
            message: 'Category created successfully',
            metadata: result,
        }).send(res);
    }

    static async updateCategory(req, res, next) {
        const {
            id
        } = req.params;
        const {
            name,
            description,
            thumb
        } = req.body;

        const result = await CategoryService.updateCategory({
            categoryId: id,
            name,
            description,
            thumb
        });

        new SuccessResponse({
            message: 'Category updated successfully',
            metadata: result,
        }).send(res);
    }

    static async deleteCategory(req, res, next) {
        const {
            id
        } = req.params;

        const result = await CategoryService.deleteCategory({
            categoryId: id,
        });

        new SuccessResponse({
            message: 'Category deleted successfully',
            metadata: result,
        }).send(res);
    }

    static async getAllCategory(req, res, next) {
        new SuccessResponse({
            message: 'get all category success',
            metadata: await CategoryService.getCategories(),
        }).send(res);
    }

    static async findOne(req, res, next) {
        new SuccessResponse({
            message: 'get all category success',
            metadata: await CategoryService.findOne({
                ...req.params
            }),
        }).send(res);
    }

}

export default CategoryController;