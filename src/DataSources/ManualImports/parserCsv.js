const csvParser = require('csv-parser');

const fs = require('fs');

let lines = [];

class DevOpsParser {

  async readIssuesFromCSV(csvPath){

    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (data) => lines.push(data))
      .on('end', () => {
        return this.parseIssues(lines);
    });

    return [];

  }

  parseIssues(objs) {

    let atividade;
    let atividades;

    objs.forEach(obj => {

      console.log('-> ', obj);

      atividade = {

        id: obj.ID,
        activityKey: obj['Work Item Type'],
        projectKey: 'Project key',
        projectName: 'Project name',
        summary: 'Summary',
        currentStatus: obj.state,
        creator: obj['Changed By'],
        workRatio: 'Work Ratio',
        created: 'Creeated',
        assignee: '(obj.fields.assignee ? obj.fields.assignee.displayName : null)',
        progressCurrent: obj.fields.progress.progress,
        progressTotal: obj.fields.progress.total,
        progressPercent: obj.fields.progress.percent ? obj.fields.progress.percent : 0,
        originalEstimate: obj.fields.timeoriginalestimate != null ? obj.fields.timeoriginalestimate : 0,
        description: '',
        worklogs: {
          total: obj.fields.worklog ? obj.fields.worklog.total : 0,
          worklogs: []
        }
  
      };

      atividades.push(atividade);

      return atividades;

    });

  }

}

new DevOpsParser().readIssuesFromCSV('./data.csv');
