import { IsEnum, IsISO8601, IsInt, IsOptional } from 'class-validator'
import { DayOfWeek } from '@prisma/client'

export class CreateAvailabilityDto {
  // Se ignora: el tutor es el usuario autenticado. Se acepta para no romper al frontend.
  @IsOptional()
  @IsInt()
  tutorId?: number

  @IsEnum(DayOfWeek)
  day_of_week: DayOfWeek

  @IsISO8601()
  start_time: string

  @IsISO8601()
  end_time: string
}
