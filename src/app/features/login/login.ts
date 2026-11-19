import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly pending = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    remember: [true],
  });

  showError(name: 'username' | 'password'): boolean {
    const control =
      name === 'username' ? this.form.controls.username : this.form.controls.password;
    return control.invalid && (control.touched || this.submitted());
  }

  submit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.focusFirstInvalid();
      return;
    }

    const { username, password, remember } = this.form.getRawValue();
    this.pending.set(true);

    this.auth.login(username, password, remember).subscribe({
      next: () => void this.router.navigateByUrl(this.returnUrl()),
      error: (err: unknown) => {
        this.pending.set(false);
        this.errorMessage.set(mapError(err));
        this.focusFirstInvalid();
      },
    });
  }

  focusFirstInvalid(): void {
    if (typeof document === 'undefined') return;
    setTimeout(() => {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    });
  }

  private returnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url && url.startsWith('/') ? url : '/home';
  }
}

function mapError(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 400)
      return 'Incorrect username or password. Use the demo credentials below.';
    if (err.status === 0)
      return 'Cannot reach the server. Check your connection and try again.';
    if (err.status >= 500)
      return 'The server is unavailable right now. Please try again in a moment.';
    return 'Sign-in failed. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}
