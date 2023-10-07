import { schema } from "./UserSchema";
import { Model, Document, Connection } from "mongoose";
import { User } from "../Schema";
import { UserDao } from "./UserDao";

export class UserDaoMongo implements UserDao {
  model: Model<Document<User>>;

  constructor(mongo: Connection) {
    this.model = mongo.model<Document<User>>("User", schema);
  }

  async addUser(user: Partial<User>): Promise<Partial<User>> {
    const newUser = new this.model(user);
    return newUser.save().then((res) => {
      return res as unknown as Partial<User>;
    });
  }

  async getUserByEmail(email: string): Promise<Partial<User> | null> {
    return this.model.findOne({ email })
  }
}
