const Category = require('../models/category').default;

const response = require('../helpers/response');

const getAllCategory = async (req, res) => {
    try {
        let { name_search, limit, page } = req.query;
        if(!limit) {
            limit = 10;
        }
        const offset = page ? (parseInt(page) - 1) * parseInt(limit) : 0;
        if(!page) {
            page = 1;
        }
        let results = await Category.getAll(name_search, limit, offset);
        if (results.length < 1) {
            return response.notFound(res);
        }
        response.success(res, results, results.length);
    } catch (error) {
        response.internalError(res, error.message);
    }
}
const getDetailCategory = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return response.falseRequirement(res, 'id');
    }

    try {
        let category = new Category(id);
        let result = await category.read();
        if (result == -1) {
            return response.notFound(res);
        }
        response.success(res, category);        
    } catch (error) {
        response.internalError(res, error.message);
    }
}

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;             
        if(!name) {
            return response.falseRequirement(res, 'name');
        }
        let category = new Category("", name);
        await category.create();
        return response.upsert(res, category, 'created');
    } catch (error) {
        response.internalError(res, error.message);
    }
}

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if(!id) {
            return response.falseRequirement(res, 'id');
        }
        if(!name) {
            return response.falseRequirement(res, 'name');
        }

        let category = new Category(id, name);
        const result = await category.update();

        if (!result) {
            return response.notFound(res);
        }
        response.upsert(res, category, 'updated');
    } catch (error) {
        response.internalError(res, error.message);
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id) {
            return response.falseRequirement(res, 'id');
        }
        let category = new Category(parseInt(id));
        const result = await category.delete();
        if(!result) {
            return response.notFound(res);
        }
        return response.upsert(res, category, 'deleted');
    } catch (error) {
        response.internalError(res, error.message);
    }
}
module.exports = {
    getAllCategory,
    getDetailCategory,
    createCategory,
    updateCategory,
    deleteCategory
};