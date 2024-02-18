class JiraObjectParser {

    constructor(){

    }

    parseProjects(projectsAsText){

        let projectObjects = [];
        let projectAsObject;
        
        projectAsObject = JSON.parse(projectsAsText);

        projectAsObject.values.forEach((value) => {

            projectObjects.push(this.parseProject(value));

        });

        return projectObjects;

    }

    parseProject(obj){

        const project = {
            id: obj.id,
            projectKey: obj.key,
            projectName: obj.name,
            projectType: obj.projectTypeKey,
            projectStyle: obj.style
        }

        return project;

    }

    parseIssues(issuesAsString){

        let issueObjects = [];
        let issuesAsObject;

        issuesAsObject = JSON.parse(issuesAsString);

        if (issuesAsObject.issues){

            issuesAsObject.issues.forEach((value) => {

                issueObjects.push(this.parseIssue(value));
    
            })

        }

        return issueObjects;
        

    }

    parseIssue(obj) {

        const atividade = {

            id: obj.id,
            activityKey: obj.key,
            projectKey: obj.fields.project.key,
            projectName: obj.fields.project.name,
            summary: obj.fields.summary,
            currentStatus: obj.fields.status.statusCategory.name,
            creator: obj.fields.creator.displayName,
            workRatio: parseInt(obj.fields.workratio),
            created: new Date(obj.fields.created),
            assignee: (obj.fields.assignee?obj.fields.assignee.displayName:null),
            progressCurrent: obj.fields.progress.progress,
            progressTotal: obj.fields.progress.total,
            progressPercent: obj.fields.progress.percent?obj.fields.progress.percent:0,
            originalEstimate: obj.fields.timeoriginalestimate!=null?obj.fields.timeoriginalestimate:0,
            description: '',
            worklogs: {
                total: obj.fields.worklog?obj.fields.worklog.total:0,
                worklogs: []
            }

        };

        atividade.worklogs.worklogs = this.parseWorklogs(obj.fields.worklog);

        let description = [];

        if ((obj.fields.description != undefined && obj.fields.description.content != undefined)){

            obj.fields.description.content.forEach(value => {

                if (value.content != undefined){

                    value.content.forEach(value => {

                        if (value.type == 'text'){

                            description.push(value.text);
        
                        }

                    });

                    atividade.description = description.join('\n');

                    if (atividade.description){
                        atividade.description = atividade.description.substring(0,4998);
                    }

                }

            });

        }

        return atividade;

    }

    parseWorklogs(worklogsFromJira, issue){

        let worklog;
        let worklogs = [];

        if (issue == undefined){
            return [];
        }

        if (worklogsFromJira){

            worklogsFromJira.worklogs.forEach(value => {

                worklog = {
                    author: value.author.displayName,
                    created: new Date(value.created),
                    started: new Date(value.started),
                    timeSpent: value.timeSpentSeconds,
                    accountId: value.author.accountId,
                    activityKey: issue.activityKey,
                    projectKey: issue.projectKey
                }

                worklogs.push(worklog);
    
            });

        }

        return worklogs;
    
    }

}

module.exports = JiraObjectParser;