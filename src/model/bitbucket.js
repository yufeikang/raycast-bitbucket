import axios from "axios";
import { getPreferenceValues } from "@raycast/api";

// https://developer.atlassian.com/cloud/bitbucket/rest

const preferenceValues = getPreferenceValues();

const instance = axios.create({
  baseURL: "https://api.bitbucket.org",
});
instance.defaults.timeout = 100000;
instance.defaults.auth = { username: preferenceValues.username, password: preferenceValues.password };

export async function listRepo(keyword) {
  // list bitbucket repo
  const url = `/2.0/repositories/${preferenceValues.workspace}/`;
  const params = {
    pagelen: 100,
    sort: "-updated_on",
    fields: [
      "values.name",
      "values.uuid",
      "values.slug",
      "values.full_name",
      "values.links.avatar.href",
      "values.description",
      "next",
    ].join(","),
  };
  if (keyword !== "") {
    params.q = `name~"${keyword}"`;
  }
  const response = await instance.get(url, {
    params,
  });
  return response.data;
}

export function getRepoUrl(repo) {
  return `https://bitbucket.org/${preferenceValues.workspace}/${repo.slug}`;
}

export function getPipelineUrl(repo, pipeline) {
  return `https://bitbucket.org/${preferenceValues.workspace}/${repo.slug}/addon/pipelines/home#!/results/${pipeline.build_number}`;
}

export async function getBranchModel(repo) {
  const url = `/2.0/repositories/${preferenceValues.workspace}/${repo.slug}/branching-model`;
  const response = await instance.get(url);
  return response.data;
}

export async function listRepoBranches(repo, keyword = "") {
  // list bitbucket repo branches
  const url = `/2.0/repositories/${preferenceValues.workspace}/${repo.slug}/refs/branches`;
  const params = { pagelen: 30, fields: "+values.date" };
  if (keyword !== "") {
    params.q = `name~"${keyword}"`;
  }
  const response = await instance.get(url, {
    params,
  });
  return response.data;
}

export async function listRepoPullRequests(repo, keyword = "") {
  // list bitbucket repo pull requests
  const url = `/2.0/repositories/${preferenceValues.workspace}/${repo.slug}/pullrequests`;
  const params = {
    fields: [
      "+values.target.commit.message",
      "values.uuid",
      "+values.target.selector.type+values.target.selector.pattern+values.target.commit.summary.html",
      "+values.target.*",
      "+values.*",
      "+values.destination.repository",
      "+values.destination.branch",
      "+page",
      "+size",
    ].join(","),
    sort: "-created_on",
  };
  if (keyword !== "") {
    params.q = `title~"${keyword}" AND state="OPEN"`;
  }
  const response = await instance.get(url, {
    params
  });
  return response.data;
}

export async function deleteBranch(repo, branch) {
  // delete bitbucket repo branch
  const url = `/2.0/repositories/${preferenceValues.workspace}/${repo.slug}/refs/branches/${branch.name}`;
  const response = await instance.delete(url);
  return response.data;
}

export async function createBranch(repo, branchName, source) {
  // create bitbucket repo branch
  const url = `/2.0/repositories/${preferenceValues.workspace}/${repo.slug}/refs/branches`;
  const data = {
    name: branchName,
    target: {
      hash: source,
    },
  };
  const response = await instance.post(url, data);
  return response.data;
}

export async function createPullRequest(repo, title, sourceName, destinationName, closeSource = false, merge = false) {
  // create bitbucket repo pull request
  const url = `/2.0/repositories/${preferenceValues.workspace}/${repo.slug}/pullrequests`;
  const data = {
    title: title,
    source: {
      branch: {
        name: sourceName,
      },
    },
    destination: {
      branch: {
        name: destinationName,
      },
    },
    close_source_branch: closeSource,
  };
  const response = await instance.post(url, data);
  const pullRequestId = response.data.id;
  if (merge) {
    const pr = await mergePullRequest(repo, pullRequestId);
    return pr;
  }
  return response.data;
}

export async function mergePullRequest(repo, pullRequestId) {
  // merge bitbucket repo pull request
  const url = `/2.0/repositories/${preferenceValues.workspace}/${repo.slug}/pullrequests/${pullRequestId}/merge`;
  const response = await instance.post(url, {
    params: {
      async: true,
    },
  });
  return response.data;
}

export async function declinePullRequest(repo, pullRequestId) {
  // decline bitbucket repo pull request
  const url = `/2.0/repositories/${preferenceValues.workspace}/${repo.slug}/pullrequests/${pullRequestId}/decline`;
  const response = await instance.post(url);
  return response.data;
}

export async function pullRequestAddReviews(repo, pullRequestId, reviews) {
  console.log(repo);
  // add bitbucket repo pull request reviews
  const url = `/2.0/repositories/${preferenceValues.workspace}/${repo.slug}/pullrequests/${pullRequestId}`;
  const data = {
    reviewers: reviews.map((review) => ({ uuid: review })),
  };
  const response = await instance.put(url, data);
  return response.data;
}

export async function listPipelines(repo) {
  // list bitbucket repo pipelines
  const url = `/2.0/repositories/${preferenceValues.workspace}/${repo.slug}/pipelines/`;
  const response = await instance.get(url, {
    params: {
      pagelen: 15,
      sort: "-created_on",
      fields: [
        "+values.target.commit.message",
        "values.uuid",
        "+values.target.selector.type+values.target.selector.pattern+values.target.commit.summary.html",
        "+values.target.*",
        "+values.*",
        "+page",
        "+size",
      ].join(","),
    },
  });
  return response.data;
}
export async function listPipelineSteps(repo, pipeline) {
  // list bitbucket repo pipeline steps
  const url = `/2.0/repositories/${preferenceValues.workspace}/${repo.slug}/pipelines/${pipeline.uuid}/steps/`;
  const response = await instance.get(url);
  for (let step of response.data.values) {
    try {
      const log = await getPipelineStepLog(repo, pipeline, step);
      step.log = log;
    } catch (e) {
      if (e.response.status !== 404) {
        console.log(e);
      }
      step.log = "No log";
    }
  }
  return response.data;
}

export async function getPipelineStepLog(repo, pipeline, step) {
  // list bitbucket repo pipeline step logs
  const url = `/2.0/repositories/${preferenceValues.workspace}/${repo.slug}/pipelines/${pipeline.uuid}/steps/${step.uuid}/log`;
  const response = await instance.get(url);
  return response.data;
}
export async function stopPipeline(repo, pipeline) {
  // stop bitbucket repo pipeline
  const url = `/2.0/repositories/${preferenceValues.workspace}/${repo.slug}/pipelines/${pipeline.uuid}/stopPipeline`;
  const response = await instance.post(url);
  return response.data;
}

export async function listMyPullRequests() {
  // list bitbucket repo pull requests
  const url = `/2.0/pullrequests/${preferenceValues.username}`;
  const params = {
    fields: [
      "+values.target.commit.message",
      "values.uuid",
      "+values.target.selector.type+values.target.selector.pattern+values.target.commit.summary.html",
      "+values.target.*",
      "+values.*",
      "+values.destination.repository.*",
      "+values.destination.branch",
      "+page",
      "+size",
    ].join(","),
    sort: "-updated_on",
  };

  const response = await instance.get(url, {
    params,
  });
  return response.data;
}

export async function listUsersByPr(repo) {
  // list bitbucket repo commits
  const url = `/2.0/repositories/${preferenceValues.workspace}/${repo.slug}/pullrequests`;
  const params = {
    fields: [
      "-values.rendered",
      "-values.destination",
      "-values.source",
      "-values.links",
      "-values.summary",
      "-values.closed_by",
      "-values.merge_commit",
      "-values.author",
      "+values.reviewers",
    ].join(","),
    pagelen: 30,
    q: '(state = "MERGED" OR state = "OPEN") and reviewers.uuid != null',
  };

  const response = await instance.get(url, {
    params,
  });
  const result = new Set();
  response.data.values.forEach((pr) => {
    pr.reviewers.forEach((reviewer) => {
      result.add(reviewer);
    });
  });
  response.data.values = new Array(...result);
  return response.data;
}

export async function listUsers() {
  const url = `/2.0/workspaces/${preferenceValues.workspace}/members`;
  const response = await instance.get(url);
  return response.data;
}
