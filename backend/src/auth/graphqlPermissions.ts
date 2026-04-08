export enum UserRoles {
    SystemAdmin = "System Admin",
    ClubAdmin = "Club Admin",
    ClubMember = "Club Member",
    Guest = "Guest"
}

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
        throw new Error("User has insufficient permisions");
    }
}

/*
export function requireClubOwnership(user: User, clubId: number){
    if ()
}

*/