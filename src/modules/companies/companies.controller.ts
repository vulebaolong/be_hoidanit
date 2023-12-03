import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import mongoose from 'mongoose';
import { IUser } from '../users/users.interface';
import { TAG_MODULE_COMPANIES } from 'src/common/contants/swagger.contants';
import { User } from 'src/common/decorators/user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@ApiTags(TAG_MODULE_COMPANIES)
@Controller({
    version: '1',
    path: 'companies',
})
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) { }

    @Post()
    @ApiOperation({ summary: 'Create a company' })
    @ApiBody({ type: CreateCompanyDto })
    @ApiBearerAuth()
    create(@Body() createCompanyDto: CreateCompanyDto, @User() user: IUser) {
        return this.companiesService.create(createCompanyDto, user);
    }

    @Get()
    @Public()
    @ApiBearerAuth()
    @ResponseMessage('Get list company with panigation')
    findAll(
        @Query('currentPage') currentPage: string,
        @Query('limit') limit: string,
        @Query() qs: string
    ) {
        return this.companiesService.findAll(+currentPage, +limit, qs);
    }

    @Get(':id')
    @Public()
    findOne(@Param('id') id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('id must be mongooId');

        return this.companiesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Create a company' })
    update(@Param('id') id: string, @Body() createCompanyDto: CreateCompanyDto, @User() user: IUser) {
        return this.companiesService.update(id, createCompanyDto, user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @User() user: IUser) {
        return this.companiesService.remove(id, user);
    }
}