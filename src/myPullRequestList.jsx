import { List, showToast, Toast } from "@raycast/api";
import { listMyPullRequests } from "./model/bitbucket";
import { useEffect, useState } from "react";
import { renderPullRequestItem } from "./components/pullRequestItem";

export default function MyPullRequestList() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [data, setData] = useState({ values: [] });

  useEffect(() => {
    setIsLoaded(false);
    listMyPullRequests()
      .then((_data) => {
        setData(_data);
        setIsLoaded(true);
      })
      .catch((err) => {
        showToast(Toast.Style.Failure, "Failed loading pullRequest", err.message);
      });
  }, []);

  return (
    <List
      isLoading={!isLoaded}
      throttle={true}
      searchBarPlaceholder="Search ..."
      key="my-pull-request-list"
    >
      <List.Section title="My Pull Request" subtitle={data.values.length.toString()}>
        {data.values.map((pr) => {
          return renderPullRequestItem(pr, pr.destination.repository);
        })}
      </List.Section>
    </List>
  );
}
