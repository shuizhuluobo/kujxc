import { PrismaClient } from '@prisma/client';
import { generatePinyinMeta } from './src/common/utils/pinyin';

const prisma = new PrismaClient();

async function backfillPinyin() {
    console.log('Starting Pinyin backfill...');

    // 1. WikiArticles
    const articles = await prisma.wikiArticle.findMany({
        where: { OR: [{ titlePinyin: null }, { titleInitials: null }] }
    });
    console.log(`Backfilling ${articles.length} WikiArticles...`);
    for (const article of articles) {
        const { pinyinStr, initials } = generatePinyinMeta(article.title);
        await prisma.wikiArticle.update({
            where: { id: article.id },
            data: { titlePinyin: pinyinStr, titleInitials: initials }
        });
    }

    // 2. Customers
    const customers = await prisma.customer.findMany({
        where: { OR: [{ namePinyin: null }, { nameInitials: null }] }
    });
    console.log(`Backfilling ${customers.length} Customers...`);
    for (const customer of customers) {
        const { pinyinStr, initials } = generatePinyinMeta(customer.name);
        await prisma.customer.update({
            where: { id: customer.id },
            data: { namePinyin: pinyinStr, nameInitials: initials }
        });
    }

    // 3. Regions
    const regions = await prisma.region.findMany({
        where: { OR: [{ namePinyin: null }, { nameInitials: null }] }
    });
    console.log(`Backfilling ${regions.length} Regions...`);
    for (const region of regions) {
        const { pinyinStr, initials } = generatePinyinMeta(region.name);
        await prisma.region.update({
            where: { id: region.id },
            data: { namePinyin: pinyinStr, nameInitials: initials }
        });
    }

    // 4. ServiceTypes
    const serviceTypes = await prisma.serviceType.findMany({
        where: { OR: [{ namePinyin: null }, { nameInitials: null }] }
    });
    console.log(`Backfilling ${serviceTypes.length} ServiceTypes...`);
    for (const st of serviceTypes) {
        const { pinyinStr, initials } = generatePinyinMeta(st.name);
        await prisma.serviceType.update({
            where: { id: st.id },
            data: { namePinyin: pinyinStr, nameInitials: initials }
        });
    }

    console.log('Pinyin backfill completed!');
}

backfillPinyin()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
