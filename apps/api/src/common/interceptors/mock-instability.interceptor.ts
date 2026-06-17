import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable, mergeMap, throwError, timer } from 'rxjs';

@Injectable()
export class MockInstabilityInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (this.configService.get<string>('MOCK_LATENCY_ENABLED') !== 'true') {
      return next.handle();
    }

    const minMs = this.getNonNegativeNumber('MOCK_LATENCY_MIN_MS', 200);
    const maxMs = Math.max(minMs, this.getNonNegativeNumber('MOCK_LATENCY_MAX_MS', 900));
    const failureRate = this.getFailureRate();
    const delayMs = this.getRandomDelay(minMs, maxMs);

    if (Math.random() < failureRate) {
      return timer(delayMs).pipe(
        mergeMap(() =>
          throwError(
            () => new ServiceUnavailableException('Temporary simulated failure. Please retry.'),
          ),
        ),
      );
    }

    return timer(delayMs).pipe(mergeMap(() => next.handle()));
  }

  private getNonNegativeNumber(key: string, fallback: number): number {
    const value = Number(this.configService.get<string>(key));
    return Number.isFinite(value) && value >= 0 ? value : fallback;
  }

  private getFailureRate(): number {
    const value = Number(this.configService.get<string>('MOCK_FAILURE_RATE'));

    if (!Number.isFinite(value)) {
      return 0.05;
    }

    return Math.min(1, Math.max(0, value));
  }

  private getRandomDelay(minMs: number, maxMs: number): number {
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }
}
