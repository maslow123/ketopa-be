const DBTable = require('./dbtable').default;
const Product = require('./product').default;
const User = require('./user').default;

const conn = require('./index');


exports.default = class Transaction extends DBTable {
    constructor(id = "", product_id = 0, user_id = 0, transaction_code = '',  quantity = 0, total = 0, status = null, created_at = 0, evidence = '') {
        super(id, created_at);
        this.product = new Product(product_id);
        this.user = new User(user_id);
        this.transaction_code = transaction_code;
        this.quantity = quantity;
        this.total = total;
        this.status = status;
        this.evidence = evidence;
    };

    create = async () => {
        const product = new Product(this.product.id);
        await product.read();

        const total = product.price * this.quantity;
        if (total !== this.total) {
            throw new Error('invalid total amount');
        }
        
        const insufficientStock = (product.stock - this.quantity) < 0;
        if (insufficientStock) {
            throw new Error('inssuficient stock');
        }
        const q = `
            INSERT INTO transactions 
            (product_id, user_id, transaction_code, quantity, total, status, evidence, created_at) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, now())
        `;
        await conn.query(q, [this.product.id, this.user.id, this.transaction_code, this.quantity, this.total, this.status, this.evidence]);
        return true
    }

    read = async () => {
        const q = `
            SELECT 
                t.id transaction_id,
                t.quantity transaction_quantity,
                t.total transaction_total,
                t.status transaction_status,
                t.evidence transaction_evidence,
                t.created_at transaction_created_at,

                p.name product_name,
                u.fullname user_fullname                
            FROM transactions t
            LEFT JOIN products p
                ON t.product_id = p.id
            LEFT JOIN users u
                ON t.user_id = u.id
            WHERE t.id = ?`;
        const results = await conn.query(q, [this.id]);

        if (results[0].length < 1) {
            return -1;
        }
        let result = results[0][0];
        this.id = result.transaction_id;
        this.product.name = result.product_name;
        this.user.fullname = result.user_fullname;
        this.quantity = result.transaction_quantity;
        this.total = result.transaction_total;
        this.status = result.transaction_status;
        this.evidence = result.transaction_evidence;
        this.created_at = result.transaction_created_at;

        delete this.product.category;
        delete this.product.created_by;
    }

    updateStatus = async () => {
        const q = `
            UPDATE transactions
            SET status = ? WHERE transaction_code = ?`;
        const results = await conn.query(q, [this.status, this.transaction_code]);
        if (results[0].affectedRows < 1) {
            return false;
        }
        await this.read();
        return true;
    }

    static getAll = async (startDate, endDate, userId) => {
        let where = ``;
        if (startDate && endDate) {
            where = `WHERE created_at BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'`;
        }
        if (userId && userId != '0') {
            where = `WHERE user_id = ${userId}`;
        }

        // group by 
        const q = `
        SELECT 
            transaction_code, SUM(quantity) AS total_quantity, SUM(total) AS total_amount 
        FROM transactions 
        ${where}
        GROUP BY transaction_code
        `;

        const results = await conn.query(q, []);
        if (results[0].length < 1) {
            return [];
        }

        const result = await Promise.all(results[0].map(async row => {
            const { transaction_code } = row;
            const q2 = `
                SELECT 
                    t.id transaction_id,
                    t.quantity transaction_quantity,
                    t.total transaction_total,
                    t.status transaction_status,
                    t.evidence transaction_evidence,
                    t.created_at transaction_created_at,

                    p.id product_id,
                    p.name product_name,
                    p.price product_price,

                    u.id user_id,
                    u.fullname user_fullname                
                FROM transactions t
                LEFT JOIN products p
                    ON t.product_id = p.id
                LEFT JOIN users u
                    ON t.user_id = u.id
                WHERE t.transaction_code = '${transaction_code}' 
                ORDER BY status ASC
            `;
            
            const r = await conn.query(q2, []);
            if (r[0].length < 1) {
                return [];
            }

            return {
                ...row,
                data: r[0]
            }
        }))

        return result;       
    }
}