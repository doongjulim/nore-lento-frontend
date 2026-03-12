export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  viewCount: number;
  commentCount: number;
  category: 'notice' | 'free' | 'qna' | 'tech';
  likes: number;
}

export type Category = {
  id: 'all' | 'notice' | 'free' | 'qna' | 'tech';
  label: string;
  icon?: React.ReactNode;
};

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: 'electronics' | 'clothing' | 'food' | 'books' | 'beauty';
  image: string;
  rating: number;
  reviewCount: number;
  description: string;
  stock: number;
  badge?: 'new' | 'sale' | 'hot';
}

export interface CartItem {
  product: Product;
  quantity: number;
}
