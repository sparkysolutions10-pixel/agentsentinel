/**
 * MemoryUsageSampler - Memory allocation tracking, delta analysis, and threshold enforcement.
 */

export interface MemorySample {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  external: number;
  timestamp: number;
}

export interface MemoryDelta {
  heapUsedDeltaBytes: number;
  rssDeltaBytes: number;
  elapsedMs: number;
}

export class MemoryUsageSampler {
  private baseline: MemorySample | null = null;
  private lastSample: MemorySample | null = null;

  public sample(customUsage?: NodeJS.MemoryUsage, timestamp: number = Date.now()): MemorySample {
    const raw = customUsage ?? process.memoryUsage();
    const sample: MemorySample = {
      heapUsed: raw.heapUsed,
      heapTotal: raw.heapTotal,
      rss: raw.rss,
      external: raw.external,
      timestamp
    };

    if (!this.baseline) {
      this.baseline = sample;
    }
    this.lastSample = sample;
    return sample;
  }

  public getBaseline(): MemorySample | null {
    return this.baseline;
  }

  public getLatest(): MemorySample | null {
    return this.lastSample;
  }

  public getDeltaFromBaseline(): MemoryDelta | null {
    if (!this.baseline || !this.lastSample) return null;
    return {
      heapUsedDeltaBytes: this.lastSample.heapUsed - this.baseline.heapUsed,
      rssDeltaBytes: this.lastSample.rss - this.baseline.rss,
      elapsedMs: this.lastSample.timestamp - this.baseline.timestamp
    };
  }

  public isWithinLimit(maxRssBytes: number): boolean {
    if (!this.lastSample) return true;
    return this.lastSample.rss <= maxRssBytes;
  }

  public static formatBytes(bytes: number): string {
    const abs = Math.abs(bytes);
    if (abs >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
    if (abs >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    if (abs >= 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    }
    return `${bytes} B`;
  }

  public reset(): void {
    this.baseline = null;
    this.lastSample = null;
  }
}
