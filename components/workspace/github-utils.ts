export function getGithubFileUrl(
  repoName: string,
  filePath: string,
  commitSha?: string | null
): string {
  const cleanPath = filePath.trim().replace(/^\/+/, "");
  const ref = commitSha || "main";

  if (repoName.startsWith("http://") || repoName.startsWith("https://")) {
    return `${repoName.replace(/\/+$/, "")}/blob/${ref}/${cleanPath}`;
  }

  if (repoName.includes("/")) {
    return `https://github.com/${repoName}/blob/${ref}/${cleanPath}`;
  }

  return `https://github.com/${repoName}/blob/${ref}/${cleanPath}`;
}

export function preprocessMarkdownFileLinks(
  md: string,
  repoName: string,
  commitSha?: string | null
): string {
  if (!md) return "";

  return md.replace(/\[([a-zA-Z0-9_\-./,\s]+)\]/g, (match, content) => {
    const parts = content.split(",").map((s: string) => s.trim());
    const isFileList = parts.every((p: string) =>
      /\.[a-zA-Z0-9]+$/.test(p) || p.includes("/")
    );

    if (!isFileList || parts.length === 0) return match;

    const links = parts.map((file: string) => {
      const url = getGithubFileUrl(repoName, file, commitSha);
      return `[\`${file}\`](${url})`;
    });

    return links.join(" · ");
  });
}
