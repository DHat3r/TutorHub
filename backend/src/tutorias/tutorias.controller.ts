import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TutoriasService } from './tutorias.service';
import { CreateTutoriaDto } from './dto/create-tutoria.dto';
import { UpdateTutoriaDto } from './dto/update-tutoria.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TutoringSession } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';


@ApiTags('tutorias')
@Controller('tutorias')
export class TutoriasController {
  constructor(private readonly tutoriasService: TutoriasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva tutoría' })
  @ApiResponse({ status: 201, description: 'La tutoría ha sido creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createTutoriaDto: CreateTutoriaDto,
    @GetUser() user: { id: number },
  ): Promise<TutoringSession> {
    // El tutor sale de la sesión, no del body: así nadie publica a nombre de otro tutor.
    createTutoriaDto.tutorId = await this.tutoriasService.getTutorProfileIdOrFail(user.id);
    return this.tutoriasService.create(createTutoriaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las tutorías, con filtros opcionales' })
  @ApiQuery({ name: 'ramo', required: false, description: 'Filtrar tutorías por el nombre del ramo (curso)' })
  @ApiQuery({ name: 'horario', required: false, description: 'Filtrar tutorías por horario (funcionalidad pendiente de detalle)' })
  @ApiQuery({ name: 'tutorId', required: false, type: Number, description: 'Filtrar tutorías por ID de tutor' })
  @ApiQuery({ name: 'status', required: false, description: 'Filtrar tutorías por estado (e.g., AVAILABLE, CONFIRMED, PENDING). Puede ser un string o un array de strings.' })
  @ApiQuery({ name: 'upcoming', required: false, type: Boolean, description: 'Filtrar solo tutorías futuras (start_time > ahora)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limitar el número de resultados devueltos.' })
  @ApiResponse({ status: 200, description: 'Lista de tutorías obtenida exitosamente.' })
  async findAll(
    @Query('ramo') ramo?: string,
    @Query('horario') horario?: string,
    @Query('tutorId', new ParseIntPipe({ optional: true })) tutorId?: number,
    @Query('status') status?: string | string[],
    @Query('upcoming') upcoming?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<TutoringSession[]> {
    const isUpcoming = upcoming === 'true';
    const tutorias = await this.tutoriasService.findAll(ramo, horario, tutorId, status, isUpcoming, limit);
    if (tutorias.length === 0 && ramo) {
    }
    return tutorias;
  }
  // 🔁 Esto va antes del Get(':id')
@Get('/recomendadas')
@UseGuards(JwtAuthGuard)
async getRecommended(@GetUser() user: { id: number }) {
  return this.tutoriasService.getRecommendedTutorings(user.id);
}


  @Get(':id/students')
  @UseGuards(JwtAuthGuard)
  async getStudents(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: { id: number },
  ) {
    // Devuelve correos de estudiantes: solo el tutor de la tutoría puede verlos.
    await this.tutoriasService.assertOwnedBy(id, user.id);
    return this.tutoriasService.getStudentsByTutoriaId(String(id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener los detalles de una tutoría específica' })
  @ApiResponse({ status: 200, description: 'Detalles de la tutoría obtenidos exitosamente.' })
  @ApiResponse({ status: 404, description: 'Tutoría no encontrada.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TutoringSession> {
    const tutoria = await this.tutoriasService.findOne(id);
    if (!tutoria) {
      throw new NotFoundException(`Tutoría con ID "${id}" no encontrada.`);
    }
    return tutoria;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una tutoría existente' })
  @ApiResponse({ status: 200, description: 'Tutoría actualizada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Tutoría no encontrada.' })
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTutoriaDto: UpdateTutoriaDto,
    @GetUser() user: { id: number },
  ): Promise<TutoringSession> {
    await this.tutoriasService.assertOwnedBy(id, user.id);
    delete updateTutoriaDto.tutorId; // no se puede traspasar una tutoría a otro tutor
    return this.tutoriasService.update(id, updateTutoriaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una tutoría existente' })
  @ApiResponse({ status: 200, description: 'Tutoría eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Tutoría no encontrada.' })
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: { id: number },
  ): Promise<TutoringSession> {
    await this.tutoriasService.assertOwnedBy(id, user.id);
    return this.tutoriasService.remove(id);
  }

  // ---- AQUI VA EL NUEVO ENDPOINT PARA CONTACTAR AL TUTOR ----
  @Post(':sessionId/contact')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Contactar al tutor de una tutoría (envía correo)' })
  @ApiResponse({ status: 200, description: 'Correo enviado al tutor exitosamente.' })
  async contactTutor(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body('message') message: string,
    @Req() req,
  ) {
    await this.tutoriasService.contactTutor(sessionId, req.user.id, message);
    return { success: true };
  }

  @Post(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Guardar una tutoría' })
  async save(@Param('id', ParseIntPipe) id: number, @GetUser() user: { id: number }) {
    return this.tutoriasService.save(id, user.id);
  }

  @Delete(':id/save')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar una tutoría guardada' })
  async unsave(@Param('id', ParseIntPipe) id: number, @GetUser() user: { id: number }) {
    return this.tutoriasService.unsave(id, user.id);
  }

  @Get('me/saved')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener las tutorías guardadas por el usuario' })
  async getSaved(@GetUser() user: { id: number }) {
    return this.tutoriasService.getSaved(user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Post(':id/rate-student')
  async rateStudent(
    @Param('id') id: string,
    @Body('studentId') studentId: number,
    @Body('rating') rating: number,
    @Req() req: any
  ) {
    // req.user.id debe ser el id del usuario autenticado (tutor)
    return this.tutoriasService.rateStudent(
      Number(id),
      studentId,
      rating,
      req.user.id
    );
  }
}
