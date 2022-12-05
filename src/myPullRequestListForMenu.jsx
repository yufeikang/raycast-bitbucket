import { environment, MenuBarExtra } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useState } from "react";
import { renderPullRequestMenuItem } from "./components/pullRequestItem";
import { listMyPullRequests } from "./model/bitbucket";
import { timestamp } from "./utils/datetime";

function groupByProject(prs) {
  const grouped = prs.reduce((acc, pr) => {
    const key = pr.destination.repository.slug;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(pr);
    return acc;
  }, {});
  return Object.entries(grouped);
}

async function checkPr(pr) {
  if (timestamp(pr.updated_on) + 1000 * 60 < new Date().getTime()) {
    return;
  }
  console.log(pr);
  // TODO
}

export default function MyPullRequestList() {

  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const { isLoading, data } = useCachedPromise(async () => {
    console.log("pr: update data");
    const _data = await listMyPullRequests();
    setLastUpdateTime(new Date());
    if (environment.launchType === "background") {
      _data.values.forEach(checkPr);
    }
    return _data;
  }, [], { keepPreviousData: true, initialData: { values: [] } });

  console.log(`rendering ${data.values.length} pull requests, launchType: ${environment.launchType}, loading: ${isLoading}, lastUpdateTime: ${lastUpdateTime}`);
  return (
    <MenuBarExtra
      isLoading={isLoading}
      key="my-pr-list-section"
      tooltip="My bitbucket pull request"
      title="My PR"
      icon="bitbucket-pull-request.svg">
      <MenuBarExtra.Item title={(() => {
        if (lastUpdateTime) {
          return `Last updated: ${lastUpdateTime.toLocaleString()}`;
        } else {
          return "Loading...";
        }
      })()} />

      {groupByProject(data.values)
        .sort((a, b) => timestamp(b[1][0].updated_on) - timestamp(a[1][0].updated_on))
        .map(([project, prs]) => {
          return (
            <MenuBarExtra.Section title={project} key={project}>
              {prs.map((pr) => {
                return renderPullRequestMenuItem(pr, pr.destination.repository);
              })}
            </MenuBarExtra.Section>
          );
        })}
    </MenuBarExtra>
  );
}
