import { jwtDecode } from "jwt-decode";
import { getRefreshUrl } from "./apiUrls";
import { AccessTokenPayload } from "../components/interfaces/MyJwtPayload";
import { cookies } from "next/headers";


export async function getUserRoles(): Promise<string[]> {
    const cookieStore = await cookies();
    const token = cookieStore.get("kpolo_access_token")?.value;

    if (!token) {
        return ["Guest"];
    }

    try {
        const decoded = jwtDecode<AccessTokenPayload>(token);
        return decoded.userRoles || ["Guest"];
    } catch {
        return ["Guest"];
    }
}



export async function checkIfUserHasRoles(roles: string[]): Promise<boolean> {
    const userRoles = await getUserRoles();
    return userRoles.some(role => roles.includes(role));
}
