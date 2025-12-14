import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, Observable, switchMap } from 'rxjs';
import { ApiResponse } from '../models/common/api-response.model';
import { PagedResponse } from '../models/common/paged-response.model';
import { Post } from '../models/post/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/Post`;

  getPosts(
    pageNumber: number = 1,
    pageSize: number = 9,
    search: string = '',
    sort: 'asc' | 'desc' | '' = '',
    sortBy: string = ''
  ): Observable<PagedResponse<Post>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    if (sort && sortBy) {
      params = params.set('sort', sort);
      params = params.set('sortBy', sortBy);
    }

    return this.http.get<ApiResponse<PagedResponse<Post>>>(this.apiUrl, { params })
      .pipe(
        map(response => response.data)
      );
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<ApiResponse<Post>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  getPostBySlug(slug: string): Observable<Post> {
    // First, get all posts to find the post with matching slug
    // Then use the ID to get the full post details
    return this.getPosts(1, 1000).pipe(
      map((pagedResponse) => {
        const post = pagedResponse.data.find(p => p.slug === slug);
        if (!post) {
          throw new Error('Post not found');
        }
        return post;
      }),
      map((post) => {
        // Now get full post details by ID
        return this.getPostById(post.id);
      }),
      // Flatten the nested Observable
      switchMap((postObservable) => postObservable)
    );
  }
}

