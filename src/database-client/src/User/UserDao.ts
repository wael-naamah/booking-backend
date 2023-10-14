import { User } from '../Schema';

export interface UserDao {
    addUser(user: Partial<User>): Promise<User>;
    getUserByEmail(email: string): Promise<User | null>;
}