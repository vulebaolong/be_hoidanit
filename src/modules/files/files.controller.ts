import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    ParseFilePipeBuilder,
    HttpStatus,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { UpdateFileDto } from './dto/update-file.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseService } from 'src/modules/firebase/firebase.service';
import { TAG_MODULE_FILES } from 'src/common/contants/swagger.contants';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@ApiTags(TAG_MODULE_FILES)
@Controller('files')
export class FilesController {
    constructor(
        private readonly filesService: FilesService,
        private readonly firebaseService: FirebaseService,
    ) {}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @ResponseMessage('Upload single file')
    create(
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    /**
                     * allow types
                     *  png (type/mimetype): png|image\/png
                     *  jpg (type/mimetype): jpg|image\/jpeg
                     */
                    fileType: /^(png|image\/png|jpg|image\/jpeg)$/i,
                })
                .addMaxSizeValidator({
                    maxSize: 1024 * 1024, //kb = 1MB
                    message: 'Size must be less than 1mb',
                })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                }),
        )
        file: Express.Multer.File,

        @Body('folder') folder: string,
    ) {
        return this.firebaseService.upload(file, folder);
    }

    @Get()
    findAll() {
        return this.filesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.filesService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
        return this.filesService.update(id, updateFileDto);
    }

    @Delete()
    remove(@Body('name') name: string) {
        return this.firebaseService.remove(name);
    }
}