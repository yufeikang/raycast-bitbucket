import { List } from "@raycast/api";
import { useEffect, useState } from "react";
import { listPipelines } from "./model/bitbucket";
import { pipelineActions } from "./pipelineActions";
import moment from "moment";
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

export default function PipelineList({ repo }) {
  const [pipelineIsLoading, setPipelineIsLoading] = useState(false);
  const [pipelines, setPipelines] = useState({ values: [] });

  useEffect(() => {
    setPipelineIsLoading(true);
    listPipelines(repo).then((_pr) => {
      // filter out pipelines that are older than 1 day;
      const _pipelines = _pr.values.filter((p) => p.created_on > moment().subtract(1, "days").toISOString()) || [];
      _pr.values = _pipelines;
      setPipelines(_pr);
      setPipelineIsLoading(false);
    });
  }, []);
  return (
    <List isLoading={pipelineIsLoading} navigationTitle={`${repo.name}'s Pipelines`}>
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
    </List>
  );
}
