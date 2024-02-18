const fetch = require('node-fetch');
const JiraObjectParser = require('./DataSources/Jira/parser');

class JiraRequest {

    constructor() {

    }

    getIssue(issueKey){

        let promise;

        promise = new Promise((resolve, reject) => {

            fetch(['https://mjv-corp.atlassian.net/rest/api/3/issue', issueKey].join('/'), {
                method: 'GET',
                headers: {
                  'Authorization': 'Basic ' + Buffer.from(
                    'ricardo.sepulveda@mjv.com.br:aIATJmuLyI1H4QeFXci94034'
                  ).toString('base64'),
                  'Content-Type': 'application/json; charset=utf-8',
                }
            }).then(response => {

                return response.text();

            }).then(text => {

                text = unescape( encodeURIComponent( text ) );
              
                const atividade = new JiraObjectParser().parseIssue(JSON.parse(text));

                resolve(atividade);
                  
            }).catch(err => reject(err));


        });

        return promise;

    }

    getWorklogs(issue){

      let promise;

      promise = new Promise((resolve, reject) => {

          fetch(['https://mjv-corp.atlassian.net/rest/api/3/issue', issue.activityKey, 'worklog'].join('/'), {
              method: 'GET',
              headers: {
                'Authorization': 'Basic ' + Buffer.from(
                  'ricardo.sepulveda@mjv.com.br:aIATJmuLyI1H4QeFXci94034'
                ).toString('base64'),
                'Content-Type': 'application/json',
              }
          }).then(response => {

              return response.text();

          }).then(text => {

              text = unescape( encodeURIComponent( text ) );
            
              const worklogs = new JiraObjectParser().parseWorklogs(JSON.parse(text), issue);

              resolve(worklogs);
                
          }).catch(err => reject(err));


      });

      return promise;

  }

  // Recursive method to get all issues in a project
    async getIssuesByProjectKey(projectKey, issues, index = 0){

      const response = await fetch(['https://mjv-corp.atlassian.net/rest/api/3/search?jql=project%20%3D%20', projectKey, '&startAt=', index].join(''), {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(
              'ricardo.sepulveda@mjv.com.br:aIATJmuLyI1H4QeFXci94034'
            ).toString('base64'),
            'Content-Type': 'application/json; charset=utf-8',
          }
      });

      const buffer = await response.buffer();

      let text = await buffer.toString('utf-8');

      if (issues){
        issues = issues.concat(new JiraObjectParser().parseIssues(text));
      } else {
        issues = new JiraObjectParser().parseIssues(text);
      }

      const obj = JSON.parse(text);

      //console.log('projectKey: ' + projectKey + ' - obj.startAt + obj.maxResults: ' + (obj.startAt + obj.maxResults) + ' - obj.total: ' + obj.total + ' - issueSize: ' + issues.length );

      if (obj.startAt + obj.maxResults < obj.total){
        issues = await this.getIssuesByProjectKey(projectKey, issues, obj.startAt + obj.maxResults);
      }

      return issues;
    
    }

    getProjects(){

        let promise;

        promise = new Promise((resolve, reject) => {

            fetch('https://mjv-corp.atlassian.net/rest/api/3/project/search', {
                method: 'GET',
                headers: {
                  'Authorization': 'Basic ' + Buffer.from(
                    'ricardo.sepulveda@mjv.com.br:aIATJmuLyI1H4QeFXci94034'
                  ).toString('base64'),
                  'Content-Type': 'application/json;',
                }
            }).then(response => {

                return response.text();

            }).then(text => {

                const projects = new JiraObjectParser().parseProjects(text);

                resolve(projects);
                  
            }).catch(err => reject(err));


        });

        return promise;

    }

}

module.exports = JiraRequest;