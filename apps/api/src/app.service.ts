import { Injectable } from '@nestjs/common';

export type HealthResponse = {
  ok: true;
  service: 'patients-management-api';
};

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      ok: true,
      service: 'patients-management-api',
    };
  }
}
