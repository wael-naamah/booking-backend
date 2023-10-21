import { CategoryDaoMongo, Category } from "../../../database-client";
import { ClientError } from "../../utils/exceptions";

export class CategoryService {
  constructor(private categoryDao: CategoryDaoMongo) {}

  async addCategory(category: Category) {
    return this.categoryDao
      .addCategory(category)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while add the category",
          500
        );
      });
  }

  async getCategoryById(id: string) {
    return this.categoryDao
      .getCategoryById(id)
      .then((data) => {
        return data;
      })
      .catch((err) => null);
  }

  async updateCategory(id: string, newCategory: Category) {
    return this.categoryDao
      .updateCategory(id, newCategory)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while update the category",
          500
        );
      });
  }

  async getCategories(page: number, limit: number, search?: string) {
    const [data, count] = await Promise.all([
      this.categoryDao.getCategories(page, limit, search).then((data) => {
        return data;
      }),
      this.categoryDao.getCategoriesCount(search).then((data) => {
        return data;
      }),
    ]);

    return { data, count };
  }

  async deleteCategory(id: string) {
    return this.categoryDao
      .deleteCategory(id)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        throw new ClientError(
          "Something went wrong while delete the category",
          500
        );
      });
  }
}
