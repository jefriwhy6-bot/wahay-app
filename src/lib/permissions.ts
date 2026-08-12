export type Role = "OWNER" | "ADMIN" | "AGENT";

export interface NavItem {
  href: string;
  label: string;
  minRole: Role;
}

const roleHierarchy: Record<Role, number> = {
  AGENT: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function hasAccess(userRole: Role, minRole: Role): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[minRole];
}

export const pagePermissions: Record<string, Role> = {
  "/inbox": "AGENT",
  "/contacts": "AGENT",
  "/catalog": "ADMIN",
  "/orders": "ADMIN",
  "/knowledge": "ADMIN",
  "/faq": "ADMIN",
  "/quick-replies": "ADMIN",
  "/broadcast": "ADMIN",
  "/greeting": "ADMIN",
  "/follow-up": "ADMIN",
  "/agent-performance": "ADMIN",
  "/analytics": "ADMIN",
  "/settings": "ADMIN",
};

export function canAccessPage(userRole: Role, pathname: string): boolean {
  const matchedPath = Object.keys(pagePermissions).find((p) =>
    pathname.startsWith(p)
  );
  if (!matchedPath) return true;
  return hasAccess(userRole, pagePermissions[matchedPath]);
}
