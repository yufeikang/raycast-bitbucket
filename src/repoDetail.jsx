import { List, LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";
import { listRepoBranches, listRepoPullRequests, listPipelines, getBranchModel } from "./model/bitbucket";
import { branchActions } from "./branchActions";
import { pipelineActions } from "./pipelineActions";
import moment from "moment";
import { renderPullRequestItem } from "./components/pullRequestItem";
import { getAuthorAvatar } from "./utils/utils";

const pipeIcon = {
  self: "icon-pipelines.png",
  success: "icon-pipeline-success.png",
  failed: "icon-pipeline-failed.png",
  paused: "icon-pipeline-paused.png",
  progress: "icon-pipeline-progress.png",
  stopped: "icon-pipeline-stopped.png",
};

function pipelineStateIcon(state) {
  return state == "SUCCESSFUL"
    ? pipeIcon.success
    : state == "HALTED" || state == "PAUSED"
    ? pipeIcon.paused
    : state == "IN_PROGRESS" || state == "RUNNING"
    ? pipeIcon.progress
    : state == "STOPPED"
    ? pipeIcon.stopped
    : state == "FAILED"
    ? pipeIcon.failed
    : "";
} 

export default function RepoDetail({ repo }) {
  const [branchesIsLoading, setBranchesIsLoading] = useState(false);
  const [prIsLoading, setPrIsLoading] = useState(false);
  const [pipelineIsLoading, setPipelineIsLoading] = useState(false);
  const [branches, setBranches] = useState({ values: [] });
  const [pullRequests, setPullRequests] = useState({ values: [] });
  const [pipelines, setPipelines] = useState({ values: [] });
  const [settings, setSettings] = useState({});
  const [branchModel, setBranchModel] = useState({});
  const [settingsIsLoading, setSettingIsLoading] = useState(false);


  useEffect(() => {
    getBranchModel(repo).then((_branchModel) => {
      setBranchModel(_branchModel);
    });
    setBranchesIsLoading(true);
    setPrIsLoading(true);
    setPipelineIsLoading(true);
    setSettingIsLoading(true);
    listRepoBranches(repo).then((data) => {
      setBranches(data);
      setBranchesIsLoading(false);
    });
    listRepoPullRequests(repo).then((data) => {
      setPullRequests(data);
      setPrIsLoading(false);
    });
    listPipelines(repo).then((_pr) => {
      // filter out pipelines that are older than 1 day;
      const _pipelines = _pr.values.filter((p) => p.created_on > moment().subtract(1, "days").toISOString()) || [];
      _pr.values = _pipelines;
      setPipelines(_pr);
      setPipelineIsLoading(false);
    });
    LocalStorage.getItem(`bitbucket.repo.${repo.slug}`).then((data) => {
      setSettings(JSON.parse(data || "{}"));
      setSettingIsLoading(false);
    });
  }, []);
  return (
    <List
      isLoading={prIsLoading && branchesIsLoading && pipelineIsLoading && settingsIsLoading}
      navigationTitle={`${repo.name} Detail`}
    >
      <List.Section key="label_pipeline" title="Pipelines" subtitle="">
        {pipelines.values.map((pipeline) => {
          const commitMessage = pipeline.target.commit.message.split("\n")[0] || "";
          const state = pipeline.state.result ? pipeline.state.result.name : pipeline.state.stage.name;
          const pipelineImg = getAuthorAvatar(pipeline.creator);
          return (
            <List.Item
              key={pipeline.uuid}
              title={commitMessage || pipeline.uuid}
              subtitle={"#" + pipeline.build_number}
              accessoryTitle={state}
              accessoryIcon={pipelineStateIcon(state) || ""}
              actions={pipelineActions(pipeline, repo)}
              icon={pipelineImg}
            />
          );
        })}
      </List.Section>
      <List.Section key="label_pr" title="Pull requests">
        {pullRequests.values.map((pr) => {
          return renderPullRequestItem(pr, repo);
        })}
      </List.Section>
      <List.Section key="label_branch" title="Branches">
        {branches.values.map((branch) => {
          const user = branch.target.author.user || { nickname: branch.target.author.raw };
          return (
            <List.Item
              key={branch.name}
              title={branch.name}
              icon="bitbucket-branch.svg"
              accessoryTitle={`Created by : ${user.nickname} `}
              actions={branchActions(branch, repo, true, settings, branchModel)}
            />
          );
        })}
      </List.Section>
    </List>
  );
}
