import { ActionPanel, Action, Icon, showToast, Toast, Clipboard, getPreferenceValues } from "@raycast/api";
import moment from "moment";
import BranchDetail from "./branchDetail";
import MergeBranchList from "./directMergeBranch";
import { createPullRequest, deleteBranch, createBranch } from "./model/bitbucket";

const preferenceValues = getPreferenceValues();

const hotfixPrPrefix = preferenceValues.hotfixPrPrefix || "HotFix";

async function createPullRequestAction(repo, branch, prPrefix, destName, closeSource = true, checkoutBranch = true) {
  console.log(`Creating pull request for ${destName}, ${closeSource ? "closing source" : "not closing source"}`);
  let title = branch.name;
  if (prPrefix) {
    title = `${prPrefix}/${moment().format("YYYYMMDD")}`;
  }
  const toast = await showToast({
    style: Toast.Style.Animated,
    title: `Create Pull Request`,
    message: `${title} Pull Request for ${branch.name} ...`,
  });
  let pr = null;
  try {
    if (checkoutBranch && branch.name !== title) {
      await createBranch(repo, title, branch.name);
    }
    pr = await createPullRequest(repo, title, title, destName, closeSource);
  } catch (e) {
    toast.style = Toast.Style.Failure;
    toast.message = `Error: ${e.response.data.error.message}`;
    return;
  }

  toast.style = Toast.Style.Success;
  toast.message = `Successfully, Copied to clipboard`;
  Clipboard.copy(pr.links.html.href);
}

export function branchActions(branch, repo, allowPushDetail = true, settings = {}, branchModel = {}) {
  let protectedBranch = ["develop", "master", "dev", "main"];
  let developBranchName = "develop";
  let mainBranchName = "master";
  if (!!branchModel && branchModel.isProtected) {
    developBranchName = branchModel.development.branch.name || "develop";
    mainBranchName = branchModel.production.branch.name || "master";
    protectedBranch = [developBranchName, mainBranchName];
  }

  return (
    <ActionPanel>
      {allowPushDetail && (
        <Action.Push
          icon={Icon.ArrowRight}
          title="Go Detail"
          target={<BranchDetail branch={branch} repo={repo} settings={settings} branchModel={branchModel} />}
        />
      )}
      <Action.Push
        icon={Icon.ArrowRight}
        title="Direct Merge To"
        target={<MergeBranchList fromBranch={branch} repo={repo} protectedBranch={protectedBranch} />}
      />
      <Action.OpenInBrowser url={branch.links.html.href} />
      <Action
        key="create-develop-pr"
        title="Develop Pull Request"
        icon={Icon.Hammer}
        onAction={createPullRequestAction.bind(null, repo, branch, null, developBranchName, true, false)}
      />
      {branch.name !== mainBranchName && (
        <Action
          key="create-hotfix-pr"
          title="Hotfix Pull Request"
          icon={Icon.Hammer}
          onAction={createPullRequestAction.bind(null, repo, branch, hotfixPrPrefix, mainBranchName)}
        />
      )}
      <Action
        key="delete-branch"
        title="Delete"
        icon={Icon.Trash}
        onAction={async () => {
          const toast = await showToast({
            style: Toast.Style.Animated,
            title: "Delete Branch",
            message: `Deleting ${branch.name} ...`,
          });
          try {
            await deleteBranch(repo, branch);
          } catch (error) {
            console.log(error);
            toast.style = Toast.Style.Failure;
            toast.message = `${branch.name} deletion failed, ${error.message}`;
            return;
          }
          toast.style = Toast.Style.Success;
          toast.message = `${branch.name} deleted successfully`;
        }}
      />
    </ActionPanel>
  );
}
