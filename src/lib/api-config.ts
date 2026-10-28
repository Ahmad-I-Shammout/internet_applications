/**
 * Central API & Mock Configuration
 * Easily toggle between mock data and real backend endpoints
 */

class ApiConfigStore {
  // Toggle mock vs real REST API
  public useMock: boolean =
    process.env.NEXT_PUBLIC_USE_MOCK_API !== undefined
      ? process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
      : true;

  // Realistic network latency simulation in ms
  public mockDelayMs: number = 400;

  // Requirement 2: Warehouse service state (can be toggled in UI to prove failure handling)
  public isWarehouseOnline: boolean = true;

  // Requirement 1: Simulate rate limiting (HTTP 429) for login attempts
  public loginAttemptsCount: number = 0;
  public maxLoginAttempts: number = 4;

  // Listeners for UI reactive state
  private listeners: Array<() => void> = [];

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public setWarehouseOnline(online: boolean) {
    this.isWarehouseOnline = online;
    this.notify();
  }

  public resetLoginAttempts() {
    this.loginAttemptsCount = 0;
    this.notify();
  }

  public incrementLoginAttempts(): boolean {
    this.loginAttemptsCount += 1;
    this.notify();
    return this.loginAttemptsCount > this.maxLoginAttempts;
  }
}

export const API_CONFIG = new ApiConfigStore();
