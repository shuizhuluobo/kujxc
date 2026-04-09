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
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as fileType from 'file-type';

// 允许的 MIME 类型
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ATTACHMENT_SIZE = 500 * 1024 * 1024; // 500MB
const UPLOAD_DIR = './uploads/avatars';
const WIKI_ATTACHMENT_DIR = './uploads/wiki/attachments';

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const IMAGE_UPLOAD_DIR = './uploads/images';
if (!fs.existsSync(IMAGE_UPLOAD_DIR)) {
  fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });
}

if (!fs.existsSync(WIKI_ATTACHMENT_DIR)) {
  fs.mkdirSync(WIKI_ATTACHMENT_DIR, { recursive: true });
}

@ApiTags('文件上传')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, callback) => {
          // 使用UUID作为文件名，确保安全性
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname).toLowerCase();
          // 验证扩展名
          const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
          if (!validExtensions.includes(ext)) {
            return callback(new Error('Invalid file extension'), '');
          }
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // 初步扩展名检查
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1, // 只允许上传一个文件
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // 读取文件内容并验证真实 MIME 类型
      const buffer = fs.readFileSync(file.path);
      const detectedType = await fileType.fromBuffer(buffer);

      if (!detectedType || !ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
        // 删除不合法的文件
        fs.unlinkSync(file.path);
        throw new BadRequestException(
          `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        );
      }

      // 验证文件路径安全性
      const filePath = path.join(UPLOAD_DIR, file.filename);
      const resolvedPath = path.resolve(filePath);
      const resolvedUploadDir = path.resolve(UPLOAD_DIR);

      if (!resolvedPath.startsWith(resolvedUploadDir)) {
        fs.unlinkSync(file.path);
        throw new BadRequestException('Invalid file path');
      }

      return {
        url: `/uploads/avatars/${file.filename}`,
      };
    } catch (error) {
      // 清理临时文件
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  @Post('image')
  @UseGuards(PermissionsGuard)
  @Permissions('wiki:create') // Allow users with wiki create permission to upload images
  @ApiOperation({ summary: '上传文章图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: IMAGE_UPLOAD_DIR,
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname).toLowerCase();
          const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
          if (!validExtensions.includes(ext)) {
            return callback(new Error('Invalid file extension'), '');
          }
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const buffer = fs.readFileSync(file.path);
      const detectedType = await fileType.fromBuffer(buffer);

      if (!detectedType || !ALLOWED_MIME_TYPES.includes(detectedType.mime)) {
        fs.unlinkSync(file.path);
        throw new BadRequestException(
          `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        );
      }

      const filePath = path.join(IMAGE_UPLOAD_DIR, file.filename);
      const resolvedPath = path.resolve(filePath);
      const resolvedUploadDir = path.resolve(IMAGE_UPLOAD_DIR);

      if (!resolvedPath.startsWith(resolvedUploadDir)) {
        fs.unlinkSync(file.path);
        throw new BadRequestException('Invalid file path');
      }

      return {
        url: `/uploads/images/${file.filename}`,
      };
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
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: WIKI_ATTACHMENT_DIR,
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4();
          const ext = extname(file.originalname).toLowerCase();
          const validExtensions = [
            '.zip',
            '.rar',
            '.7z',
            '.tar',
            '.gz',
            '.bz2',
            '.xz',
          ];
          if (!validExtensions.includes(ext)) {
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

    return {
      filename: file.originalname,
      url: `/uploads/wiki/attachments/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
