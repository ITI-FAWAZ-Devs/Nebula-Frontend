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

const KNOWN_FILE_EXTENSIONS = new Set([
  "ts", "tsx", "js", "jsx", "mjs", "cjs",
  "py", "pyw", "go", "rs", "java", "kt", "c", "cpp", "h", "hpp", "cs", "rb", "php",
  "json", "yaml", "yml", "toml", "xml", "html", "css", "scss", "sass", "less",
  "sql", "prisma", "graphql", "gql", "proto",
  "md", "mdx", "env", "dockerfile", "sh", "bash", "zsh"
]);

function isSourceFilePath(p: string): boolean {
  const clean = p.trim();
  if (!clean || clean.startsWith("http://") || clean.startsWith("https://")) return false;
  // Exclude route params like :id, HTTP methods, or full sentences
  if (clean.includes("/:") || /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/i.test(clean)) return false;

  const ext = clean.split(".").pop()?.toLowerCase();
  if (ext && KNOWN_FILE_EXTENSIONS.has(ext)) return true;

  // Or relative directory/file path starting with common repo directories
  if (
    !clean.startsWith("/") &&
    (clean.startsWith("./") ||
      clean.startsWith("src/") ||
      clean.startsWith("app/") ||
      clean.startsWith("lib/") ||
      clean.startsWith("components/") ||
      clean.startsWith("pkg/") ||
      clean.startsWith("internal/"))
  ) {
    return true;
  }
  return false;
}

export function preprocessMarkdownFileLinks(
  md: string,
  repoName: string,
  commitSha?: string | null
): string {
  if (!md) return "";

  // 1. Normalize table rows if collapsed inline: "| col1 | |---|---| | col2 |"
  let processed = md.replace(/\|\s*\|\s*(?=[-:|a-zA-Z0-9_`"'/\\])/g, "|\n|");

  // 2. Ensure table headers preceded by text have an empty line before them for GFM
  processed = processed.replace(/([^\n])\n(\|[\s\S]*?\|[\r\n]+\|[-:\s|]+\|)/g, "$1\n\n$2");

  // 3. Link bracketed file citations e.g. [src/main.ts, src/api.ts] without matching standard markdown links [text](url)
  processed = processed.replace(/\[([a-zA-Z0-9_\-./,\s]+)\](?!\()/g, (match, content) => {
    const parts = content.split(",").map((s: string) => s.trim());
    const isFileList = parts.length > 0 && parts.every(isSourceFilePath);

    if (!isFileList) return match;

    const links = parts.map((file: string) => {
      const url = getGithubFileUrl(repoName, file, commitSha);
      return `[\`${file}\`](${url})`;
    });

    return links.join(" · ");
  });

  return processed;
}

