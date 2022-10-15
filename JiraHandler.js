export class JiraHandler {
	constructor() {
		this.tasks = []
		this.loadCompleteCallback = null;
	}

	setCallback(loadCompleteCallback) {
		this.loadCompleteCallback = loadCompleteCallback;
		this.loadJiraData()
	}

	loadJiraData() {
		fetch("./JiraData.json")
			.then(response => response.json())
			.then(json => {this.tasks = json.issues})
			.then(() => {this.loadCompleteCallback()});
	}
}