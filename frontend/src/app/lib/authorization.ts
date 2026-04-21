import type { MeUser } from "@/app/lib/getMe";
import { UserRoles } from "@/app/lib/UserRoles";

export const ADMIN_PAGE_ROLES = [
    UserRoles.SystemAdmin,
    UserRoles.ClubAdmin,
    UserRoles.EventManager,
] as const;

export function hasAnyRole(userRoles: readonly string[], allowedRoles: readonly string[]): boolean {
    return userRoles.some((role) => allowedRoles.includes(role));
}

export function canAccessAdmin(user: Pick<MeUser, "roles"> | null): boolean {
    return !!user && hasAnyRole(user.roles, ADMIN_PAGE_ROLES);
}
