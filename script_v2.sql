select * from status_report_db.project P
where P.id not in (10000, 10001)

select * from status_report_db.project P
where P.id != 10000 
or P.id != 10001

select * from status_report_db.project


-----------------
select * from project p order by p.projectName ;
select * from activity a WHERE a.projectKey = 'AC' order by created desc;
select * from worklog w;
select * from consolidation c where c.projectKey = 'EL';

truncate table consolidation ;

update project p
set p.workingHoursInContract = 8000
where p.projectKey = 'MSAA'

update project p
set p.workingHoursInContract = 1680
where p.projectKey = 'BUS'

update project p
set p.workingHoursInContract = 1899
where p.projectKey = 'PDSP'

update project p
set p.workingHoursInContract = 1904
where p.projectKey = 'EDS'

update project p
set p.workingHoursInContract = 4500
where p.projectKey = 'AC'

update project p
set p.workingHoursInContract = 18816
where p.projectKey = 'CFDEV'

-- duvida
update project p
set p.workingHoursInContract = 1644
where p.projectKey = 'EL'

select distinct a.projectKey from activity a ;
select distinct p.projectKey from project p ;

select distinct a.projectKey, p.projectKey from activity a
left join project p on p.projectKey = a.projectKey 

alter table project
add weeklyCapacityHours int

select*from project p 
order by p.projectKey 

-- fred coorecao dos campos da tabela project
create table project (
	id int auto_increment primary key not null,
	projectKey varchar(50) unique not null,
	projectName varchar(200) not null,
	projectType varchar(100) not null,
	projectStyle varchar(100) not null,
	workingHoursInContract int,
	weeklyCapacityHours int,
);
                   


create table activity (id int auto_increment primary key, 
	activityKey varchar(50) not null,
	projectKey varchar(50) not null,
	projectName varchar(200) not null,
	workRatio int,
	summary varchar(500) not null,
	currentStatus varchar(50),
	creator varchar(150),
	created timestamp,
	assignee varchar(150),
	progressCurrent int,
	progressTotal int,
	progressPercent int,
	originalEstimate int,
	description varchar(5000) not null,
	FOREIGN KEY (projectKey) REFERENCES  project(projectKey) ON DELETE cascade
);
                      
create table worklog (id int primary key auto_increment not null,
	projectKey varchar(50) not null,
	accountId varchar(150) not null,
	activityKey varchar(50) not null,
	author varchar(150) not null,
	created timestamp,
	started timestamp,
	timeSpent int,
	FOREIGN KEY (projectKey) REFERENCES  project(projectKey) ON DELETE cascade
);

create table consolidation (id int primary key auto_increment,
	projectKey varchar(50),
	consolitationTime timestamp DEFAULT CURRENT_TIMESTAMP,
                           originalEstimateTime int,
                           originalEstimateClosedActivities int,
                           originalEstimateOfActivitiesAlreadyStarted int,
                           timeConsumedSoFar int,
                           currentEstimateTime int,
                           timeConsumedClosedActivities int,
                           progressPercent int,
                           deviationPercent int,
                           agregatedValue int,  
                           percentActivitiesWithoutDescription int,
                           percentActivitiesWithoutEstimateTime int,
                           percentOfWorkingHoursInContractPlanned int,
                           totalOverloadTime int,
                           percentActivitiesWithOverloadTime int,
                           workingHoursInContract int,
                           percentEndedActivities int,
                          FOREIGN KEY (projectKey) REFERENCES  project(projectKey) ON DELETE cascade
);

create table clockify_client (
	id int auto_increment primary key not null,
	clockify_id varchar(200) not null,
	name varchar(50) unique not null,
	workspaceid varchar(200) not null,
	address varchar(200) ,
	archived varchar(100) not null,
	projectKey varchar(50)
);

-- fred
create table manual_projects_sprints_versions (
	id int auto_increment primary key not null,
	projectKey varchar(50) not null,
	name varchar(200) not null,
	start_date datetime not null,
	end_date datetime not null,
	planned_hours int,
	development_capacity int,
	FOREIGN KEY (projectKey) REFERENCES  project(projectKey) ON DELETE cascade
);

insert into manual_projects_sprints_versions (projectKey, name, start_date, end_date, planned_hours, development_capacity)
values("AC","Horizonte 9","2021-11-22 00:00:00","2021-12-03 00:00:00",192,192);

insert into manual_projects_sprints_versions (projectKey, name, start_date, end_date, planned_hours, development_capacity)
values("AC","Horizonte 10","2021-12-06 00:00:00","2021-12-17 00:00:00",192,192);

insert into manual_projects_sprints_versions (projectKey, name, start_date, end_date, planned_hours, development_capacity)
values("AC","Horizonte 11","2021-12-20 00:00:00","2021-12-31 00:00:00",192,192);


{ CALL status_report_db.consolidate(:projectKeyIn) }
'AC'

CREATE PROCEDURE consolidate(IN projectKeyIn Varchar(50))
BEGIN
    
    DECLARE originalEstimateTime INT DEFAULT 0;
    DECLARE originalEstimateClosedActivities INT DEFAULT 0;
    DECLARE originalEstimateOfActivitiesAlreadyStarted INT DEFAULT 0;
    DECLARE currentEstimateTime INT DEFAULT 0;
    DECLARE timeConsumedClosedActivities INT DEFAULT 0;
    DECLARE timeConsumedSoFar INT DEFAULT 0;
    DECLARE totalWorkingHoursInContract INT DEFAULT 0;
    DECLARE qtyActivitiesWithoutDescription INT DEFAULT 0;
    DECLARE qtyActivitiesWithoutEstimateTime INT DEFAULT 0;
    DECLARE qtyActivitiesWithOverload INT DEFAULT 0;
    DECLARE qtyEndedActivities INT DEFAULT 0;
    DECLARE qtyActivities INT DEFAULT 0;
    DECLARE deviationPercent INT DEFAULT 0;
    DECLARE percentActivitiesWithoutDescription INT DEFAULT 0;
    DECLARE percentActivitiesWithoutEstimateTime INT DEFAULT 0;
    DECLARE percentActivitiesWithOverloadTime INT DEFAULT 0;
    DECLARE percentOfWorkingHoursInContractPlanned INT DEFAULT 0;
    DECLARE percentEndedActivities INT DEFAULT 0;
    DECLARE percentProjectProgress INT DEFAULT 0;
    DECLARE percentOfAgregatedValue INT DEFAULT 0;
    DECLARE totalOverloadTime INT DEFAULT 0;
    DECLARE currentActivitiesTotalOverloadTime INT DEFAULT 0;

   # fred SUM(originalEstimate) / 3600
	# Soma das horas previstas para conclusão das atividades presentes no Jira considerando as estimativas iniciais
	SELECT SUM(
		case 
			when progressCurrent <= originalEstimate then progressCurrent / 3600
			else  0
		end
	) INTO originalEstimateTime FROM activity WHERE projectKey = projectKeyIn and currentStatus <> 'Itens conclu�dos'; 


select * from activity a 
where a.progressCurrent > originalEstimate 

	#fred
	# Soma das horas previstas para conclusão das atividades presentes no Jira considerando as estimativas revisitadas
	SELECT SUM(
		case 
			when progressCurrent <= progressTotal then progressCurrent / 3600
			else  0
		end
	) INTO originalEstimateTime FROM activity WHERE projectKey = projectKeyIn and currentStatus <> 'Itens conclu�dos';

	#fred - considerando as estimativas revisitadas - atividade fechada eh currentSttaus = 'itens concluidos' e nao progressPercent = 100; precisamos melhorar o tratamento desses dados
	# Quantidade de horas previstas em atividades fechadas até o momento
	SELECT SUM(originalEstimate) / 3600 INTO originalEstimateClosedActivities FROM activity WHERE projectKey = projectKeyIn AND currentStatus = 'Itens conclu�dos';

	#fred - atividade fechada eh currentSttaus = 'itens concluidos' e nao progressPercent = 100; precisamos melhorar o tratamento desses dados
	# Quantidade de horas consumidas nas atividades fechadas até o momento
	SELECT SUM(progressCurrent) / 3600 INTO timeConsumedClosedActivities FROM activity WHERE projectKey = projectKeyIn AND currentStatus = 'Itens conclu�dos';

	# Quantidade de horas consumidas nas atividades em geral
	SELECT SUM(progressCurrent) / 3600 INTO timeConsumedSoFar FROM activity WHERE projectKey = projectKeyIn;
	
	# pendente contabilizar backlog contam ou apenas com status em andamento, ou seja, nao filtrar por versao ou sprint
	# Quantidade de horas originalmente planejadas para as atividades ja iniciadas (finalizadas ou nao)
	SELECT SUM(originalEstimate) / 3600 INTO originalEstimateOfActivitiesAlreadyStarted FROM activity WHERE projectKey = projectKeyIn AND progressPercent > 0;

	# alterado fred
	# Quantidade de horas previstas em contrato
	SELECT workingHoursInContract INTO totalWorkingHoursInContract FROM project WHERE projectKey = projectKeyIn;

	#fred add trim pendente add quantidade de caracteres e futaramente melhorar racional
	# Quantidade de atividades sem descricao no Jira
    SELECT count(*) INTO qtyActivitiesWithoutDescription FROM activity WHERE (TRIM(description) = '' OR TRIM(description) is NULL) AND projectKey = projectKeyIn;

   	#fred
	# Quantidade de atividades sem horas estimadas no Jira
    SELECT count(*) INTO qtyActivitiesWithoutEstimateTime FROM activity WHERE projectKey = projectKeyIn AND (progressTotal = 0 AND originalEstimate = 0);

	# Quantidade de atividades com sobrecarga de trabalho no Jira (foram gastas mais horas do que planejado)
    SELECT count(*) INTO qtyActivitiesWithOverload FROM activity WHERE projectKey = projectKeyIn AND (progressCurrent > originalEstimate);

   	#fred - - atividade fechada eh currentcurrentStatus = 'Itens conclu�dos';
	# Quantidade de atividades finalizadas
    SELECT count(*) INTO qtyEndedActivities FROM activity WHERE projectKey = projectKeyIn AND currentStatus = 'Itens conclu�dos';

	# Quantidade de atividades totais (todos os status)
    SELECT count(*) INTO qtyActivities FROM activity WHERE projectKey = projectKeyIn;
   
   #fred - nao tinha currentEstimateTime
   SELECT SUM(progressTotal) / 3600 INTO currentEstimateTime FROM activity WHERE projectKey = projectKeyIn;
    
    # Relação entre a quantidade de horas reestimadas e as horas estimadas originalmente
    SET deviationPercent = ( 1 - (currentEstimateTime / originalEstimateTime)) * 100;
    
    # Percentual de valor agregado em relação ao todo - Horas estimadas originalmente para as atividades já fechadas dividido pelas horas em contrato)
    SET percentOfAgregatedValue = (originalEstimateClosedActivities / totalWorkingHoursInContract) * 100;

	# Percentual de atividades sem descricao
    SET percentActivitiesWithoutDescription = (qtyActivitiesWithoutDescription / qtyActivities) * 100;
    
	# Percentual de atividades sem estimativa de tempo
    SET percentActivitiesWithoutEstimateTime = (qtyActivitiesWithoutEstimateTime / qtyActivities) * 100;

   #atualmente esta negativando caso haja tempos de execucao menor q a estimativa original
	# Quantidade de tempo de overload ate o momento (quantidade de mais horas gastas alem do planejado em atividades fechadas)
	SET totalOverloadTime = timeConsumedClosedActivities - originalEstimateClosedActivities;
    
    # Quantidade de horas consumidas das atividades ja iniciadas (finalizadas ou nao) menos a quantidade de horas planejadas para essas atividades
    SET currentActivitiesTotalOverloadTime = timeConsumedSoFar - originalEstimateOfActivitiesAlreadyStarted;
    
    # Quantidade de atividades que foram subestimadas
    SET percentActivitiesWithOverloadTime = (qtyActivitiesWithOverload / qtyActivities) * 100;
    
    # Percentual de atividades fechadas em relacao as atividades existentes no Jira
    SET percentEndedActivities = (qtyEndedActivities / qtyActivities) * 100;
    
    # Percentual de horas vendidas em contrato em relação às horas de atividades que estão previstas em atividades no Jira
    SET percentOfWorkingHoursInContractPlanned = (originalEstimateTime / totalWorkingHoursInContract) * 100;
    
    # Insercao na base
    INSERT INTO consolidation SET projectKey = projectKeyIn, 
								  originalEstimateTime = originalEstimateTime, 
                                  originalEstimateClosedActivities = originalEstimateClosedActivities,
                                  originalEstimateOfActivitiesAlreadyStarted = originalEstimateOfActivitiesAlreadyStarted,
                                  workingHoursInContract = totalWorkingHoursInContract,
                                  timeConsumedSoFar = timeConsumedSoFar,
                                  currentEstimateTime = currentEstimateTime,
                                  timeConsumedClosedActivities = timeConsumedClosedActivities,
                                  progressPercent = percentProjectProgress,
                                  deviationPercent = deviationPercent,
                                  agregatedValue = percentOfAgregatedValue,
                                  percentActivitiesWithoutDescription = percentActivitiesWithoutDescription,
                                  percentActivitiesWithoutEstimateTime = percentActivitiesWithoutEstimateTime,
                                  totalOverloadTime = totalOverloadTime,
                                  percentActivitiesWithOverloadTime = percentActivitiesWithOverloadTime,
                                  percentOfWorkingHoursInContractPlanned = percentOfWorkingHoursInContractPlanned,
                                  percentEndedActivities = percentEndedActivities;
                                  
END
                       
#CREATE USER 'projects_usr'@'*' IDENTIFIED WITH mysql_native_password BY '567825@a';
CREATE USER 'projects_usr'@'localhost' IDENTIFIED WITH mysql_native_password BY '567825@a';

grant all privileges on status_report_db.* to 'projects_usr'@'*';

flush privileges;