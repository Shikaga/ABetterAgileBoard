export class DataCombiner {
	constructor(taskHandler, sourceHandlers, closedSourceHandlers, drawColumns) {
		this.taskHandler = taskHandler;
		this.sourceHandlers = sourceHandlers;
		this.closedSourceHandlers = closedSourceHandlers;

		this.drawColumns = drawColumns;

		this.tasks = new Map();
		this.closedTasks = [];
		this.unknowns = [];

		this.dataWaiting = 0;

		this.sourceHandlers.forEach((sourceHandler) => {
			this.dataWaiting++;
			sourceHandler.setCallback(this.sourceDataComplete.bind(this));
		});

		this.closedSourceHandlers.forEach((closedSourceHandler) => {
			this.dataWaiting++;
			closedSourceHandler.setCallback(this.closedSourceDataComplete.bind(this));
		});
		
		this.dataWaiting++;
		this.taskHandler.setCallback(this.taskDataComplete.bind(this));

		try {
			this.sourceHandlers.forEach((sourceHandler) => {
				sourceHandler.getBranches()
			 		.then(() => sourceHandler.getPullRequests())
		 	});

			this.closedSourceHandlers.forEach((closedSourceHandler) => {
				closedSourceHandler.getClosedPullRequests()
		 	});
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

	closedSourceDataComplete() {
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

	addPRToCorrectTask(pr) {
		var taskIds = this.getTaskIdsFromBranchName(pr.head.label)
		if (taskIds.length == 0) {
			//this.unknowns.push(branch);
			console.log("FIX ME!!!")
		} else {
			taskIds.forEach((taskId) => {
				this.initialiseTask(taskId);
				pr.head.location = "CLOSED";
				this.tasks.get(taskId).branches.push(pr.head);
			})
		}
	}

	updateAllData() {
		this.taskHandler.tasks.forEach((jira) => {
			this.initialiseTask(jira.key);
			this.tasks.get(jira.key).taskInfo = jira;
		})


		this.sourceHandlers.forEach((sourceHandler) => {
			sourceHandler.branches.forEach((branch) => {
				this.addBranchToCorrectTask(branch)
			})
		})

		this.closedSourceHandlers.forEach((closedSourceHandler) => {
			closedSourceHandler.closedPRs.forEach((closedPR) => {
				this.addPRToCorrectTask(closedPR);
			})
		})


		
		this.drawColumns();
	}
}