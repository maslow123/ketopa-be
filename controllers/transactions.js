const Transaction = require('../models/transaction').default;
const response = require('../helpers/response');
const helper = require('../helpers/helper');

const getAllTransaction = async (req, res) => {
    try {
        const { start_date, end_date, user_id } = req.query;
        console.log({ user_id})
        let results = await Transaction.getAll(start_date, end_date, user_id);
        if (results.length < 1) {
            return response.notFound(res);
        }
        response.success(res, results, results.length);
    } catch (error) {
        response.internalError(res, error.message);
    }
}
const getDetailTransaction = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return response.falseRequirement(res, 'id');
    }

    try {
        let transaction = new Transaction(id);
        let result = await transaction.read();
        if (result == -1) {
            return response.notFound(res);
        }
        response.success(res, category);        
    } catch (error) {
        response.internalError(res, error.message);
    }
}

const createTransaction = async (req, res) => {
    try {
        const { user_id, products, evidence } = req.body;
        if (products.length < 1) {            
            return response.falseRequirement(res, 'products');
        }
        if(!user_id) {
            return response.falseRequirement(res, 'user_id');
        }
        if(!evidence) {
            return response.falseRequirement(res, 'evidence');
        }

        const transactionCode = helper.generateTransactionCode(11);
        for (let i in products) {
            const { product_id, quantity, total } = products[i];
            if(!product_id) {
                return response.falseRequirement(res, 'product_id');
            }
            
            if(!quantity) {
                return response.falseRequirement(res, 'quantity');
            }
            if(!total) {
                return response.falseRequirement(res, 'total');
            }
            
            let transaction = new Transaction("", product_id, user_id, transactionCode, quantity, total, 0, 0, evidence);
            await transaction.create();

            if (Number(i) === (products.length - 1)) {
                return response.upsert(res, {}, 'created');
            }
        }
    } catch (error) {
        response.internalError(res, error.message);
    }
}

const updateTransaction = async (req, res) => {
    try {
        const { transactionCode } = req.params;
        const { status } = req.body;

        if(!transactionCode) {
            return response.falseRequirement(res, 'transactionCode');
        }
        if((status === undefined || status === null) || (status < 0 && status > 3)) {
            return response.falseRequirement(res, 'status');
        }

        let transaction = new Transaction('', '', '', transactionCode, '', '', status);
        const result = await transaction.updateStatus();

        if (!result) {
            return response.notFound(res);
        }
        response.upsert(res, transaction, 'updated');
    } catch (error) {
        response.internalError(res, error.message);
    }
}

module.exports = {
    getAllTransaction,
    getDetailTransaction,
    createTransaction,
    updateTransaction
};