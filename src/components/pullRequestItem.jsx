import { List } from "@raycast/api";
import { getAuthorAvatar } from "../utils/utils";
import { pullRequestActions } from "../pullRequestActions";



export function renderPullRequestItem(pr, repo) {
  const authorIcon = getAuthorAvatar(pr.author);

  return (
    <List.Item
      key={pr.name}
      title={pr.title}
      subtitle={`${pr.destination.repository.full_name}#${pr.destination.branch.name}`}
      accessoryTitle={` ${pr.comment_count}💬| ${pr.reviewers.length} Reviewers `}
      accessoryIcon={authorIcon}
      icon="bitbucket-pull-request.svg"
      actions={pullRequestActions(pr, repo)}
    />
  );
}
