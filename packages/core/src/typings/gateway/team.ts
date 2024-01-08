import type { MembershipState } from "../../enums/index.js";
import type { UserStructure } from "./user.js";

export interface Team {
    icon: string | null;
    id: string;
    members: Array<TeamMember>;
    name: string;
    owner_user_id: string;
}

export interface TeamMember {
    membership_state: MembershipState;
    permissions: ["*"];
    team_id: string;
    user: Partial<UserStructure>;
}
