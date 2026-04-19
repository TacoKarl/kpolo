import { UserRoles } from "./userRoles.js";

export type User = {
    id: number,
    roles: UserRoles[],
    clubId: number | null,
} | null

export function requireUser(user: User){
    if (!user){
        throw new Error("Not logged in");
    }
}


export function requireRole(user: User, roles: UserRoles[]){
    requireUser(user);
    if(!user!.roles.some(role => roles.includes(role))){
        throw new Error("User has insufficient permissions");
    }
}

export function requireClubMembership(user: User, clubId: number){
    requireUser(user);
    if (user!.clubId !== clubId || !user!.roles.includes(UserRoles.SystemAdmin)){
        throw new Error("User not in club");
    }
}

/*
export function requireClubOwnership(user: User, clubId: number){
    if ()
}

*/