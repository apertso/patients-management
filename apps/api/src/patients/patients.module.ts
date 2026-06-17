import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { MockInstabilityInterceptor } from '../common/interceptors/mock-instability.interceptor';
import { PrismaModule } from '../prisma/prisma.module';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';

@Module({
  imports: [PrismaModule],
  controllers: [PatientsController],
  providers: [PatientsService, RolesGuard, MockInstabilityInterceptor],
})
export class PatientsModule {}
