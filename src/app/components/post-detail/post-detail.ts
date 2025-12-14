import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post/post.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
})
export class PostDetail implements OnInit {
  private readonly postService = inject(PostService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  post = signal<Post | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadPost(slug);
    } else {
      this.error.set('Post bulunamadı');
      this.router.navigate(['/home']);
    }
  }

  loadPost(slug: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.postService.getPostBySlug(slug).subscribe({
      next: (post) => {
        this.post.set(post);
        this.loading.set(false);
      },
      error: (error) => {
        let errorMessage = 'Post yüklenirken bir hata oluştu.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 404) {
          errorMessage = 'Post bulunamadı.';
          this.router.navigate(['/home']);
        } else if (error.status === 0) {
          errorMessage = 'Bağlantı hatası! API\'ye ulaşılamıyor.';
        } else if (error.status === 500) {
          errorMessage = 'Sunucu hatası oluştu.';
        }
        
        this.loading.set(false);
        this.error.set(errorMessage);
        
        this.snackBar.open(errorMessage, 'Kapat', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        });
      }
    });
  }
}

