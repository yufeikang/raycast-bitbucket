import { List, LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";
import { listRepoBranches, listRepoPullRequests, getBranchModel } from "./model/bitbucket";
import { branchActions } from "./branchActions";
import { renderPullRequestItem } from "./components/pullRequestItem";

export default function RepoDetail({ repo }) {
  const [branchesIsLoading, setBranchesIsLoading] = useState(false);
  const [prIsLoading, setPrIsLoading] = useState(false);
  const [branches, setBranches] = useState({ values: [] });
  const [pullRequests, setPullRequests] = useState({ values: [] });
  const [settings, setSettings] = useState({});
  const [branchModel, setBranchModel] = useState({});
  const [settingsIsLoading, setSettingIsLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    getBranchModel(repo).then((_branchModel) => {
      setBranchModel(_branchModel);
    });
    setBranchesIsLoading(true);
    setPrIsLoading(true);
    setSettingIsLoading(true);
    listRepoBranches(repo, keyword).then((data) => {
      setBranches(data);
      setBranchesIsLoading(false);
    });
    listRepoPullRequests(repo, keyword).then((data) => {
      setPullRequests(data);
      setPrIsLoading(false);
    });
    LocalStorage.getItem(`bitbucket.repo.${repo.slug}`).then((data) => {
      setSettings(JSON.parse(data || "{}"));
      setSettingIsLoading(false);
    });
  }, [keyword]);
  return (
    <List
      isLoading={prIsLoading && branchesIsLoading && settingsIsLoading}
      searchText={keyword}
      throttle={true}
      onSearchTextChange={setKeyword}
      searchBarPlaceholder="Search by branch'name pr'title ..."
      navigationTitle={`${repo.name} Detail`}
    >
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
              subtitle={branch.target.message}
              icon="bitbucket-branch.svg"
              accessories={[
                {
                  title: `Created by ${user.nickname}`
                },
              ]}
              actions={branchActions(branch, repo, true, settings, branchModel)}
            />
          );
        })}
      </List.Section>
    </List>
  );
}
