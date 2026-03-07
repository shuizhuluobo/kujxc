import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FilesService {
    private readonly logger = new Logger(FilesService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Safe file deletion: checks if the file is used elsewhere before deleting.
     * @param url The file URL (e.g., /uploads/avatars/abc.png)
     */
    async deleteFileIfUnused(url: string) {
        if (!url || !url.startsWith('/uploads/')) {
            return;
        }

        // Check if the file is still used
        const isUsed = await this.isFileUsed(url);
        if (isUsed) {
            this.logger.debug(`File ${url} is still in use, skipping deletion.`);
            return;
        }

        await this.physicalDelete(url);
    }

    /**
     * Forced physical deletion of a file.
     * @param url The file URL
     */
    async physicalDelete(url: string) {
        try {
            const localPath = path.join(process.cwd(), url);
            if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath);
                this.logger.log(`Deleted file: ${localPath}`);
            }
        } catch (error) {
            this.logger.error(`Failed to delete file ${url}: ${error.message}`);
        }
    }

    /**
     * Checks if a file URL is referenced in the database.
     */
    async isFileUsed(url: string): Promise<boolean> {
        // 1. Check User Avatars
        const userWithAvatar = await this.prisma.user.findFirst({
            where: { avatar: url },
        });
        if (userWithAvatar) return true;

        // 2. Check Wiki Attachments
        const attachment = await (this.prisma as any).wikiAttachment.findFirst({
            where: { url },
        });
        if (attachment) return true;

        // 3. Check Wiki Article Content (for images)
        const articleWithImage = await this.prisma.wikiArticle.findFirst({
            where: {
                content: {
                    contains: url,
                },
            },
        });
        if (articleWithImage) return true;

        return false;
    }

    /**
     * Extracts all upload URLs from markdown content.
     */
    extractUrls(content: string): string[] {
        if (!content) return [];
        // Match /uploads/... patterns in markdown (e.g., ![img](/uploads/images/xxx.png))
        const regex = /\/uploads\/[^\s\)]+/g;
        const matches = content.match(regex) || [];
        // Filter out potential duplicates and clean up
        return [...new Set(matches)].map(url => url.split(')')[0].split('"')[0].split("'")[0]);
    }
}
