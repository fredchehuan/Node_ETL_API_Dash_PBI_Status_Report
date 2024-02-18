const MysqlPersistence = require('./persistence');

class WorkerPersistence {
 
    constructor(){
        this.persistence = new MysqlPersistence();
    }

    async getWorkers(){

        let workers;

        projects = await this.persistence.persistence('SELECT * FROM worker', null);

        this.persistence.closeConnection();

        return projects;

    }

    // Persist a worker
    persistWorker(worker){

        console.log("==>> persisting a worker!", worker);

        return this.persistence.persistence('INSERT INTO worker SET ?', worker);

    }

    async persistWorkers(workers, shouldCommit){

        let promises = [];


        workers.forEach((value) => {

            promises.push(this.persistWorker(value));

        });

        try{

            await Promise.all(promises);

            if (shouldCommit){
                
                await this.persistence.commit();

                return;

            } else {
                this.persistence.closeConnection()
            }

        } catch(ex){

            console.error(ex);

            if (shouldCommit){
                await this.persistence.rollback();
            } else {
                this.persistence.closeConnection()
            }
            throw ex;

        }


    }

}

module.exports = WorkerPersistence;