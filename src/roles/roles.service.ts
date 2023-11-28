import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IUser } from 'src/users/users.interface';
import { Role, RoleDocument } from './schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import util from 'util';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class RolesService {
    constructor(
        @InjectModel(Role.name)
        private roleModel: SoftDeleteModel<RoleDocument>,
    ) {}

    create = async (createRoleDto: CreateRoleDto, user: IUser) => {
        try {
            const { name, description, isActive, permissions } = createRoleDto;

            const role = await this.roleModel.create({
                name,
                description,
                isActive,
                permissions,
                createdBy: {
                    _id: user._id,
                    email: user.email,
                },
            });

            return {
                _id: role._id,
                createdAt: role.createdAt,
            };
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException(`Duplicate key ${util.inspect(error.keyValue)}`);
            }
        }
    };

    findAll = async (currentPage: number, limit: number, qs: string) => {
        const { filter, sort, population } = aqp(qs);
        delete filter.currentPage;
        delete filter.limit;

        const offset = (+currentPage - 1) * +limit;
        const defaultLimit = +limit ? +limit : 10;

        const totalItems = (await this.roleModel.find(filter)).length;
        const totalPages = Math.ceil(totalItems / defaultLimit);

        const result = await this.roleModel
            .find(filter)
            .skip(offset)
            .limit(defaultLimit)
            .sort(sort as any)
            .populate(population)
            .exec();

        return {
            meta: {
                currentPage,
                pageSize: limit,
                totalPages,
                totalItems,
            },
            result,
        };
    };

    findOne = async (id: string) => {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('id must be mongooId');

        const role = await this.roleModel.findOne({ _id: id });

        if (!role) throw new NotFoundException('role not found');

        return role;
    };

    update = async (id: string, updateRoleDto: UpdateRoleDto, user: IUser) => {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('id must be mongooId');

        const { name, description, isActive, permissions } = updateRoleDto;

        return await this.roleModel.updateOne(
            { _id: id },
            {
                name,
                description,
                isActive,
                permissions,
                updatedBy: {
                    _id: user._id,
                    email: user.email,
                },
            },
        );
    };

    remove = async (id: string, user: IUser) => {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException('id must be mongooId');

        await this.roleModel.updateOne(
            { _id: id },
            {
                deletedBy: {
                    _id: user._id,
                    email: user.email,
                },
            },
        );

        return await this.roleModel.softDelete({
            _id: id,
        });
    };
}