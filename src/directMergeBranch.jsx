import { List, showToast, Toast, ActionPanel, Action, Icon } from "@raycast/api";
import { listRepoBranches, createPullRequest } from "./model/bitbucket";
import { useEffect, useState } from "react";

async function mergeBranchAction(repo, fromBranch, destBranch, closeSource = false) {
  const toast = await showToast({
    style: Toast.Style.Animated,
    title: `Merge Branch`,
    message: `${fromBranch.name} to ${destBranch} ...`,
  });
  try {
    await createPullRequest(repo, fromBranch.name, fromBranch.name, destBranch, closeSource, true);
  } catch (e) {
    console.log(e);
    toast.style = Toast.Style.Failure;
    if (e.response) {
      toast.message = `Error: ${e.response.data.error.message}`;
    } else {
      toast.message = `Error: ${e.message}`;
    }
    return;
  }
  toast.style = Toast.Style.Success;
  toast.message = `${fromBranch.name} merge to ${destBranch} successfully`;
}

export default function MergeBranchList({ repo, fromBranch }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState({ values: [] });
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setIsLoaded(false);
    listRepoBranches(repo, keyword)
      .then((_data) => {
        setData(_data);
        setIsLoaded(true);
      })
      .catch((err) => {
        showToast(Toast.Style.Failure, "Failed loading repositories", err.message);
      });
  }, [keyword]);

  return (
    <List
      isLoading={!isLoaded}
      searchText={keyword}
      throttle={true}
      onSearchTextChange={setKeyword}
      searchBarPlaceholder="Search by name..."
      key="branch-list"
    >
      <List.Section key="label_branch" title="Branches for select">
        {data.values
          .filter((b) => b.name != fromBranch.name)
          .map((branch) => {
            const user = branch.target.author.user || { nickname: branch.target.author.raw };
            return (
              <List.Item
                key={"for_select_" + branch.name}
                title={branch.name}
                icon="bitbucket-branch.svg"
                accessoryTitle={`Created by : ${user.nickname} `}
                actions={
                  <ActionPanel>
                    <Action
                      icon={Icon.ArrowRight}
                      key="merge"
                      title={`To ${branch.name}`}
                      onAction={mergeBranchAction.bind(null, repo, fromBranch, branch.name)}
                    />
                    <Action
                      icon={Icon.ArrowRight}
                      key="merge_close"
                      title={`To ${branch.name} & Close Source`}
                      onAction={mergeBranchAction.bind(null, repo, fromBranch, branch.name, true)}
                    />
                  </ActionPanel>
                }
              />
            );
          })}
      </List.Section>
    </List>
  );
}
