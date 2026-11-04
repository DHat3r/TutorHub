import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

// Leer la disponibilidad es público; crear, editar y borrar exige ser el tutor dueño del bloque.
// En el original las cuatro rutas eran públicas y el tutorId venía en el body.
@Controller('disponibilidad')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get(':tutorId')
  getAvailability(@Param('tutorId', ParseIntPipe) tutorId: number) {
    return this.availabilityService.getTutorAvailability(tutorId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBlock(@Body() dto: CreateAvailabilityDto, @GetUser() user: { id: number }) {
    const tutorId = await this.availabilityService.getTutorProfileIdOrFail(user.id);
    return this.availabilityService.createAvailabilityBlock({
      tutor: { connect: { id: tutorId } },
      day_of_week: dto.day_of_week,
      start_time: new Date(dto.start_time),
      end_time: new Date(dto.end_time),
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateBlock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAvailabilityDto,
    @GetUser() user: { id: number },
  ) {
    await this.availabilityService.assertBlockOwnedBy(id, user.id);
    const data: Prisma.AvailabilityBlockUpdateInput = {};
    if (dto.day_of_week) data.day_of_week = dto.day_of_week;
    if (dto.start_time) data.start_time = new Date(dto.start_time);
    if (dto.end_time) data.end_time = new Date(dto.end_time);
    return this.availabilityService.updateAvailabilityBlock(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteBlock(@Param('id', ParseIntPipe) id: number, @GetUser() user: { id: number }) {
    await this.availabilityService.assertBlockOwnedBy(id, user.id);
    return this.availabilityService.deleteAvailabilityBlock(id);
  }
}
