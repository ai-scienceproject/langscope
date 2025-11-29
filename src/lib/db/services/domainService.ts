import connectDB from '../connect';
import Domain from '../models/Domain';
import ModelRanking from '../models/ModelRanking';
import Battle from '../models/Battle';

export async function getDomains() {
  await connectDB();
  const domains = await Domain.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  
  // Calculate stats for each domain
  const domainsWithStats = await Promise.all(
    domains.map(async (domain: any) => {
      const modelCount = await ModelRanking.countDocuments({ domainId: domain._id });
      const battleCount = await Battle.countDocuments({ domainId: domain._id });
      
      return {
        ...domain,
        modelCount,
        battleCount,
      };
    })
  );
  
  return domainsWithStats;
}

export async function getDomainById(id: string) {
  await connectDB();
  return Domain.findById(id).lean();
}

export async function getDomainBySlug(slug: string) {
  await connectDB();
  return Domain.findOne({ slug, isActive: true }).lean();
}

export async function getDomainByName(name: string) {
  await connectDB();
  // Case-insensitive exact match
  return Domain.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') }, 
    isActive: true 
  }).lean();
}

export async function createDomain(data: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}) {
  await connectDB();
  return Domain.create(data);
}

export async function updateDomain(id: string, data: Partial<{
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
}>) {
  await connectDB();
  return Domain.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteDomain(id: string) {
  await connectDB();
  return Domain.findByIdAndDelete(id);
}

