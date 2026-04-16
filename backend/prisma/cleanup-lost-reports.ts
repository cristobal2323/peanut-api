import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool as any) });

async function main() {
  const reportCount = await prisma.lostReport.count();
  const lostDogCount = await prisma.dog.count({ where: { lostStatus: true } });
  console.log(`Found ${reportCount} lost reports and ${lostDogCount} dogs marked as lost.`);

  await prisma.$transaction(async (tx) => {
    const reports = await tx.lostReport.findMany({ select: { id: true, lastSeenLocationId: true } });
    const reportIds = reports.map((r) => r.id);
    const locationIds = reports
      .map((r) => r.lastSeenLocationId)
      .filter((x): x is string => !!x);

    if (reportIds.length) {
      const sightings = await tx.sighting.deleteMany({ where: { lostReportId: { in: reportIds } } });
      console.log(`Deleted ${sightings.count} sightings linked to lost reports.`);

      const external = await tx.externalPost.deleteMany({ where: { linkedLostReportId: { in: reportIds } } });
      console.log(`Deleted ${external.count} external posts linked to lost reports.`);

      const lrDel = await tx.lostReport.deleteMany({});
      console.log(`Deleted ${lrDel.count} lost reports.`);

      if (locationIds.length) {
        const locDel = await tx.location.deleteMany({ where: { id: { in: locationIds } } });
        console.log(`Deleted ${locDel.count} locations (last-seen).`);
      }
    } else {
      console.log('No lost reports to delete.');
    }

    const dogReset = await tx.dog.updateMany({
      where: { lostStatus: true },
      data: { lostStatus: false, lostSince: null },
    });
    console.log(`Reset lostStatus on ${dogReset.count} dogs.`);
  });

  console.log('Cleanup done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
