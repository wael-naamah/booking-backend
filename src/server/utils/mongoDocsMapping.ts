import mongoose, { Document } from "mongoose";

//@ts-ignore
export const mapToMongoDocs = <T>(res: Document<T>[]) => {
    //@ts-ignore
    return res.map((r) => r.toObject() as any as T);
};

//@ts-ignore
export const mapToMongoDocsForCombination = <T>(res: any[]) => {
    //@ts-ignore
    return res.map((r) => r as any as T);
};

//@ts-ignore
export const mapToMongoDoc = <T>(res: mongoose.Document<T> | null) => {
    return res?.toObject() as any as T;
};
