import { createBrowserRouter } from 'react-router-dom'
import AppShell from './components/layout/AppShell'

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
    },
  ],
  { basename: import.meta.env.BASE_URL }
)
