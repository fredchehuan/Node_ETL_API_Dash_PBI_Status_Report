const MysqlPersistence = require('./persistence');

class IssuePersistence {

    constructor(){
        this.persistence = new MysqlPersistence();
    }

    async updateIssues(issues){

        await this.persistence.startTransaction();

        try {

            console.log("==>> Removendo issues do projeto " + issues[0].projectKey + " da base de dados");

            await this.deleteIssuesByProjectKey(issues[0].projectKey);

            console.log("==>> Persistindo issues do projeto " + issues[0].projectKey + " na base de dados");

            await this.persistIssues(issues);

            this.persistence.commit();

            return;

        } catch (ex) {

            this.persistence.rollback();

            throw ex;

        }

    }

    async deleteIssuesByProjectKey(projectKey){

        try {

            await this.persistence.persistence('DELETE FROM activity WHERE projectKey = ?', [projectKey]);

            await this.persistence.commit();

            return;

        } catch (ex) {

            console.log("** erro!", ex);

            await this.persistence.rollback();

            throw ex;

        }

    }

    // Persists an issue
    async persistIssue(issue, useTransaction){

        let promise;

        try {

            if(useTransaction){
                await this.persistence.startTransaction();
            }
            
            delete issue.worklogs;

            let rows = await this.persistence.persistence('INSERT INTO activity SET ?', issue);

            if (useTransaction) {
                
                try {

                    await this.persistence.commit();

                    return rows;

                } catch (ex) {

                    await this.persistence.rollback();
                    throw ex;
        
                }


            } else {
                this.persistence.closeConnection();
            }
                
        } catch (ex) {

            if(useTransaction){
                await this.persistence.rollback();
            }
            throw ex;

        }


    }

    // Persist a worklog
    persistWorklog(worklog){

        let promise;

        return this.persistence.persistence('INSERT INTO worklog SET ?', worklog);

    }

    async persistWorklogs(worklogs, useTransaction){

        let promises = [];

        if (worklogs){
        
            if(useTransaction){
                await this.persistence.startTransaction();
            }

            worklogs.forEach((value) => {
                promises.push(this.persistWorklog(value));
            });

            try{

                await Promise.all(promises);

                console.log("==>> Worklogs persistidos");

                if (useTransaction){
                    await this.persistence.commit();
                } else {
                    this.persistence.closeConnection();
                }
                
                return;

            } catch (err){

                if (useTransaction){
                    await this.persistence.rollback();
                }else{
                    this.persistence.closeConnection();
                }
                throw err;

            }

        }

    }

    async persistIssues(issues){

        let promises = [];

        await this.persistence.startTransaction();

        issues.forEach(value => {

            promises.push(this.persistIssue(value, false));

        });

        try{

            await Promise.all(promises);
        
            await this.persistence.commit();

        } catch(ex){

            await this.persistence.rollback();

            throw ex;

        }

        return;

    }

}

module.exports = IssuePersistence;