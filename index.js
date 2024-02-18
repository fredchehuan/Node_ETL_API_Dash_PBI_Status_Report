const JiraRequest = require('./src/request');
const IssuePersistence = require('./src/issuePersistence');
const ProjectPersistence = require('./src/projectPersistence');
const WoerkerPersistence = require('./src/workerPersistence');
const Consolidation = require('./src/consolidation');

const request = new JiraRequest();

const ClockifyRequester = require('./src/clockify');
const requestClockify = new ClockifyRequester();

/*
request.getIssue('CMML-9').then((issue) => {

    let persistence = new IssuePersistence();

    console.log(issue);

    persistence.persistIssue(issue, true);

});
*/


class Start{

    constructor(){
        this.workersInDatabase = [];
        this.workersToBePersisted = [];
    }

    // fred - update projects atualiza a tabela projects (GetProjects()) e a tabela activities (getIssuesByProjectKey())
    async updateProjects(){

        const persistence = new ProjectPersistence();
        const consolidation = new Consolidation();
        const issuePersistence = new IssuePersistence();

        let projectsOnJira;
        let projectAlreadyExistsInDatabase;
        let projectsToBePersisted = [];
        let projectsOnDatabase;
        let promisesInsertIssues = [];
        let promisesGetIssues = [];
        let promisesDeleteIssues = [];
        let promisesConsolidate = [];
        let allIssuesInAllProjects;
        let issuesBeenPersisted;
        let worklogs;

        console.log("-->> Iniciando processo de carga de projetos");

        projectsOnJira = await request.getProjects();

        console.log("-->> " + projectsOnJira.length + " projetos encontrados no Jira");

        projectsOnDatabase = await persistence.getProjects();
    
        console.log("-->> " + projectsOnDatabase.length + " projetos encontrados na base");

        projectsOnJira.forEach(projectOnJira => {

            projectAlreadyExistsInDatabase = false;
            
            projectsOnDatabase.forEach(projectOnDatabase => {

                if (projectOnDatabase.projectKey == projectOnJira.projectKey){
                    projectAlreadyExistsInDatabase = true;
                }

            });

            if (!projectAlreadyExistsInDatabase){
                projectsToBePersisted.push(projectOnJira);
            }

        });

        if (projectsToBePersisted.length > 0){

            console.log("-->> Novo projeto sendo persistido na base");

            await persistence.persistProjects(projectsToBePersisted, true);

        }else{
            console.log("==>> No one project to be persisted");
        }

        // Prepara promises para capturar as issues dos projetos
        projectsOnDatabase.forEach(projectOnDatabase => {
            promisesGetIssues.push(request.getIssuesByProjectKey(projectOnDatabase.projectKey));
        });

        console.log("-->> Capturando as issues de cada projeto presente na base");

        // Executa todas as promisses
        allIssuesInAllProjects = await Promise.all(promisesGetIssues);

        // Persiste as issues de cada projeto
        allIssuesInAllProjects.forEach(async issues => {

            if (issues && issues.length > 0){

                console.log("==>> Atualizando issues do projeto " + issues[0].projectKey);

                await issuePersistence.updateIssues(issues);
                
                console.log("==>> Capturando workloads do projeto " + issues[0].projectKey);

                worklogs = await this.getWorklogs(issues);

                console.log("==>> Persistindo worklogs do projeto " + issues[0].projectKey);

                await issuePersistence.persistWorklogs(worklogs, false);

                console.log("============>> Consolidando projeto " + issues[0].projectKey);

                await consolidation.consolidate(issues[0].projectKey);
                
            }
            else{
                console.log(+"-->> projeto sem issues");
            }

        });

    }

    async getWorklogs(issues){

        // correcao parametro projecKey para issues[0].projectKey
        issues = await request.getIssuesByProjectKey(issues[0].projectKey);
        
        let promisesWorklogs = [];
        let result = [];
        let worklogs = [];

        if(issues){

            issues.forEach(issue => {

                promisesWorklogs.push(request.getWorklogs(issue));

            });

            worklogs = await Promise.all(promisesWorklogs);

            if (worklogs){
                worklogs.forEach(worklogArray => {
                    if (worklogArray.length > 0){
                        worklogArray.forEach(worklog => {
                            result.push(worklog);
                        });
                    }
                })
                console.log('-------> entrou');
            }

            return result;

        }
    
    }

    addWorkerToBePersistedIfNeeded(worker){

        let workerExists;
        let workerPersistence;

        this.workersInDatabase.forEach(item => {

            workerExists = (item.accountId == worker.accountId) | workerExists;

        });

        if (!workerExists){

            this.workersToBePersisted.push(worker);

        }

    }

    async persistWorkers(){

        workerPersistence = new WoerkerPersistence();

        workerPersistence.persistWorkers(this.workersToBePersisted, true);

    }

    async loadWorkersFromDatabase(){

        const workerPersistence = new WoerkerPersistence();
        
        this.workersInDatabase = await workerPersistence.getWorkers();

    }

    // fred
    //async loadClockfyData(){
        //console.log('==>> Carregando Projetos no Clockify');
        
        //const projectsOnDb = await request.getProjects();
        //console.log('projetos na base: ', projectsOnDb);
        
        //const projectsOnClockify = await requestClockify.getAllProjectsOnWorkspace();
    //}

}

// fred - comentado para testar clockfy
 new Start().updateProjects();

//new Start().loadClockfyData();

/*
new Start().issues('LAB').then(result => {
    console.log(result);
});
*/

/*
request.getIssuesByProjectKey('LAB').then((issues) => {

    let persistence = new IssuePersistence();

    persistence.persistIssues(issues);

});
*/

/*
let projectPersistence = new ProjectPersistence();
let issuePersistence = new IssuePersistence();

projectPersistence.getProjects().then(projects => {

    if (projects){

        projects.forEach(project => {

            request.getIssuesByProjectKey(project.projectKey).then((issues) => {

                issuePersistence.persistIssues(issues);
            
            });

        })

    }

})
*/


