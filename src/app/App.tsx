import React from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { BoardProvider } from './context/BoardContext';
import { router } from './routes';

export default function App() {
  return (
    <BoardProvider>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </BoardProvider>
  );
}
