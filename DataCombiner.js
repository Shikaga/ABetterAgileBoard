export class DataCombiner {
	constructor(taskHandler, sourceHandler, drawColumns) {
		this.taskHandler = taskHandler;
		this.sourceHandler = sourceHandler;
		this.drawColumns = drawColumns;
		this.tasks = {};
		this.unknowns = [];

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
		this.taskHandler.jiras.forEach((jira) => {
			this.tasks[jira.key] = jira;
		})
	}

	sourceDataComplete() {
		this.drawColumns();
	}
}