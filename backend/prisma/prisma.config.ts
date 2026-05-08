import { PrismaConfig } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });

const prismaConfig: PrismaConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

export default prismaConfig;
