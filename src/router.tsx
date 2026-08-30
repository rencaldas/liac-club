import { createBrowserRouter } from 'react-router-dom'
import { PageLayout } from './components/layout/PageLayout'
import { NotFound } from './components/ui/NotFound'
import { RoutePlaceholder } from './components/ui/RoutePlaceholder'
import { NewsList } from './pages/News/NewsList'
import { NewsDetail } from './pages/News/NewsDetail'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <RoutePlaceholder label="Home" /> },
      { path: 'sobre', element: <RoutePlaceholder label="Sobre a LIAC" /> },
      { path: 'equipe', element: <RoutePlaceholder label="Equipe" /> },
      { path: 'eventos', element: <RoutePlaceholder label="Eventos" /> },
      { path: 'eventos/:slug', element: <RoutePlaceholder label="Detalhe do Evento" /> },
      { path: 'artigos', element: <RoutePlaceholder label="Artigos Científicos" /> },
      { path: 'artigos/:slug', element: <RoutePlaceholder label="Detalhe do Artigo" /> },
      { path: 'novidades', element: <NewsList /> },
      { path: 'novidades/:slug', element: <NewsDetail /> },
      { path: 'projetos', element: <RoutePlaceholder label="Projetos de Pesquisa" /> },
      { path: 'parceiros', element: <RoutePlaceholder label="Parceiros" /> },
      { path: 'contato', element: <RoutePlaceholder label="Contato" /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
