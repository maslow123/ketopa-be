const DBTable = require('./dbtable').default;
const conn = require('./index');

exports.default = class Category extends DBTable {
    constructor(id = "", name = "", created_at = 0) {
        super(id, created_at);
        this.name = name;
    }
    create = async () => {
        const q = `
            INSERT INTO categories 
            (name) 
            VALUES 
            (?)
        `;
        const results = await conn.query(q, [this.name]);
        this.id = results[0].insertId;
        await this.read();
    }
    read = async () => {
        const q = `
            SELECT *
            FROM categories 
            WHERE id = ?`;
        const results = await conn.query(q, [this.id]);
        
        if (results[0].length < 1) {
            return -1;
        }
        let result = results[0][0];
        this.id = result.id;
        this.name = result.name;
    } 
    update = async () => {
        const q = `
            UPDATE categories
            SET name = ? WHERE id = ?`;
        const results = await conn.query(q, [this.name, this.id]);
        if (results[0].affectedRows < 1) {
            return false;
        }
        await this.read();
        return true;
    } 

    delete = async () => {
        const q = `
            DELETE FROM categories            
            WHERE id = ?`;

        const results = await conn.query(q, [this.id]);     
        return results[0].affectedRows > 0;
    } 

    static getAll = async (nameSearch = "%%", limit = 10, offset = 0) => {
        const q =`
        SELECT * 
        FROM categories
        WHERE name LIKE ? `;
        let results = await conn.query(q, [nameSearch, limit, offset]);
        if (results[0].length < 1) {
            return [];
        }
        return results[0].map(row => new Category(
                row.id,
                row.name,                
        ));
    }
}