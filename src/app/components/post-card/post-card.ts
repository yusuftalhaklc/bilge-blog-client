import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Post } from '../../models/post/post.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  @Input({ required: true }) post!: Post;
}

