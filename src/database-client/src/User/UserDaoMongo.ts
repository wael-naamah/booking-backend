import { schema, resetPasswordSchema } from "./UserSchema";
import { Model, Document, Connection } from "mongoose";
import { ResetToken, User } from "../Schema";
import { UserDao } from "./UserDao";

export class UserDaoMongo implements UserDao {
  model: Model<Document<User>>;
  resetModel: Model<Document<ResetToken>>;

  constructor(mongo: Connection) {
    this.model = mongo.model<Document<User>>("User", schema);
    this.resetModel = mongo.model<Document<ResetToken>>(
      "Reset-tokens",
      resetPasswordSchema
    );
  }

  async addUser(user: Partial<User>): Promise<User> {
    const newUser = new this.model(user);
    return newUser.save().then((res) => {
      return res as unknown as User;
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.model.findOne({ email });
  }

  async addToken(token: string, email: string): Promise<void> {
    const newToken = new this.resetModel({ token, email });
    await newToken.save().then((res) => {
      return res as unknown as ResetToken;
    });
  }

  async getToken(token: string): Promise<ResetToken | null> {
    return this.resetModel.findOne({ token });
  }

  async deleteToken(token: string): Promise<void> {
    await this.resetModel.deleteOne({ token });
  }
}
