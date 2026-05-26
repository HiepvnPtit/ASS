import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor() {}

  /**
   * POST /uploads/files
   * Upload file và lưu vào /uploads
   */
  @Post('files')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Chỉ chấp nhận hình ảnh
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException(
              'Chỉ chấp nhận file hình ảnh (jpg, png, gif, webp)',
            ),
            false,
          );
        }

        // Giới hạn dung lượng 5MB
        if (file.size > 5 * 1024 * 1024) {
          return cb(
            new BadRequestException('Dung lượng file không vượt quá 5MB'),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Upload hình ảnh' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File hình ảnh (jpg, png, gif, webp)',
        },
      },
    },
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không có file được tải lên');
    }

    return {
      message: 'Upload file thành công',
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
