import { PrismaClient } from '@prisma/client';

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

// Prevents the file from being treated as a script and ensures it is processed as a module.
export { };
