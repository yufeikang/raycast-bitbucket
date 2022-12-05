import { Detail } from "@raycast/api";
import { pullRequestActions } from "./pullRequestActions";
import { formatDate } from "./utils/datetime";

export default function PullRequestDetail({ repo, pullRequest }) {
  let detail = `### ${pullRequest.title}`;
  detail += `\n\n>  ${pullRequest.summary.raw}`;
  detail += `\n\n### Reviewers`;
  pullRequest.reviewers.forEach((reviewer) => {
    detail += `\n\n* ${reviewer.display_name}`;
  });
  detail += `\n\n### Approved`;
  pullRequest.participants
    .filter((participant) => participant.approved)
    .forEach((reviewer) => {
      detail += `\n\n* ${reviewer.display_name}`;
    });
  detail += `\n\nCreated on: ${formatDate(pullRequest.created_on)}`;
  detail += `\n\nUpdated on: ${formatDate(pullRequest.updated_on)}`;

  return (
    <Detail
      navigationTitle={`${pullRequest.title} Detail`}
      markdown={detail}
      actions={pullRequestActions(pullRequest, repo, false)}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="id" text={`${pullRequest.id}`} />
          <Detail.Metadata.Label title="title" text={`${pullRequest.title}`} />
          <Detail.Metadata.Label title="state" text={`${pullRequest.state}`} />
          <Detail.Metadata.Label title="from" text={`${pullRequest.source.branch.name}`} />
          <Detail.Metadata.Label title="author" text={`${pullRequest.author.display_name}`} />
        </Detail.Metadata>
      }
    />
  );
}
