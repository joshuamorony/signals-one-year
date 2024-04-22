import { Injectable, Signal, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ApiService } from "../../shared/data-access/api.service";
import { Article } from "../../shared/interfaces/article";
import { FormControl } from "@angular/forms";
import { Observable, Subject, merge } from "rxjs";
import {
  filter,
  map,
  retry,
  shareReplay,
  startWith,
  switchMap,
} from "rxjs/operators";

export interface ArticlesState {
  articles: Signal<Article[]>;
  filter: Signal<string | null>;
  error: Signal<string | null>;
  status: Signal<"loading" | "success" | "error">;
  currentPage: Signal<number>;
}

@Injectable()
export class ArticlesService {
  private apiService = inject(ApiService);
  public filterControl = new FormControl();

  // sources
  public retry$ = new Subject<void>();
  public currentPage$ = new Subject<number>();
  private error$ = new Subject<Error>();

  private articlesForPage$: Observable<Article[]> = this.currentPage$.pipe(
    startWith(1),
    switchMap((page) =>
      this.apiService.getArticlesByPage(page).pipe(
        retry({
          delay: (err) => {
            this.error$.next(err);
            return this.retry$;
          },
        }),
        // note
        startWith([]),
      ),
    ),
    // note
    shareReplay(1),
  );

  private filter$ = this.filterControl.valueChanges.pipe(
    map((filter) => (filter === "" ? null : filter)),
  );

  // note
  private status$ = merge(
    this.articlesForPage$.pipe(
      filter((articles) => articles.length > 0),
      map(() => "success" as const),
    ),
    merge(this.currentPage$, this.retry$).pipe(map(() => "loading" as const)),
    this.error$.pipe(map(() => "error" as const)),
  );

  // selectors
  private currentPage = toSignal(this.currentPage$, { initialValue: 1 });
  private articles = toSignal(this.articlesForPage$, { initialValue: [] });
  private filter = toSignal(this.filter$);
  private error = toSignal(this.error$.pipe(map((err) => err.message)), {
    initialValue: null,
  });
  private status = toSignal(this.status$, { initialValue: "loading" });

  private filteredArticles = computed(() => {
    const filter = this.filter();

    return filter
      ? this.articles().filter((article) =>
          article.title.toLowerCase().includes(filter.toLowerCase()),
        )
      : this.articles();
  });

  // state
  public state: ArticlesState = {
    currentPage: this.currentPage,
    articles: this.filteredArticles,
    filter: this.filter,
    error: this.error,
    status: this.status,
  };
}
