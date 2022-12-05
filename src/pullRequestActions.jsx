import { ActionPanel, Action, Icon, showToast, Toast, LocalStorage } from "@raycast/api";
import MergeBranchList from "./directMergeBranch";
import { declinePullRequest, mergePullRequest, pullRequestAddReviews } from "./model/bitbucket";
import PullRequestDetail from "./pullRequestDetail";

export function pullRequestActions(pr, repo, allowPushDetail = true) {
  const protectedBranch = ["develop", "master", "dev", "main"];
  return (
    <ActionPanel>
      {allowPushDetail && (
        <Action.Push
          title="Pull Request Detail"
          icon={Icon.ArrowRight}
          target={<PullRequestDetail repo={repo} pullRequest={pr} />}
        />
      )}
      <Action.Push
        icon={Icon.Hammer}
        title="Direct Merge To"
        target={<MergeBranchList fromBranch={pr.source.branch} repo={repo} protectedBranch={protectedBranch} />}
      />
      <Action
        title="Add Reviewer"
        icon={Icon.Hammer}
        onAction={async () => {
          const toast = await showToast({
            style: Toast.Style.Animated,
            title: "Add Reviewer",
            message: `Add Reviewer ...`,
          });
          try {
            const settings = JSON.parse((await LocalStorage.getItem(`bitbucket.repo.${repo.slug}`)) || "{}");
            if (!settings.reviewers) {
              toast.style = Toast.Style.Failure;
              toast.message = "Please set reviewers first";
              return;
            }
            await pullRequestAddReviews(repo, pr.id, settings.reviewers);
          } catch (error) {
            console.log(error);
            toast.style = Toast.Style.Failure;
            toast.message = `Add reviewer failed, ${error.message}`;
            return;
          }
          toast.style = Toast.Style.Success;
          toast.message = `${pr.title} add reviewer`;
        }}
      />
      <Action
        title="Merge"
        icon={Icon.Hammer}
        onAction={async () => {
          const toast = await showToast({
            style: Toast.Style.Animated,
            title: "Merge Branch",
            message: `${pr.title} ...`,
          });
          try {
            await mergePullRequest(repo, pr.id);
          } catch (error) {
            console.log(error);
            toast.style = Toast.Style.Failure;
            toast.message = `${pr.title} merge failed, ${error.message}`;
            return;
          }
          toast.style = Toast.Style.Success;
          toast.message = `${pr.title} merge successfully`;
        }}
      />
      <Action.OpenInBrowser title="Open In Browser" url={pr.links.html.href} />
      <Action.CopyToClipboard title="Copy Url" content={pr.links.html.href} />
      <Action
        title="Decline"
        icon={Icon.Hammer}
        onAction={async () => {
          const toast = await showToast({
            style: Toast.Style.Animated,
            title: "Decline Pull Request",
            message: `${pr.title} ...`,
          });
          try {
            await declinePullRequest(repo, pr.id);
          } catch (error) {
            console.log(error);
            toast.style = Toast.Style.Failure;
            toast.message = `Decline failed, ${error.message}`;
            return;
          }
          toast.style = Toast.Style.Success;
          toast.message = "decline successfully";
        }}
      />
    </ActionPanel>
  );
}
