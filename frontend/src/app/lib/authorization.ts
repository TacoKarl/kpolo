import type { Me } from "@/generated/graphql";
import { UserRoles } from "@/app/lib/UserRoles";

export const TOURNAMENT_ADMIN_ROLES = [UserRoles.SystemAdmin, UserRoles.EventManager] as const;
export const CLUB_ADMIN_ROLES = [UserRoles.SystemAdmin, UserRoles.ClubAdmin] as const;
export const TEAM_ADMIN_ROLES = [UserRoles.SystemAdmin, UserRoles.ClubAdmin] as const;
export const FINE_ADMIN_ROLES = [UserRoles.SystemAdmin, UserRoles.EventManager] as const;

export const ADMIN_PAGE_ROLES = [
    UserRoles.SystemAdmin,
    UserRoles.EventManager,
    UserRoles.ClubAdmin,
    UserRoles.ClubTrainer,
] as const;

export type AdminNavigationItem = {
    href: `/admin/${string}`;
    title: string;
    description: string;
    roles: readonly string[];
};

export const ADMIN_NAVIGATION_ITEMS = [
    {
        href: "/admin/clubs",
        title: "Klubber",
        description: "Administrer klubber: opret, rediger, inaktivér eller genopret klubber.",
        roles: CLUB_ADMIN_ROLES,
    },
    {
        href: "/admin/teams",
        title: "Hold",
        description: "Administrer hold: opret hold, tildel spillere og administrer holdstatus.",
        roles: TEAM_ADMIN_ROLES,
    },
    {
        href: "/admin/tournaments",
        title: "Turneringer",
        description: "Opret og rediger turneringer, divisioner og datoer.",
        roles: TOURNAMENT_ADMIN_ROLES,
    },
    {
        href: "/admin/turneringsplan",
        title: "Turneringsplan",
        description: "Generér og redigér turneringsplaner for valgte turneringer.",
        roles: TOURNAMENT_ADMIN_ROLES,
    },
    {
        href: "/admin/boeder",
        title: "Bøder",
        description: "Udstedelse og afvikling af bøder",
        roles: FINE_ADMIN_ROLES,
    }
] as const satisfies readonly AdminNavigationItem[];

export function hasAnyRole(userRoles: readonly string[] | null | undefined, allowedRoles: readonly string[]): boolean {
    return !!userRoles && userRoles.some((role) => allowedRoles.includes(role));
}

export function canAccessTournamentAdmin(user: Pick<Me, "roles"> | null): boolean {
    return !!user && hasAnyRole(user.roles, TOURNAMENT_ADMIN_ROLES);
}

export function canAccessClubAdmin(user: Pick<Me, "roles"> | null): boolean {
    return !!user && hasAnyRole(user.roles, CLUB_ADMIN_ROLES);
}

export function canAccessTeamAdmin(user: Pick<Me, "roles"> | null): boolean {
    return !!user && hasAnyRole(user.roles, TEAM_ADMIN_ROLES);
}

export function canAccessFineAdmin(user: Pick<Me, "roles"> | null): boolean {
    return !!user && hasAnyRole(user.roles, FINE_ADMIN_ROLES);
}

export function canAccessAdmin(user: Pick<Me, "roles"> | null): boolean {
    return !!user && hasAnyRole(user.roles, ADMIN_PAGE_ROLES);
}

export function getAccessibleAdminNavigation(user: Pick<Me, "roles"> | null): AdminNavigationItem[] {
    if (!user) return [];
    return ADMIN_NAVIGATION_ITEMS.filter((item) => hasAnyRole(user.roles, item.roles));
}

export function canAccessAdminPath(user: Pick<Me, "roles"> | null, pathname: string): boolean {
    const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
    if (!isAdminRoute) return true;

    if (pathname === "/admin") {
        return canAccessAdmin(user);
    }

    const item = ADMIN_NAVIGATION_ITEMS.find(
        (navigationItem) => pathname === navigationItem.href || pathname.startsWith(`${navigationItem.href}/`)
    );

    if (!item) return canAccessAdmin(user);
    return !!user && hasAnyRole(user.roles, item.roles);
}

export function getAdminRedirectPath(user: Pick<Me, "roles"> | null): string {
    return canAccessAdmin(user) ? "/admin" : "/";
}

