import { Tag } from './tag.model';
import { Category } from '../category/category.model';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content?: string;
  isPublished: boolean;
  userId: string;
  userName: string;
  createdDate: string;
  updatedDate: string;
  tags: Tag[];
  category: Category;
  totalLikeCount: number;
  totalCommentCount: number;
  isLiked: boolean;
}

