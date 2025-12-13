import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService } from '../../services/category';
import { PagedResponse } from '../../models/common/paged-response.model';
import { Category as CategoryModel } from '../../models/category/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  
  categories = signal<CategoryModel[]>([]);
  pagedResponse = signal<PagedResponse<CategoryModel> | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  currentPage = signal<number>(1);
  pageSize = signal<number>(9);
  initialLoad = signal<boolean>(true);
  searchTerm = signal<string>('');

  displayedColumns: string[] = ['id', 'name', 'createdDate', 'actions'];

  showModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  editingCategoryId = signal<string | null>(null);
  formSubmitting = signal<boolean>(false);

  
  categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    if (this.initialLoad()) {
      this.loading.set(true);
    }
    this.error.set(null);

    this.categoryService.getCategories(this.currentPage(), this.pageSize(), this.searchTerm())
      .subscribe({
      next: (response) => {
        this.pagedResponse.set(response);
        this.categories.set(response.data);
        this.loading.set(false);
        this.initialLoad.set(false);
        
        if (response.data.length === 0 && response.pageNumber > 1) {
          this.currentPage.set(response.pageNumber - 1);
          this.loadCategories();
        }
      },
      error: (error) => {
        let errorMessage = 'Kategoriler yüklenirken bir hata oluştu.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 0) {
          errorMessage = 'Bağlantı hatası! API\'ye ulaşılamıyor. CORS veya network sorunu olabilir.';
        } else if (error.status === 404) {
          errorMessage = 'API endpoint bulunamadı.';
        } else if (error.status === 500) {
          errorMessage = 'Sunucu hatası oluştu.';
        }
        
        this.loading.set(false);
        
        this.snackBar.open(errorMessage, 'Tekrar Dene', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        }).onAction().subscribe(() => {
          this.loadCategories();
        });
      }
    });
  }
  
  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && this.pagedResponse() && pageNumber <= this.pagedResponse()!.totalPages) {
      this.currentPage.set(pageNumber);
      this.loadCategories();
    }
  }

  previousPage(): void {
    const response = this.pagedResponse();
    if (response && response.hasPreviousPage) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    const response = this.pagedResponse();
    if (response && response.hasNextPage) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.editingCategoryId.set(null);
    this.categoryForm.reset();
    this.showModal.set(true);
  }

  openEditModal(category: CategoryModel): void {
    this.isEditMode.set(true);
    this.editingCategoryId.set(category.id);
    this.categoryForm.patchValue({ name: category.name });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.categoryForm.reset();
    this.isEditMode.set(false);
    this.editingCategoryId.set(null);
    this.error.set(null);
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    this.formSubmitting.set(true);
    this.error.set(null);

    const name = this.categoryForm.value.name;

    if (this.isEditMode() && this.editingCategoryId()) {
      this.categoryService.updateCategory(this.editingCategoryId()!, name)
        .subscribe({
          next: () => {
            this.snackBar.open('Kategori başarıyla güncellendi', 'Kapat', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
            });
            this.closeModal();
            this.loadCategories();
            this.formSubmitting.set(false);
          },
        error: (error) => {
          const errorMessage = error.error?.message || 'Kategori güncellenirken bir hata oluştu.';
            this.error.set(errorMessage);
            this.formSubmitting.set(false);
            this.snackBar.open(errorMessage, 'Kapat', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
              panelClass: ['error-snackbar'],
            }); 
          }
        });
    } else {
      this.categoryService.createCategory(name)
        .subscribe({
        next: () => {
          this.snackBar.open('Kategori başarıyla oluşturuldu', 'Kapat', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
            });
            this.closeModal();
            this.loadCategories();
            this.formSubmitting.set(false);
          },
        error: (error) => {
          const errorMessage = error.error?.message || 'Kategori oluşturulurken bir hata oluştu.';
            this.error.set(errorMessage);
            this.formSubmitting.set(false);
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

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.loadCategories();
  }

  onSearchChange(searchValue: string): void {
    this.searchTerm.set(searchValue);
    this.currentPage.set(1);
    this.loadCategories();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadCategories();
  }

  deleteCategory(id: string, name: string): void {
    if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) {
      return;
    }

    this.categoryService.deleteCategory(id)
      .subscribe({
      next: () => {
        this.snackBar.open('Kategori başarıyla silindi', 'Kapat', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
          });
          this.loadCategories();
        },
      error: (error) => {
        const errorMessage = error.error?.message || 'Kategori silinirken bir hata oluştu.';
        this.snackBar.open(
            errorMessage,
            'Kapat',
            {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'bottom',
              panelClass: ['error-snackbar'],
            }
          );
        }
      });
  }

  openEditModalFromDropdown(category: CategoryModel): void {
    this.openEditModal(category);
  }
}