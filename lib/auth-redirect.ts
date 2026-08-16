import type { User } from "@/lib/store";

const ADMIN_HOME = "/admin";
const USER_HOME = "/";

// Normalize a path by dropping any query string or hash so role checks and
// open-redirect guards operate on the actual pathname.
function pathName(path: string): string {
  const queryIndex = path.indexOf("?");
  const hashIndex = path.indexOf("#");
  let end = path.length;
  if (queryIndex !== -1 && queryIndex < end) end = queryIndex;
  if (hashIndex !== -1 && hashIndex < end) end = hashIndex;
  return path.slice(0, end);
}

export function isAdminPath(path: string): boolean {
  const target = pathName(path);
  return target === ADMIN_HOME || target.startsWith(`${ADMIN_HOME}/`);
}

// Only allow internal, relative paths to prevent open-redirect through the
// `redirect` / `redirect_to` query params.
function isSafeRedirectPath(path: string): boolean {
  return (
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/\\")
  );
}

// Resolve where to send a user right after sign-in, based on their role.
// - A requested target (redirect_to / redirect query param) is prioritized,
//   unless the user is not an admin and the target is a protected admin path.
// - Otherwise, admins land on the admin dashboard and standard users on the home page.
export function resolvePostLoginRedirect(
  user: Pick<User, "role"> | null | undefined,
  requestedPath: string | null | undefined
): string {
  const isAdmin = user?.role === "ADMIN";
  const requested = requestedPath?.trim();

  if (
    requested &&
    isSafeRedirectPath(requested) &&
    (isAdmin || !isAdminPath(requested))
  ) {
    return requested;
  }

  return isAdmin ? ADMIN_HOME : USER_HOME;
}
