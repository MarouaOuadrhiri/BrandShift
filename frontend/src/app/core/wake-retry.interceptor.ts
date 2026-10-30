import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, throwError, timer } from 'rxjs';

/**
 * The cloud demo backend sleeps when idle (free tier) and needs ~60-90s to
 * wake: while it wakes, requests fail at network level (status 0) or return
 * the platform's 503 wake page. Retry API calls for up to ~2 minutes so the
 * first click still gets in instead of showing an error.
 */
export const wakeRetryInterceptor: HttpInterceptorFn = (req, next) => {
  // Browser only: during SSR/prerender, requests must fail fast or the
  // build workers hang on the retry timers and the build fails.
  if (typeof window === 'undefined' || !req.url.includes('/api/')) {
    return next(req);
  }
  return next(req).pipe(
    retry({
      count: 4,
      delay: (error: unknown) => {
        if (error instanceof HttpErrorResponse && (error.status === 0 || error.status === 503)) {
          return timer(30000);
        }
        return throwError(() => error);
      },
    }),
  );
};
