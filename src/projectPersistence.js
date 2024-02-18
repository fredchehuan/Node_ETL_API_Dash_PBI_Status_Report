const MysqlPersistence = require('./persistence');

class ProjectPersistence {
    constructor(){
        this.persistence = new MysqlPersistence();
    }

    async getProjects(){
        let projects;
        projects = await this.persistence.persistence('SELECT * FROM project', null);
        this.persistence.closeConnection();
        return projects;
    }

    // Persist a project
    persistProject(project){
        console.log("persisting a project!", project);
        return this.persistence.persistence('INSERT INTO project SET ?', project);
    }

    async persistProjects(projects, shouldCommit){
        let promises = [];
        projects.forEach((value) => {
            promises.push(this.persistProject(value));
        });

        try{
            await Promise.all(promises);
            if (shouldCommit){
                await this.persistence.commit();
                return;
            }
        } catch(ex){
            console.error(ex);
            if (shouldCommit){
                await this.persistence.rollback();
            }
            throw ex;
        }
    }
}

module.exports = ProjectPersistence;