const DBTable = require('./dbtable').default;
const Category = require('./category').default;
const User = require('./user').default;
const conn = require('./index');


exports.default = class Product extends DBTable {
    constructor(id = "", category_id = 0, name = '', image = '', price = 0, stock = 0, created_at = 0, created_by = 0) {
        super(id, created_at);
        this.category = new Category(category_id);
        this.name = name;
        this.image = image;
        this.price = price;
        this.stock = stock;
        this.created_by = new User(created_by);
    }

    create = async () => {
        const q = `
            INSERT INTO products 
            (category_id, name, image, price, stock, created_at, created_by) 
            VALUES 
            (?, ?, ?, ?, ?, ?, now(), ?)
        `;
        const results = await conn.query(q, [this.category.id, this.name, this.image, this.price, this.stock, this.created_by.id]);
        this.id = results[0].insertId;
        await this.read();
    }

    read = async () => {
        const q = `
            SELECT 
                p.id product_id,
                p.name product_name,
                p.image product_image,
                p.price product_price,
                p.created_by product_created_by,
                p.stock product_stock,

                c.id category_id,
                c.name category_name,
                u.fullname user_fullname
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            LEFT JOIN users u
                ON p.created_by = u.id
            WHERE p.id = ?`;

        const results = await conn.query(q, [this.id]);

        if (results[0].length < 1) {
            return -1;
        }
        let result = results[0][0];
        this.id = result.product_id;
        this.name = result.product_name;
        this.image = result.product_image;
        this.price = result.product_price;
        this.stock = result.product_stock;

        this.created_by.fullname = result.user_fullname;
        this.category_id = result.category_id;
        this.category.name = result.category_name;
    }

    update = async () => {
        const q = `
            UPDATE products
            SET category_id = ?, name = ?, image = ?, price = ?, stock = ?, created_by = ?
            WHERE id = ?`;
        const results = await conn.query(q, [this.category.id, this.name, this.image, this.price, this.stock, this.created_by.id, this.id]);
        if (results[0].affectedRows < 1) {
            return false;
        }
        await this.read();
        return true;
    }

    delete = async () => {
        const q = `
            DELETE FROM products            
            WHERE id = ?`;

        const results = await conn.query(q, [this.id]);
        return results[0].affectedRows > 0;
    }

    static getAll = async (nameSearch = "%%", limit = 10, offset = 0) => {
        const q = `
            SELECT 
                p.id product_id,
                p.name product_name,
                p.image product_image,
                p.price product_price,
                p.stock product_stock,
                p.created_at product_created_at,
                p.created_by product_created_by,

                c.id category_id,
                c.name category_name,
                u.fullname user_fullname
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.id
            LEFT JOIN users u
                ON p.created_by = u.id
            WHERE p.name LIKE ? 
        `;
        let results = await conn.query(q, [nameSearch]);
        if (results[0].length < 1) {
            return [];
        }
        return results[0].map(row => {
            const category = new Category(row.category_id, row.category_name);
            const user = new User('', '', '', '', row.user_fullname);
            const product = new Product (
                row.product_id,
                0,
                row.product_name,
                row.product_image,
                row.product_price,
                row.product_stock,
                row.product_created_at,
                0
            );
            
            product.category = category;
            product.created_by = user;

            return product;
        });
    }
}