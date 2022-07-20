import { showToast, Toast, Clipboard } from "@raycast/api";
import { getBranchModel, createBranch, createPullRequest } from "./model/bitbucket";
import moment from "moment";

export async function createReleasePr(repo) {
    console.log(`Creating release PR for ${repo.slug}`);
    const prBranchName = `release/${moment().format("YYYYMMDD")}`;
    const toast = await showToast({
        style: Toast.Style.Animated,
        title: `Create Release Pull Request`,
        message: `Release Branch: ${prBranchName} ... `,
    });
    const branchModel = await getBranchModel(repo);
    const productionBranchName = branchModel.production.branch.name || "master";
    const developmentBranchName = branchModel.development.branch.name || "develop";
    let pr = null;
    try {
        await createBranch(repo, prBranchName, developmentBranchName);
        toast.message = `Release Pull Request: ${prBranchName} ...`;
        pr = await createPullRequest(repo, prBranchName, prBranchName, productionBranchName, true);
    } catch (e) {
        toast.style = Toast.Style.Failure;
        toast.message = `Error: ${e.response.data.error.message}`;
        return;
    }

    toast.style = Toast.Style.Success;
    toast.message = `Successfully, Copied to clipboard`;
    Clipboard.copy(pr.links.html.href);
}


export async function createDevelopPr(repo, fromBranch) {
    console.log(`Creating develop PR for ${repo.slug}`);
    const toast = await showToast({
        style: Toast.Style.Animated,
        title: `Create Develop Pull Request`,
        message: ` from : ${fromBranch} ... `,
    });
    const branchModel = await getBranchModel(repo);
    const developmentBranchName = branchModel.development.branch.name || "develop";
    let pr = null;
    try {
        pr = await createPullRequest(repo, fromBranch, fromBranch, developmentBranchName, true);
    } catch (e) {
        toast.style = Toast.Style.Failure;
        toast.message = `Error: ${e.response.data.error.message}`;
        return;
    }

    toast.style = Toast.Style.Success;
    toast.message = `Successfully, Copied to clipboard`;
    Clipboard.copy(pr.links.html.href);
}
