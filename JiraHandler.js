export class JiraHandler {
	constructor() {
		this.jiras = []
		this.loadCompleteCallback = null;
	}

	setCallback(loadCompleteCallback) {
		this.loadCompleteCallback = loadCompleteCallback;
		this.loadJiraData()
	}

	loadJiraData() {
		fetch("./JiraData.json")
			.then(response => response.json())
			.then(json => {this.jiras = json.issues})
			.then(() => {this.loadCompleteCallback()});
	}
}