import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Post, Comment, User, Product } from '../types';
import { mockPosts, mockComments, currentUser as defaultUser } from '../mockData';
import { products as initialProducts } from '../mockProducts';

interface BoardContextType {
  posts: Post[];
  comments: Comment[];
  addPost: (title: string, content: string, category: string) => void;
  addComment: (postId: string, content: string) => void;
  currentUser: User | null;
  login: (email: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  // 상품
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const login = (email: string) => {
    setCurrentUser({
      ...defaultUser,
      name: email.split('@')[0] || 'User',
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, ...updates });
  };

  const addPost = (title: string, content: string, category: string) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: `p${Date.now()}`,
      title,
      content,
      category: category as any,
      author: currentUser,
      createdAt: new Date().toISOString(),
      viewCount: 0,
      commentCount: 0,
      likes: 0,
    };
    setPosts([newPost, ...posts]);
  };

  const addComment = (postId: string, content: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `c${Date.now()}`,
      postId,
      content,
      author: currentUser,
      createdAt: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
    setPosts(posts.map(p =>
      p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
    ));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts(prev => [{ ...product, id: `prod-${Date.now()}` }, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <BoardContext.Provider value={{
      posts,
      comments,
      addPost,
      addComment,
      currentUser,
      login,
      logout,
      updateUser,
      isAuthenticated: !!currentUser,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
    }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
}
