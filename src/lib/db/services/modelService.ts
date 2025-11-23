import connectDB from '../connect';
import Model from '../models/Model';

export async function getModels(filters?: { domainId?: string; isActive?: boolean }) {
  await connectDB();
  const query: any = {};
  if (filters?.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  return Model.find(query).populate('organizationId').sort({ createdAt: -1 }).lean();
}

export async function getModelById(id: string) {
  await connectDB();
  return Model.findById(id).populate('organizationId').lean();
}

export async function getModelBySlug(slug: string) {
  await connectDB();
  return Model.findOne({ slug, isActive: true }).populate('organizationId').lean();
}

export async function createModel(data: {
  name: string;
  slug: string;
  organizationId: string;
  description?: string;
  version?: string;
  isActive?: boolean;
}) {
  await connectDB();
  return Model.create(data);
}

