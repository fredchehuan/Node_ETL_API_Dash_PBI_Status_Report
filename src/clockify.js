const fetch = require('node-fetch');
const util = require('util');
var fs = require('fs');

class ClockifyRequester {

    getAllProjectsOnWorkspace(){    
      let promise = new Promise((resolve, reject) => {
  
          fetch('https://api.clockify.me/api/v1/workspaces/60a6c734b7cf50345092ad5b/projects', {
              method: 'GET',
              headers: {
                'X-Api-Key': 'YTVlNDM3NWUtNjhkNy00N2UyLWE0YTUtNTU0Y2RkZWU0OTA2',
                'Content-Type': 'application/json',
              }
              //,body: JSON.stringify(body)
          }).then(response => {
            //console.log('response: ', response);
              return response.text();
          }).then(text => {
              text = unescape( encodeURIComponent( text ) );
              //console.log('text: ', JSON.stringify(text));   
              //console.dir(text, {depth: null, colors: true})
              //let json = JSON.stringify(text);
              fs.writeFileSync('myjsonfile.json', text);             
          }).catch(err => {
            //console.log('!!!!!!!!!!! erro no request: ', err);
            reject(err)
          });
  
  
      });
  
      return promise;
    
    }

    getTimetasks(userId, since, keyApy){

      let promise;
      let body;

      body = {
          "start": since,
          "billable": timeTask.billable,
          "description": timeTask.description,
          "projectId": timeTask.projectId,
          "taskId": timeTask.taskID,
          "end": timeTask.endTime,
          "customFields": [
            {
              "customFieldId" : "5b1e6b160cb8793dd93ec120",
              "value": "Sao Paulo"
            }
          ]
        }
  
      promise = new Promise((resolve, reject) => {
  
          fetch(['https://api.clockify.me/api/v1/workspaces', timeTask.workspaceID, 'time-entries', issueKey].join('/'), {
              method: 'POST',
              headers: {
                'X-Api-Key': keyApy,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(body)
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
    

}

module.exports = ClockifyRequester;