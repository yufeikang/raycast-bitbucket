import { ActionPanel, Action, Icon, showToast, Toast } from "@raycast/api";
import { getPipelineUrl, stopPipeline } from "./model/bitbucket";
import PipelineDetail from "./pipelineDetail";

export function pipelineActions(pipeline, repo, allowPushDetail = true) {
  return (
    <ActionPanel>
      {allowPushDetail && (
        <Action.Push
          title="Pipeline Detail"
          icon={Icon.ArrowRight}
          target={<PipelineDetail repo={repo} pipeline={pipeline} />}
        />
      )}
      <Action.OpenInBrowser title="Open In Browser" url={getPipelineUrl(repo, pipeline)} />
      <Action
        title="Stop Pipeline"
        icon={Icon.Hammer}
        onAction={async () => {
          const toast = await showToast({
            style: Toast.Style.Animated,
            title: "Stop Pipeline",
            message: `Stop Pipeline ${pipeline.build_number} ...`,
          });
          try {
            await stopPipeline(repo, pipeline);
          } catch (error) {
            console.log(error);
            toast.style = Toast.Style.Failure;
            toast.message = `${pipeline.build_number} stop failed, ${error.message}`;
            return;
          }
          toast.style = Toast.Style.Success;
          toast.message = `${pipeline.build_number} stop successfully`;
        }}
      />
    </ActionPanel>
  );
}
