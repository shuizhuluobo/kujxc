import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CsrfProtected } from '../common/decorators/csrf-token.decorator';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as fileType from 'file-type';

// 允许的图片 MIME 类型
const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

// 允许的附件 MIME 类型（压缩包）
const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/gzip',
  'application/x-gzip',
  'application/x-bzip2',
  'application/x-xz',
  'application/x-tar',
];

const ALLOWED_CERT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

const ALLOWED_CERT_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.pdf',
];

const ALLOWED_ATTACHMENT_EXTENSIONS = [
  '.zip',
  '.rar',
  '.7z',
  '.tar',
  '.gz',
  '.bz2',
  '.xz',
];

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ATTACHMENT_SIZE = 500 * 1024 * 1024; // 500MB
const UPLOAD_DIR = './uploads/avatars';
const IMAGE_UPLOAD_DIR = './uploads/images';
const WIKI_ATTACHMENT_DIR = './uploads/wiki/attachments';
const PRODUCT_IMAGE_DIR = './uploads/products/images';
const PRODUCT_CERT_DIR = './uploads/products/certificates';

// 确保上传目录存在
for (const dir of [
  UPLOAD_DIR,
  IMAGE_UPLOAD_DIR,
  WIKI_ATTACHMENT_DIR,
  PRODUCT_IMAGE_DIR,
  PRODUCT_CERT_DIR,
]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 验证上传文件的MIME类型和路径安全性
 */
async function validateUploadedFile(
  file: Express.Multer.File,
  uploadDir: string,
  allowedMimeTypes: string[],
  urlPrefix: string,
): Promise<string> {
  const buffer = fs.readFileSync(file.path);
  const detectedType = await fileType.fromBuffer(buffer);

  if (!detectedType || !allowedMimeTypes.includes(detectedType.mime)) {
    fs.unlinkSync(file.path);
    throw new BadRequestException(
      `Invalid file type. Detected: ${detectedType?.mime || 'unknown'}. Allowed types: ${allowedMimeTypes.join(', ')}`,
    );
  }

  // 验证文件路径安全性（防止路径遍历）
  const filePath = path.join(uploadDir, file.filename);
  const resolvedPath = path.resolve(filePath);
  const resolvedUploadDir = path.resolve(uploadDir);

  if (!resolvedPath.startsWith(resolvedUploadDir)) {
    fs.unlinkSync(file.path);
    throw new BadRequestException('Invalid file path');
  }

  return `${urlPrefix}/${file.filename}`;
}

/**
 * 创建图片上传的 Multer 配置
 */
function createImageMulterOptions(uploadDir: string) {
  return {
    storage: diskStorage({
      destination: uploadDir,
      filename: (
        _req: unknown,
        file: Express.Multer.File,
        callback: (error: Error | null, filename: string) => void,
      ) => {
        const uniqueSuffix = uuidv4();
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
          return callback(new Error('Invalid file extension'), '');
        }
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (
      _req: unknown,
      file: Express.Multer.File,
      callback: (error: Error | null, accept: boolean) => void,
    ) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 1,
    },
  };
}

/**
 * 产品证书上传的 Multer 配置（图片 + PDF）
 */
function createCertificateMulterOptions(uploadDir: string) {
  return {
    storage: diskStorage({
      destination: uploadDir,
      filename: (
        _req: unknown,
        file: Express.Multer.File,
        callback: (error: Error | null, filename: string) => void,
      ) => {
        const uniqueSuffix = uuidv4();
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_CERT_EXTENSIONS.includes(ext)) {
          return callback(new Error('Invalid file extension'), '');
        }
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (
      _req: unknown,
      file: Express.Multer.File,
      callback: (error: Error | null, accept: boolean) => void,
    ) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|pdf)$/i)) {
        return callback(
          new Error('Only image or pdf files are allowed!'),
          false,
        );
      }
      callback(null, true);
    },
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 1,
    },
  };
}

@ApiTags('文件上传')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@CsrfProtected()
@Controller('uploads')
export class UploadsController {
  @Post('avatar')
  @UseGuards(PermissionsGuard)
  @Permissions('profile:change_avatar')
  @ApiOperation({ summary: '上传头像' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', createImageMulterOptions(UPLOAD_DIR)),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const url = await validateUploadedFile(
        file,
        UPLOAD_DIR,
        ALLOWED_IMAGE_MIME_TYPES,
        '/uploads/avatars',
      );
      return { url };
    } catch (error) {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  @Post('image')
  @UseGuards(PermissionsGuard)
  @Permissions('wiki:create')
  @ApiOperation({ summary: '上传文章图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', createImageMulterOptions(IMAGE_UPLOAD_DIR)),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const url = await validateUploadedFile(
        file,
        IMAGE_UPLOAD_DIR,
        ALLOWED_IMAGE_MIME_TYPES,
        '/uploads/images',
      );
      return { url };
    } catch (error) {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  @Post('wiki/attachment')
  @UseGuards(PermissionsGuard)
  @Permissions('wiki:create')
  @ApiOperation({ summary: '上传文章附件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: WIKI_ATTACHMENT_DIR,
        filename: (
          _req: unknown,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname).toLowerCase();
          if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext)) {
            return callback(new Error('Invalid archive format'), '');
          }
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: MAX_ATTACHMENT_SIZE,
        files: 1,
      },
    }),
  )
  async uploadWikiAttachment(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // 验证附件的真实MIME类型
      const buffer = fs.readFileSync(file.path);
      const detectedType = await fileType.fromBuffer(buffer);

      // 压缩包的MIME检测可能返回null（如.rar），回退到扩展名+报头检查
      if (
        detectedType &&
        !ALLOWED_ATTACHMENT_MIME_TYPES.includes(detectedType.mime)
      ) {
        fs.unlinkSync(file.path);
        throw new BadRequestException(
          `Invalid attachment type. Detected: ${detectedType.mime}. Only archive files are allowed.`,
        );
      }

      // 验证路径安全性
      const filePath = path.join(WIKI_ATTACHMENT_DIR, file.filename);
      const resolvedPath = path.resolve(filePath);
      const resolvedUploadDir = path.resolve(WIKI_ATTACHMENT_DIR);

      if (!resolvedPath.startsWith(resolvedUploadDir)) {
        fs.unlinkSync(file.path);
        throw new BadRequestException('Invalid file path');
      }

      return {
        filename: file.originalname,
        url: `/uploads/wiki/attachments/${file.filename}`,
        size: file.size,
        mimeType: detectedType?.mime || file.mimetype,
      };
    } catch (error) {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  @Post('product/image')
  @UseGuards(PermissionsGuard)
  @Permissions('product:create', 'product:edit', 'product:manage')
  @ApiOperation({ summary: '上传产品图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', createImageMulterOptions(PRODUCT_IMAGE_DIR)),
  )
  async uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    try {
      const url = await validateUploadedFile(
        file,
        PRODUCT_IMAGE_DIR,
        ALLOWED_IMAGE_MIME_TYPES,
        '/uploads/products/images',
      );
      return { url };
    } catch (error) {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  @Post('product/certificate')
  @UseGuards(PermissionsGuard)
  @Permissions('product:create', 'product:edit', 'product:manage')
  @ApiOperation({ summary: '上传产品证书（图片或 PDF）' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', createCertificateMulterOptions(PRODUCT_CERT_DIR)),
  )
  async uploadProductCertificate(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    try {
      const buffer = fs.readFileSync(file.path);
      const detectedType = await fileType.fromBuffer(buffer);
      if (
        !detectedType ||
        !ALLOWED_CERT_MIME_TYPES.includes(detectedType.mime)
      ) {
        fs.unlinkSync(file.path);
        throw new BadRequestException(
          `Invalid file type. Detected: ${detectedType?.mime || 'unknown'}. Allowed types: jpg/png/gif/webp/pdf`,
        );
      }
      const resolvedPath = path.resolve(
        path.join(PRODUCT_CERT_DIR, file.filename),
      );
      if (!resolvedPath.startsWith(path.resolve(PRODUCT_CERT_DIR))) {
        fs.unlinkSync(file.path);
        throw new BadRequestException('Invalid file path');
      }
      return {
        filename: file.originalname,
        url: `/uploads/products/certificates/${file.filename}`,
        size: file.size,
        mimeType: detectedType.mime,
      };
    } catch (error) {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

}
