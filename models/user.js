const DBTable = require('./dbtable').default;
const conn = require('./index');

exports.default = class User extends DBTable {
    constructor(id = "", username = '', password = '', level = 0, fullname = '', phone_number = '', address = '', created_at = 0) {
        super(id, created_at);
        this.username = username;
        this.password = password;
        this.level = level;
        this.fullname = fullname;
        this.phone_number = phone_number;        
        this.address = address;        
    }
    create = async () => {
        const q = `
            INSERT INTO users 
            (username, password, level, fullname, phone_number, address, created_at) 
            VALUES 
            (?, ?, ?, ?, ?, ?, now()) 
        `;

        const results = await conn.query(q, [this.username, this.password, this.level, this.fullname, this.phone_number, this.address]);        
        this.id = results[0].insertId;
        await this.read();
    }
    read = async () => {
        const q = `
            SELECT *
            FROM users 
            WHERE id = ?`;
        const results = await conn.query(q, [this.id]);
        
        if (results[0].length < 1) {
            return -1;
        }
        let result = results[0][0];
        this.id = result.id;
        this.username = result.username;
        this.level = result.level;
        this.fullname = result.fullname;
        this.phone_number = result.phone_number;
        this.address = result.address;
        this.created_at = result.created_at;
    } 

    login = async () => {

        const q = `
            SELECT * 
            FROM users
            WHERE username = ? AND password = ? AND level = ?
        `
        const results = await conn.query(q, [this.username, this.password, this.level]);
        if (results[0].length < 1) {
            return false;
        }

        this.id = results[0][0].id;
        await this.read();
        return true;
    }

    static getAll = async (nameSearch = "%%", limit = 10, offset = 0) => {
        const q =`
        SELECT * 
        FROM users
        WHERE username LIKE ? OR fullname LIKE ?`;
        let results = await conn.query(q, [nameSearch, nameSearch, limit, offset]);
        if (results[0].length < 1) {
            return [];
        }
        return results[0].map(row => new User(
                row.id,
                row.username,
                row.password,
                row.level,
                row.fullname,
                row.phone_number,
                row.address,
                row.created_at                                
        ));
    }
    delete = async () => {
        const q = `
            DELETE FROM users
            WHERE id = ?`;
        const results = await conn.query(q, [this.id]);
        return results[0].affectedRows > 0;
    } 
    update = async () => {
        const additionalQuery = this.password ? `, password = '${this.password}'` : '';

        const q = `
            UPDATE users
            SET 
                username = ?, 
                level = ?, 
                fullname = ?,
                phone_number = ?,
                address = ?${additionalQuery}                 
            WHERE id = ?`;

        console.log(q);
        const results = await conn.query(q, [this.username, this.level, this.fullname, this.phone_number, this.address, this.id]);
        if (results[0].affectedRows < 1) {
            return false;
        }
        await this.read();
        return true;
    } 
}