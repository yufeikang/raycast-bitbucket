<div align="center">
  <img
    src="./assets/bitbucket-logo.png"
    width="50"
  />

  <h1>
    Bitbucket Tools
  </h1>

Raycast extension to list repositories/branch/pr/pipeline, check pipelines status, change pr status, create release/hotfix pr, merge branch to other branch, etc.

  
</div>

## Features

- List your repositories
- List branches/pull requests/pipelines
- check pipelines status and view logs
- merge/decline/add reviewer pull request
- create release/hotfix pull request
- merge branch to other branch 

## Getting started

- Go to to your Bitbucket Cloud profile, [under App Passwords](https://bitbucket.org/account/settings/app-passwords/)
- Click on `Create App Password`
- Give your App password a name e.g. `Raycast`, and select all the read and write options you need (Account, projects, repositories, Pull Requests, Pipelines)
- Store in a secure location the given App Password
- Start a bitbucket command and fill the required fields:
  - Workspace: You can see your workspaces [here](https://bitbucket.org/account/workspaces/), and use the slug. You can find it in the URL of your workspace: `https://bitbucket.org/{organization}/`
  - Account Name: You can find it [here](https://bitbucket.org/account/settings/) under `Bitbucket profile settings > Username`
  - App Password


# Manual Installation

```bash
git clone https://github.com/yufeikang/raycast-bitbucket.git
cd raycast-bitbucket
yarn install
yarn dev
```
