import connectToDatabase from "../db/mongoose";
import Tag, { ITag } from "../db/models/Tag";

export async function getTags(): Promise<ITag[]> {
  await connectToDatabase();
  return Tag.find().sort({ name: 1 }).lean();
}

export async function getTagById(id: string): Promise<ITag | null> {
  await connectToDatabase();
  return Tag.findById(id).lean();
}

export async function createTag(data: Partial<ITag>): Promise<ITag> {
  await connectToDatabase();
  return Tag.create(data);
}

export async function updateTag(id: string, data: Partial<ITag>): Promise<ITag | null> {
  await connectToDatabase();
  return Tag.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean();
}

export async function deleteTag(id: string): Promise<boolean> {
  await connectToDatabase();
  const res = await Tag.findByIdAndDelete(id);
  return !!res;
}
