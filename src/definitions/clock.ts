
import User from "./user"

export interface Clock {
    name: string;
    description: string;
    deadline: string;
    owner: User;
    sponsors: [User?];
    dependents: [User?];
    dependencies: [User?];
    audience: [User?];
    challengers: [User?];
    supervisors: [User?];
    group: string;
    timeline: string;
    expired: Boolean;
    achieved: Boolean;
    isPublic: Boolean;
    bounty: number;
    ask: number;
}