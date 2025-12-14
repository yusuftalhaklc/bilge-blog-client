import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly authState = inject(AuthStateService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  loading = signal<boolean>(false);
  hideOldPassword = signal<boolean>(true);
  hideNewPassword = signal<boolean>(true);
  hideConfirmPassword = signal<boolean>(true);
  error = signal<string | null>(null);

  changePasswordForm: FormGroup = this.fb.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (!newPassword || !confirmPassword) {
      return null;
    }
    
    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  ngOnInit(): void {
    // Redirect to login if not authenticated
    if (!this.authState.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.changePasswordForm.getRawValue();
    const changePasswordRequest = {
      oldPassword: formValue.oldPassword,
      newPassword: formValue.newPassword,
    };

    this.authService.changePassword(changePasswordRequest).subscribe({
      next: () => {
        this.snackBar.open('Şifre başarıyla değiştirildi', 'Kapat', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
        });

        // Reset form
        this.changePasswordForm.reset();
        this.loading.set(false);
      },
      error: (error) => {
        let errorMessage = 'Şifre değiştirilirken bir hata oluştu.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 400) {
          errorMessage = 'Eski şifre hatalı veya yeni şifre geçersiz.';
        } else if (error.status === 401) {
          errorMessage = 'Eski şifre hatalı.';
        } else if (error.status === 0) {
          errorMessage = 'Bağlantı hatası! API\'ye ulaşılamıyor.';
        } else if (error.status === 500) {
          errorMessage = 'Sunucu hatası oluştu.';
        }
        
        this.error.set(errorMessage);
        this.loading.set(false);
        
        this.snackBar.open(errorMessage, 'Kapat', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        });
      }
    });
  }

  toggleOldPasswordVisibility(): void {
    this.hideOldPassword.set(!this.hideOldPassword());
  }

  toggleNewPasswordVisibility(): void {
    this.hideNewPassword.set(!this.hideNewPassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
  }

  getPasswordMismatchError(): boolean {
    return this.changePasswordForm.hasError('passwordMismatch') && 
           this.changePasswordForm.get('confirmPassword')?.touched === true;
  }
}

