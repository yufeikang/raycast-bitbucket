import { ActionPanel, Form, Action, LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";
import { listUsersByPr } from "./model/bitbucket";
import { getAuthorAvatar } from "./utils/utils";

export default function RepoSetting({ repo }) {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(async () => {
    try {
      const _settings = JSON.parse((await LocalStorage.getItem(`bitbucket.repo.${repo.slug}`)) || "{}");
      setSettings(_settings);
      setIsLoading(true);
      const data = await listUsersByPr(repo);
      setIsLoading(false);
      setUsers(data.values);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  }, []);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Save"
            onSubmit={async (values) => {
              for (const key in values) {
                if (values[key] === "") {
                  delete values[key];
                }
              }
              await LocalStorage.setItem(`bitbucket.repo.${repo.slug}`, JSON.stringify(values));
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TagPicker id="reviewers" title="Reviewers" value={settings.reviewers} storeValue>
        {!isLoading &&
          users.map((user) => (
            <Form.TagPicker.Item key={user.uuid} value={user.uuid} title={user.nickname} icon={getAuthorAvatar(user)} />
          ))}
      </Form.TagPicker>
    </Form>
  );
}
