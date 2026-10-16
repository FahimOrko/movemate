import { createBrowserRouter } from 'react-router';
import { DesignPage } from '@/pages/design/design-page';
import { LandingPage } from '@/pages/landing/landing-page';
import { MovePhasePage } from '@/pages/move-shell/move-phase-page';
import { MoveShellPage } from '@/pages/move-shell/move-shell-page';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/design', element: <DesignPage /> },
  {
    path: '/move',
    element: <MoveShellPage />,
    children: [{ path: ':phase?', element: <MovePhasePage /> }],
  },
]);
