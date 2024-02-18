
const MysqlPersistence = require('./persistence');

class Consolidation {

    constructor(){
        this.persistence = new MysqlPersistence();
    }

    async consolidate(projetKey){

        let rows = await this.persistence.persistence('call consolidate(?)', projetKey);
        
        this.persistence.closeConnection();

    }

}

module.exports = Consolidation;