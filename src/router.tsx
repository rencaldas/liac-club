import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PageLayout } from './components/layout/PageLayout'
import { NotFound } from './components/ui/NotFound'
import { NewsList } from './pages/News/NewsList'
import { NewsDetail } from './pages/News/NewsDetail'
import { EventsList } from './pages/Events/EventsList'
import { EventDetail } from './pages/Events/EventDetail'
import { ArticlesList } from './pages/Articles/ArticlesList'
import { ArticleDetail } from './pages/Articles/ArticleDetail'
import { SymposiumEditionsList } from './pages/SymposiumEditions/SymposiumEditionsList'
import { SymposiumEditionDetail } from './pages/SymposiumEditions/SymposiumEditionDetail'
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
import { SymposiumEditionsManageList } from './pages/staff/SymposiumEditions/SymposiumEditionsManageList'
import { SymposiumEditionForm } from './pages/staff/SymposiumEditions/SymposiumEditionForm'
import { ProjectsManageList } from './pages/staff/Projects/ProjectsManageList'
import { ProjectForm } from './pages/staff/Projects/ProjectForm'
import { TestimonialsManageList } from './pages/staff/Testimonials/TestimonialsManageList'
import { TestimonialForm } from './pages/staff/Testimonials/TestimonialForm'
import { TeamManageList } from './pages/staff/Team/TeamManageList'
import { PartnersManageList } from './pages/staff/Partners/PartnersManageList'
import { PartnerForm } from './pages/staff/Partners/PartnerForm'
import { ChangeHistory } from './pages/staff/History/ChangeHistory'
import { ProfileForm } from './pages/staff/Profile/ProfileForm'
import { hasPartnerManagementAccess } from './auth/roles'

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
      { path: 'edicoes-anteriores', element: <SymposiumEditionsList /> },
      { path: 'edicoes-anteriores/:slug', element: <SymposiumEditionDetail /> },
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
              { path: 'edicoes-anteriores', element: <SymposiumEditionsManageList /> },
              { path: 'edicoes-anteriores/novo', element: <SymposiumEditionForm /> },
              { path: 'edicoes-anteriores/:slug/editar', element: <SymposiumEditionForm /> },
              { path: 'projetos', element: <ProjectsManageList /> },
              { path: 'projetos/novo', element: <ProjectForm /> },
              { path: 'projetos/:id/editar', element: <ProjectForm /> },
              { path: 'depoimentos', element: <TestimonialsManageList /> },
              { path: 'depoimentos/novo', element: <TestimonialForm /> },
              { path: 'depoimentos/:id/editar', element: <TestimonialForm /> },
              { path: 'perfil', element: <ProfileForm /> },
              {
                element: <RequireRole />,
                children: [
                  { path: 'equipe', element: <TeamManageList /> },
                  { path: 'historico', element: <ChangeHistory /> },
                ],
              },
              {
                element: <RequireRole check={hasPartnerManagementAccess} />,
                children: [
                  { path: 'parceiros', element: <PartnersManageList /> },
                  { path: 'parceiros/novo', element: <PartnerForm /> },
                  { path: 'parceiros/:id/editar', element: <PartnerForm /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
])
