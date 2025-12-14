import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { PostService } from '../../services/post.service';
import { PagedResponse } from '../../models/common/paged-response.model';
import { Post } from '../../models/post/post.model';
import { PostCard } from '../post-card/post-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatIconModule,
    PostCard,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly postService = inject(PostService);
  private readonly snackBar = inject(MatSnackBar);

  posts = signal<Post[]>([]);
  pagedResponse = signal<PagedResponse<Post> | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  currentPage = signal<number>(1);
  pageSize = signal<number>(9);

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.postService.getPosts(
      this.currentPage(),
      this.pageSize()
    ).subscribe({
      next: (response) => {
        this.pagedResponse.set(response);
        this.posts.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        let errorMessage = 'Bloglar yüklenirken bir hata oluştu.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 0) {
          errorMessage = 'Bağlantı hatası! API\'ye ulaşılamıyor.';
        } else if (error.status === 500) {
          errorMessage = 'Sunucu hatası oluştu.';
        }
        
        this.loading.set(false);
        this.error.set(errorMessage);
        
        this.snackBar.open(errorMessage, 'Tekrar Dene', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        }).onAction().subscribe(() => {
          this.loadPosts();
        });
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadPosts();
  }
}

