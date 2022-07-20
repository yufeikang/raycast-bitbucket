import { ActionPanel, List, Action, showToast, Toast, Icon } from "@raycast/api";
import { getRepoUrl, listRepo } from "./model/bitbucket";
import { useEffect, useState } from "react";
import RepoDetail from "./repoDetail";
import RepoSetting from "./repoSetting";
import { createReleasePr } from "./action";

export default function Command() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState({ values: [] });
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setIsLoaded(false);
    listRepo(keyword)
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
      key="projects-list"
    >
      <List.Section title="Repositories" subtitle={data.values.length.toString()}>
        {data.values.length === 0
          ? () => <List.EmptyView title="No Project Found" />
          : data.values.map((repo) => (
              <List.Item icon={repo.links.avatar.href} title={repo.name} key={repo.uuid} actions={repoActions(repo)} />
            ))}
      </List.Section>
    </List>
  );
}
function repoActions(repo) {
  return (
    <ActionPanel>
      <Action.Push icon={Icon.Hammer} title="Repo Details" target={<RepoDetail repo={repo} />} />
      <Action.OpenInBrowser url={getRepoUrl(repo)} />
      <Action
        key="create-release-pr"
        title="Release Pull Request"
        icon={Icon.Hammer}
        onAction={() => createReleasePr(repo)}
      />
      <Action.Push key="setting" title="Setting" icon={Icon.Hammer} target={<RepoSetting repo={repo} />} />
    </ActionPanel>
  );
}
