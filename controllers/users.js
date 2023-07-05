const User = require('../models/user').default;

const response = require('../helpers/response');
const sha256 = require('sha256');
const jwt = require('jsonwebtoken');


const getAllUser = async (req, res) => {
    try {
        let { name_search, limit, page } = req.query;
        if(!limit) {
            limit = 10;
        }
        const offset = page ? (parseInt(page) - 1) * parseInt(limit) : 0;
        if(!page) {
            page = 1;
        }
        let results = await User.getAll(name_search, limit, offset);
        if (results.length < 1) {
            return response.notFound(res);
        }
        response.success(res, results);
    } catch (error) {
        response.internalError(res, error.message);
    }
}

const createUser = async (req, res) => {
    try {
        const { username, password, level, fullname, phone_number, address } = req.body;             
        if(!username) {
            return response.falseRequirement(res, 'username');
        }
        if(!password) {
            return response.falseRequirement(res, 'password');
        }
        if(level === undefined || level === null) {
            return response.falseRequirement(res, 'level');
        }
        if(!fullname) {
            return response.falseRequirement(res, 'fullname');
        }
        if(!phone_number) {
            return response.falseRequirement(res, 'phone_number');
        }
        if(!address) {
            return response.falseRequirement(res, 'address');
        }
        const hashPassword = sha256(password);

        let user = new User("", username, hashPassword, level, fullname, phone_number, address);
        await user.create();
        return response.upsert(res, user, 'created');
    } catch (error) {
        response.internalError(res, error.message);
    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password, level } = req.body;    
        if(!username) {
            return response.falseRequirement(res, 'username');
        }
        if(!password) {
            return response.falseRequirement(res, 'password');
        }
        if(level === null || level === undefined) {
            return response.falseRequirement(res, 'level');
        }

        const hashPassword = sha256(password);
        let user = new User("", username, hashPassword, level, 0, 
        "", 0);
        const result = await user.login();
        if(!result) {
            return response.loginFailed(res);
        }
        const token = jwt.sign({ data: result }, 'SECRET', {
            expiresIn: '12h'
        });
        return response.loginSuccess(res, user, token);
    } catch (error) {
        response.internalError(res, error.message);
    }
}

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        let { username, level, fullname, phone_number, address, password } = req.body;             
        
        if(!username) {
            return response.falseRequirement(res, 'username');
        }
        if(level === undefined || level === null) {
            return response.falseRequirement(res, 'level');
        }
        if(!fullname) {
            return response.falseRequirement(res, 'fullname');
        }
        if(!phone_number) {
            return response.falseRequirement(res, 'phone_number');
        }
        if(!address) {
            return response.falseRequirement(res, 'address');
        }                
        if (password) {            
            password = sha256(password);
        }
        let user = new User(id, username, password, level, fullname, phone_number, address, 0);
        
        const result = await user.update();
        if (!result) {
            return response.notFound(res);
        }
        return response.upsert(res, user, 'updated');
    } catch (error) {
        response.internalError(res, error.message);
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id) {
            return response.falseRequirement(res, 'id');
        }
        let user = new User(id);
        const result = await user.delete();
        if(!result) {
            return response.notFound(res);
        }
        return response.upsert(res, user, 'deleted');
    } catch (error) {
        response.internalError(res, error.message);
    }
}
module.exports = {
    createUser,
    loginUser,
    getAllUser,
    updateUser,
    deleteUser

};