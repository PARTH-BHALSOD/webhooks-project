import { notify } from "../services/notifier.js";

const githubHandler = async (evt) => {
  const p = evt.payload;

  // Handle push events
  if (evt.eventType === "push") {
    const branch = p.ref.replace("refs/heads/", "");
    const commitCount = p.commits?.length || 0;
    const pusherName = p.pusher?.name || "Someone";
    const repoName = p.repository?.full_name || "repository";
    const commitMessage = p.head_commit?.message || "No message";
    const compareUrl = p.compare || "";

    const message = `🚀 **${pusherName}** pushed ${commitCount} commit(s) to **${repoName}:${branch}**\n📝 "${commitMessage}"\n🔗 ${compareUrl}`;

    await notify({
      dedupeKey: `github:${evt.eventId}`,
      message,
    });
  }

  // Handle pull request events
  else if (evt.eventType === "pull_request") {
    const action = p.action;
    const prNumber = p.pull_request?.number;
    const prTitle = p.pull_request?.title;
    const author = p.pull_request?.user?.login;
    const prUrl = p.pull_request?.html_url;

    if (action === "opened") {
      const message = `🔔 **${author}** opened PR #${prNumber}: "${prTitle}"\n🔗 ${prUrl}`;
      await notify({
        dedupeKey: `github:${evt.eventId}`,
        message,
      });
    }
  }

  // Handle other GitHub events here...

  return { success: true };
};

export default githubHandler;
