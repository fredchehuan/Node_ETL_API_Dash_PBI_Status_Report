const mysql = require('mysql');

class MysqlPersistence {

    constructor() {
        this.connection = null;
        this.transactionWasStarted = false;
    }

    async getConnection(){
        if (this.connection == null){
            //inicio alterando para local - fred
            /*
            this.connection = mysql.createConnection({
                host: 'projetosmjv.com.br',
                user: 'proje156_pmo',
                password: '#Mjv@Pmo@2021',
                database: 'proje156_pmo'
            });
            */ 
            this.connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'root',
                database: 'status_report_db'
            });
            //fim alterando para local - fred
            this.connection.connect();
            return this.connection;
        } else {
            return this.connection;
        }
    
    }

    closeConnection(){
        if (this.connection){
            this.transactionWasStarted = false;
            this.connection.end();
            this.connection = null;
        }
    }

    // Guarantees that a transaction is already started
    async startTransaction(){
        let conn;
        if (!this.transactionWasStarted){
            conn = await this.getConnection();
            conn.beginTransaction((err) => {
                if (err) {
                    throw err;
                }
                this.transactionWasStarted = true;
                return;
            })
        } else {
            return;
        }

    }

    // Commit a transaction if it exists
    async commit(){
        if (this.transactionWasStarted && this.connection != null){
            this.connection.commit((err) => {
                if (err) {
                    throw err;
                }
                this.closeConnection();
                return;
            });
        } else {
            if (this.connection != null){
                this.closeConnection();
            }
            return;
        }
    }

    // Rollback a transaction if it exists
    async rollback(){
        if (this.connection){
            this.connection.rollback((err) => {
                if(err) {
                    console.error(err);
                    throw err;
                }
                this.closeConnection();
                return;
            });

        } else {
            return;
        }

    }

    // Persists data giving a quary and the values as an object or array
    async persistence(query, values){
        let conn;
        conn = await this.getConnection();
        return await new Promise((resolve, reject) => {

            // fred
            console.log('... QUERY : ', query);
            console.log('... VALUES : ', values);

            conn.query(query, values, (err,rows) => {
                if(err) reject(err);
                resolve(rows);
            });
        });
    }
}

module.exports = MysqlPersistence;