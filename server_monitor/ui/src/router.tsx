import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import ServersDashboardPage from '@/pages/ServersDashboardPage';
import ServerOverviewPage from '@/pages/ServerOverviewPage';
import RequestsPage from '@/pages/RequestsPage';
import EventsPage from '@/pages/EventsPage';
import GalleryPage from '@/pages/GalleryPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'servers', element: <ServersDashboardPage /> },
      { path: 'requests', element: <RequestsPage /> },
      { path: 'events', element: <EventsPage /> },
      { path: 'gallery', element: <GalleryPage /> },
      // Task 2.3: Server Overview (placeholder registered now for ServerCard links)
      { path: 'servers/:name', element: <ServerOverviewPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
