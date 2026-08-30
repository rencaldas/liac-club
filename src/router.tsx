import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PageLayout } from './components/layout/PageLayout'
import { NotFound } from './components/ui/NotFound'
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
import { About } from './pages/About/About'
import { Contact } from './pages/Contact/Contact'
import { SetPassword } from './pages/SetPassword/SetPassword'
import { RequireAuth } from './auth/RequireAuth'
import { RequireRole } from './auth/RequireRole'
import { StaffLayout } from './components/staff/StaffLayout'
import { Login } from './pages/staff/Login/Login'
import { NewsManageList } from './pages/staff/News/NewsManageList'
import { NewsForm } from './pages/staff/News/NewsForm'
import { EventsManageList } from './pages/staff/Events/EventsManageList'
import { EventForm } from './pages/staff/Events/EventForm'
import { ArticlesManageList } from './pages/staff/Articles/ArticlesManageList'
import { ArticleForm } from './pages/staff/Articles/ArticleForm'
import { TeamManageList } from './pages/staff/Team/TeamManageList'
import { ChangeHistory } from './pages/staff/History/ChangeHistory'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'sobre', element: <About /> },
      { path: 'equipe', element: <Team /> },
      { path: 'eventos', element: <EventsList /> },
      { path: 'eventos/:slug', element: <EventDetail /> },
      { path: 'artigos', element: <ArticlesList /> },
      { path: 'artigos/:slug', element: <ArticleDetail /> },
      { path: 'novidades', element: <NewsList /> },
      { path: 'novidades/:slug', element: <NewsDetail /> },
      { path: 'projetos', element: <Projects /> },
      { path: 'parceiros', element: <Partners /> },
      { path: 'contato', element: <Contact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '/definir-senha', element: <SetPassword /> },
  {
    path: '/portal-liac',
    children: [
      { path: 'login', element: <Login /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <StaffLayout />,
            children: [
              { index: true, element: <Navigate to="novidades" replace /> },
              { path: 'novidades', element: <NewsManageList /> },
              { path: 'novidades/novo', element: <NewsForm /> },
              { path: 'novidades/:slug/editar', element: <NewsForm /> },
              { path: 'eventos', element: <EventsManageList /> },
              { path: 'eventos/novo', element: <EventForm /> },
              { path: 'eventos/:slug/editar', element: <EventForm /> },
              { path: 'artigos', element: <ArticlesManageList /> },
              { path: 'artigos/novo', element: <ArticleForm /> },
              { path: 'artigos/:slug/editar', element: <ArticleForm /> },
              {
                element: <RequireRole />,
                children: [
                  { path: 'equipe', element: <TeamManageList /> },
                  { path: 'historico', element: <ChangeHistory /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
])
