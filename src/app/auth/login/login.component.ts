import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    CardModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  checked1 = signal<boolean>(true);
  email = '';
  password = '';
  auth = inject(Auth);
  messageService = inject(MessageService);
  router = inject(Router);

  async onSubmit(event: Event) {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        this.email,
        this.password
      );
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('firebaseToken', token);
      this.router.navigate(['/home']);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential')
      {
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: 'User is not authorized to access the platform.',
        });
      }
      else
      {
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: error?.message,
        });
      }
    }
  }
}
