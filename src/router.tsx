import { createBrowserRouter } from 'react-router-dom'
import { PageLayout } from './components/layout/PageLayout'
import { NotFound } from './components/ui/NotFound'
import { RoutePlaceholder } from './components/ui/RoutePlaceholder'
import { NewsList } from './pages/News/NewsList'
import { NewsDetail } from './pages/News/NewsDetail'
import { EventsList } from './pages/Events/EventsList'
import { EventDetail } from './pages/Events/EventDetail'
import { ArticlesList } from './pages/Articles/ArticlesList'
import { ArticleDetail } from './pages/Articles/ArticleDetail'
import { Home } from './pages/Home/Home'
import { Team } from './pages/Team/Team'
import { Projects } from './pages/Projects/Projects'
import { Partners } from './pages/Partners/Partners'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'sobre', element: <RoutePlaceholder label="Sobre a LIAC" /> },
      { path: 'equipe', element: <Team /> },
      { path: 'eventos', element: <EventsList /> },
      { path: 'eventos/:slug', element: <EventDetail /> },
      { path: 'artigos', element: <ArticlesList /> },
      { path: 'artigos/:slug', element: <ArticleDetail /> },
      { path: 'novidades', element: <NewsList /> },
      { path: 'novidades/:slug', element: <NewsDetail /> },
      { path: 'projetos', element: <Projects /> },
      { path: 'parceiros', element: <Partners /> },
      { path: 'contato', element: <RoutePlaceholder label="Contato" /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
