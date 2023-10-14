import { schema } from "./CategorySchema";
import { Model, Document, Connection } from "mongoose";
import { Category } from "../Schema";
import { CategoryDao } from "./CategoryDao";
import { isEmptyObject, isValidNumber } from "../utils";

export class CategoryDaoMongo implements CategoryDao {
  model: Model<Document<Category>>;

  constructor(mongo: Connection) {
    this.model = mongo.model<Document<Category>>("Categories", schema);
  }

  async addCategory(category: Partial<Category>): Promise<Category> {
    const newCategory = new this.model(category);
    return newCategory.save().then((res) => {
      return res as unknown as Category;
    });
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return this.model.findById(id);
  }

  async getCategories(
    page: number,
    limit: number,
    search?: string
  ): Promise<Category[]> {
    const isValidNo = isValidNumber(search);

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            isValidNo ? { unique_id: Number(search) } : {},
            { "services.name": { $regex: search, $options: "i" } },
            { "services.description": { $regex: search, $options: "i" } },
            isValidNo ? { "services.abbreviation_id": Number(search) } : {},
          ].filter((el) => !isEmptyObject(el)),
        }
      : {};

    return this.model
      .find(query)
      .limit(limit)
      .skip(limit * (page - 1))
      .then((data) => data as unknown as Category[]);
  }

  async getCategoriesCount(search?: string): Promise<number> {
    const isValidNo = isValidNumber(search);

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            isValidNo ? { unique_id: Number(search) } : {},
            { "services.name": { $regex: search, $options: "i" } },
            { "services.description": { $regex: search, $options: "i" } },
            isValidNo ? { "services.abbreviation_id": Number(search) } : {},
          ].filter((el) => !isEmptyObject(el)),
        }
      : {};

    return this.model.countDocuments(query).then((count) => {
      return count;
    });
  }

  async updateCategory(id: string, newCategory: Partial<Category>) {
    return this.model
      .findByIdAndUpdate(id, newCategory, { new: true })
      .then((res) => {
        return res as unknown as Category;
      });
  }

  async deleteCategory(id: string) {
    return this.model.findByIdAndDelete(id).then((res) => {
      return res as unknown as Category;
    });
  }
}
