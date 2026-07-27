import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import ServersDashboardPage from '@/pages/ServersDashboardPage';
import ServerOverviewPage from '@/pages/ServerOverviewPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'servers', element: <ServersDashboardPage /> },
      // Task 2.3: Server Overview (placeholder registered now for ServerCard links)
      { path: 'servers/:name', element: <ServerOverviewPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
