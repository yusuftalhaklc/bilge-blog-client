import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, Observable, tap } from 'rxjs';
import { PagedResponse } from '../models/common/paged-response.model';
import { ApiResponse } from '../models/common/api-response.model';
import { Category as CategoryModel } from '../models/category/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiBaseUrl}/Category`;

  getCategories(
    pageNumber: number = 1, 
    pageSize: number = 9, 
    search: string = '',
    sort: 'asc' | 'desc' | '' = '',
    sortBy: string = ''
  ): Observable<PagedResponse<CategoryModel>> {
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

    return this.http.get<ApiResponse<PagedResponse<CategoryModel>>>(this.apiUrl, { params })
      .pipe(
        map(response => response.data)
      );
  }

  getCategoryById(id: string): Observable<CategoryModel> {
    return this.http.get<ApiResponse<CategoryModel>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  createCategory(name: string): Observable<string> {
    return this.http.post<ApiResponse<string>>(this.apiUrl, { name })
      .pipe(
        map(response => response.data)
      );
  }

  updateCategory(id: string, name: string): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(`${this.apiUrl}/${id}`, { name })
      .pipe(
        map(response => response.data)
      );
  }

  deleteCategory(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }
}
