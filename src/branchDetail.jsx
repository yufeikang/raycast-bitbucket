import { Detail } from "@raycast/api";
import { branchActions } from "./branchActions";
import { formatDate } from "./utils/datetime";

export default function BranchDetail({ repo, branch, settings, branchModel }) {
  let detail = `### ${branch.name}`;
  detail += `\n\n> ${branch.target.message.replace(/\n/g, "\n> ")}`;
  detail += `\n\nDate: ${formatDate(branch.date)} `;

  const user = branch.target.author.user || { display_name: branch.target.author.raw };

  return (
    <Detail
      navigationTitle={`${branch.name} Detail`}
      markdown={detail}
      actions={branchActions(branch, repo, false, settings, branchModel)}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label key="title" title="title" text={`${branch.name}`} />
          <Detail.Metadata.Label key="author" title="author" text={`${user.display_name}`} />
        </Detail.Metadata>
      }
    />
  );
}
