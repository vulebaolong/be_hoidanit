import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@ApiTags('jobs')
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new role' })
    @ResponseMessage('Create a new role')
    @ApiBody({ type: CreateRoleDto })
    create(@Body() createRoleDto: CreateRoleDto, @User() user: IUser) {
        return this.rolesService.create(createRoleDto, user);
    }

    @Get()
    @Public()
    @ResponseMessage('Get roles with pagination')
    findAll(@Query('currentPage') currentPage: string, @Query('limit') limit: string, @Query() qs: string) {
        return this.rolesService.findAll(+currentPage, +limit, qs);
    }

    @Get(':id')
    @Public()
    @ResponseMessage('Get a role')
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiBody({ type: UpdateRoleDto })
    @ApiOperation({ summary: 'update a role' })
    @ResponseMessage('Update a role')
    update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @User() user: IUser) {
        return this.rolesService.update(id, updateRoleDto, user);
    }

    @Delete(':id')
    @ResponseMessage('Delete a role')
    remove(@Param('id') id: string, @User() user: IUser) {
        return this.rolesService.remove(id, user);
    }
}