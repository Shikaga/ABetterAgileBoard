export class DataCombiner {
	constructor(taskHandler, sourceHandler, drawColumns) {
		this.taskHandler = taskHandler;
		this.sourceHandler = sourceHandler;
		this.drawColumns = drawColumns;
		this.tasks = new Map();
		this.unknowns = [];
		this.dataWaiting = 2;

		this.sourceHandler.setCallback(this.sourceDataComplete.bind(this));
		this.taskHandler.setCallback(this.taskDataComplete.bind(this));

		try {
			this.sourceHandler.getBranches()
		 		.then(() => this.sourceHandler.getPullRequests())
		 		//.then(() => {drawColumns()})
		} catch (error) {
			console.log(`Error! Status: ${error.status}. Message: ${error.response.data.message}`)
		}
	}

	taskDataComplete() {
		this.dataWaiting--;
		if (this.dataWaiting === 0) {
			this.updateAllData();
		}
	}

	sourceDataComplete() {
		this.dataWaiting--;
		if (this.dataWaiting === 0) {
			this.updateAllData();
		}
	}

	getTaskIdsFromBranchName(branchName) {
		const regex = /([A-Z]+-[0-9])\w+/g;
		var taskIds = branchName.match(regex);
		return taskIds || [];
	}

	initialiseTask(taskId) {
		if (this.tasks.get(taskId)) {

		} else {
			this.tasks.set(taskId, {
				taskInfo: null,
				branches: []
			});
		}
	}

	addBranchToCorrectTask(branch) {
		var taskIds = this.getTaskIdsFromBranchName(branch.name)
		if (taskIds.length == 0) {
			this.unknowns.push(branch);
		} else {
			taskIds.forEach((taskId) => {
				this.initialiseTask(taskId);
				this.tasks.get(taskId).branches.push(branch);
			})
		}
	}

	updateAllData() {
		this.taskHandler.tasks.forEach((jira) => {
			this.initialiseTask(jira.key);
			this.tasks.get(jira.key).taskInfo = jira;
		})

		this.sourceHandler.branches.forEach((branch) => {
			this.addBranchToCorrectTask(branch)
		})


		/*
			Create an map for all items to display on the ticket. 
				Jira ID is the key to the map
			Create an Unmapped array for all other Pull Requests
			Each of these items should have
				- Link to  Jira Data 
				- Array of Branches
		*/


		
		this.drawColumns();
	}
}