import { Octokit, App } from "https://cdn.skypack.dev/octokit";

export class GitHubHandler {

	constructor(owner,repo, token) {
	  this.owner = owner;
	  this.repo = repo;
	  this.token = token;
	  this.dataChangedCallback = null;
	  this.octokit = new Octokit({
		auth: token
	  });
	  this.branches = [];
	  this.branchDataStillToGet = null;
	}

	setCallback(dataChangedCallback) {
	  this.dataChangedCallback = dataChangedCallback;
	}

	moveBranchToPR(branchSha) {
	  var branchUpdated = false;
	  this.branches.forEach((branch) => {
		if (branch.commit.sha == branchSha) {
		  branch.location = 'PR'
		  branchUpdated = true;
		}
	  })
	  if (!branchUpdated) {
		console.log("Could not find branch to move to PR", branchSha, this.branches)
	  }
	}

	moveBranchToAM(branchSha) {
	  var branchUpdated = false;
	  this.branches.forEach((branch) => {
		if (branch.commit.sha == branchSha) {
		  branch.location = 'AM'
		  branchUpdated = true;
		}
	  })
	  if (!branchUpdated) {
		console.log("Could not find branch to move to AM", branchSha, this.branches)
	  }
	}

	async getPullRequests() {
	  const result = await this.octokit.request("GET /repos/{owner}/{repo}/pulls", {
		owner: this.owner,
		repo: this.repo,
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
		if (result.data.mergeable_state == "clean") {
			console.log("Move Clean Branch to AM", result.data.head.ref);
			this.moveBranchToAM(result.data.head.sha)
		} else if (result.data.mergeable_state == "blocked") {
			console.log("Move Blocked Branch to PR", result.data.head.ref);
			this.moveBranchToPR(result.data.head.sha)
		} else if (result.data.mergeable_state == "unknown") {
			console.log("Move Unknown Branch to PR", result.data.head.ref);
			this.moveBranchToPR(result.data.head.sha)
	 	} else {
			console.log("Unknown mergable_state", result.data.mergeable_state)
			console.log("Can't move Branch", result.data.head.ref);
		}
		if (this.branchDataStillToGet == 0) {
			this.dataChangedCallback()
			console.log("!!!");
		} else {
			console.log(this.branchDataStillToGet);
		}
		
	}

	async getBranches(page = 1) {
		const result = await this.octokit.request("GET /repos/{owner}/{repo}/branches", {
			owner: this.owner,
			repo: this.repo,
			per_page: 100,
			page: page
		});
		this.branches = this.branches.concat(result.data);
		this.branches.forEach((branch) => {
			branch.location = "DEV"
		})
		console.log("BRANCH LENGTGH", result.data.length)
		if (result.data.length === 100) {
			return this.getBranches(page+1);
		}
	}
}