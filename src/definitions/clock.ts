
import User from "./user"

export class Clock {
    name: string = "unnamed";
    description: string = "";
    subclocks: [Clock?] = [];
    deadline: Number = 0;
    sponsors: [User?] = [];
    dependents: [User?] = [];
    dependencies: [User?] = [];
    audience: [User?] = [];
    challengers: [User?] = [];
    supervisors: [User?] = [];
    expired: Boolean = false;
    achieved: Boolean = false;
}