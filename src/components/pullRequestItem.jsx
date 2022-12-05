import { List, Icon, MenuBarExtra, open } from "@raycast/api";
import { getAuthorAvatar } from "../utils/utils";
import { pullRequestActions } from "../pullRequestActions";

export function renderPullRequestItem(pr, repo) {
  const authorIcon = getAuthorAvatar(pr.author);
  const approvers = pr.participants.filter((participant) => participant.approved);
  return (
    <List.Item
      key={pr.id}
      title={pr.title}
      subtitle={`${pr.destination.repository.full_name}#${pr.destination.branch.name}`}
      accessories={[
        { icon: authorIcon, tooltip: "Author" },
        { icon: Icon.TwoPeople, text: `${approvers.length}/${pr.reviewers.length}`, tooltip: "Approved/Reviewers" },
        { date: new Date(pr.updated_on), tooltip: "Last Updated", icon: Icon.Clock },
      ]}
      icon="bitbucket-pull-request.svg"
      actions={pullRequestActions(pr, repo)}
    />
  );
}

export function renderPullRequestMenuItem(pr, repo) {
  const authorIcon = getAuthorAvatar(pr.author);
  const approvers = pr.participants.filter((participant) => participant.approved);
  return (
    <MenuBarExtra.Submenu
      key={pr.id}
      title={pr.title}
      subtitle={`${pr.destination.repository.full_name}#${pr.destination.branch.name}`}
      icon="bitbucket-pull-request.svg"
    >
      <MenuBarExtra.Item
        title="Open"
        icon={Icon.Link}
        onAction={async () => {
          await open(pr.links.html.href);
        }} />
      <MenuBarExtra.Item icon={authorIcon} title={pr.author.display_name} />
      <MenuBarExtra.Item icon={Icon.TwoPeople} title={`${approvers.length}/${pr.reviewers.length}`} />
      <MenuBarExtra.Item icon={Icon.Clock} title={`Last Update: ${pr.updated_on}`} />
      <MenuBarExtra.Item icon={Icon.Book} title={pr.description} />
    </MenuBarExtra.Submenu>
  );
}
