import { Octokit, App } from "https://cdn.skypack.dev/octokit";

export class GitHubClosedHandler {

	constructor(owner,repo, token) {
	  this.owner = owner;
	  this.repo = repo;
	  this.token = token;
	  this.dataChangedCallback = null;
	  this.octokit = new Octokit({
		auth: token
	  });
	  this.closedPRs = [];
	  this.branchDataStillToGet = null;
	}

	setCallback(dataChangedCallback) {
	  this.dataChangedCallback = dataChangedCallback;
	}

	async getClosedPullRequests() {
	  const result = await this.octokit.request("GET /repos/{owner}/{repo}/pulls", {
		owner: this.owner,
		repo: this.repo,
		state: "closed"
	  });
	  console.log("Total PRs", result.data.length)
	  this.branchDataStillToGet = result.data.length;
	  result.data.forEach((pr) => {
		this.getPullRequest(pr.number)
	  })
	}

	async getPullRequest(request) {
		const result = await this.octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
			owner: this.owner,
			repo: this.repo,
			pull_number: request,
		});
		this.branchDataStillToGet--;
		this.closedPRs.push(result.data);

		if (this.branchDataStillToGet == 0) {
			this.dataChangedCallback()
			console.log("!!!");
		} else {
			console.log(this.branchDataStillToGet);
		}
		
	}
}