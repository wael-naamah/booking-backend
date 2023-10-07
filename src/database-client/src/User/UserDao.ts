import { User } from '../Schema';

export interface UserDao {
    addUser(user: Partial<User>): Promise<Partial<User>>;
    getUserByEmail(enail: string): Promise<Partial<User> | null>;
}