import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import Landing from './pages/Landing';
import Market from './pages/Market';
import Listing from './pages/Listing';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import './index.css';

const router = createBrowserRouter([
  { path: '/', element: <App />, children: [
    { index: true, element: <Landing /> },
    { path: 'market', element: <Market /> },
    { path: 'listing/:id', element: <Listing /> },
    { path: 'dashboard', element: <Dashboard /> },
    { path: 'inbox', element: <Inbox /> },
  ]},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);