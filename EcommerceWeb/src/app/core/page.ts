import { Directive, OnDestroy, inject } from "@angular/core";
import { ApiService } from "./api.service";
import { SessionService } from "./session.service";

/** Shared UI behavior only; business rules remain on the server. */
@Directive()
export abstract class Page implements OnDestroy {
  protected readonly api = inject(ApiService);
  readonly session = inject(SessionService);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  busy = false;

  async execute(action: () => Promise<void>): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.session.message.set("");
    try {
      await action();
    } catch {
      /* ApiService already shows a useful error to the user. */
    } finally {
      this.busy = false;
    }
  }

  /** Waits briefly before searching so typing does not make one request per key. */
  protected debounce(key: string, action: () => void, delay = 300): void {
    const previous = this.timers.get(key);
    if (previous) clearTimeout(previous);

    const run = (): void => {
      if (this.busy) {
        this.timers.set(key, setTimeout(run, 80));
        return;
      }
      this.timers.delete(key);
      action();
    };
    this.timers.set(key, setTimeout(run, delay));
  }

  protected matchesSearch(query: string, ...values: unknown[]): boolean {
    const term = this.normalize(query);
    if (!term) return true;
    return values.some((value) => this.normalize(String(value ?? "")).includes(term));
  }

  protected paginate<T>(items: T[], page: number, size: number): T[] {
    return items.slice(page * size, page * size + size);
  }

  pageCount(totalItems: number, pageSize: number): number {
    return Math.ceil(totalItems / pageSize);
  }

  pageNumbers(currentPage: number, totalPages: number): number[] {
    if (totalPages <= 0) return [];
    const visible = Math.min(5, totalPages);
    const first = Math.min(
      Math.max(0, currentPage - Math.floor(visible / 2)),
      totalPages - visible,
    );
    return Array.from({ length: visible }, (_, index) => first + index);
  }

  ngOnDestroy(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  private normalize(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es")
      .trim();
  }
}
