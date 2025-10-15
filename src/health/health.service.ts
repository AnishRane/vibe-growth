import { Injectable } from '@nestjs/common';

interface RequestMetric {
  duration: number;
  timestamp: number;
  isError: boolean;
}

@Injectable()
export class HealthService {
  private readonly maxMetrics = 100;
  private metrics: RequestMetric[] = [];
  private readonly startTime: number = Date.now();

  addMetric(duration: number, isError: boolean): void {
    this.metrics.push({
      duration,
      timestamp: Date.now(),
      isError,
    });

    // Keep only the last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getUptime(): string {
    const uptimeMs = Date.now() - this.startTime;
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getLatencyP95(): number {
    if (this.metrics.length === 0) {
      return 0;
    }

    const durations = this.metrics.map((m) => m.duration).sort((a, b) => a - b);
    const p95Index = Math.ceil(durations.length * 0.95) - 1;
    return Math.round(durations[p95Index]);
  }

  getErrorRate(): number {
    if (this.metrics.length === 0) {
      return 0;
    }

    const errorCount = this.metrics.filter((m) => m.isError).length;
    const rate = (errorCount / this.metrics.length) * 100;
    return Math.round(rate * 100) / 100; // Round to 2 decimal places
  }

  getHealthMetrics() {
    return {
      uptime: this.getUptime(),
      latencyP95: this.getLatencyP95(),
      errorRate: this.getErrorRate(),
    };
  }
}
