import type { MembershipState, TeamMemberRole } from "#enums";
import type { User } from "./user.js";

export declare namespace Team {
    export interface Structure {
        icon: string | null;
        id: string;
        members: Array<MemberStructure>;
        name: string;
        owner_user_id: string;
    }

    export interface MemberStructure {
        membership_state: MembershipState;
        team_id: string;
        user: Partial<User.Structure>;
        role: TeamMemberRole;
    }
}
