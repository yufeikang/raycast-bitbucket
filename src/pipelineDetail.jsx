import { List } from "@raycast/api";
import { useEffect, useState } from "react";
import { listPipelineSteps } from "./model/bitbucket";
import { formatDate } from "./utils/datetime";

function tail(context, lineCount = 200) {
  const lines = context.split("\n");
  return lines.slice(lines.length - lineCount).join("\n");
}
export default function PipelineDetail({ repo, pipeline }) {
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    listPipelineSteps(repo, pipeline).then((data) => {
      setPipelineStep(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <List navigationTitle={`Pipeline #${pipeline.build_number} Detail`} isLoading={isLoading} isShowingDetail>
      {pipelineStep &&
        pipelineStep.values.map((step) => {
          console.log(tail(step.log));
          return (
            <List.Item
              key={step.uuid}
              title={`${step.name}`}
              subtitle={`${formatDate(step.started_on)}`}
              detail={<List.Item.Detail markdown={`## Last 200 Lines Logs:\n\`\`\`${tail(step.log)}\`\`\``} />}
            />
          );
        })}
    </List>
  );
}
