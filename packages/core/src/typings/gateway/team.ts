import type { MembershipState } from "#enums";
import type { UserStructure } from "../shared/user.js";

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
