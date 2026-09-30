import { Navigate, Route, Routes } from 'react-router-dom'
import { getSession } from './api'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import Stories from './pages/Stories'
import Events from './pages/Events'
import PeopleProducts from './pages/PeopleProducts'
import Reviews from './pages/Reviews'
import Timeline from './pages/Timeline'
import AtlasManagement from './pages/AtlasManagement'
import PublicAtlasHome from './pages/PublicAtlasHome'
import PublicAtlasCompany from './pages/PublicAtlasCompany'

function Protected(){ return getSession() ? <Layout/> : <Navigate to="/login" replace/> }

export default function App(){
  return <Routes>
    <Route path="/" element={<PublicAtlasHome/>}/>
    <Route path="/atlas" element={<PublicAtlasHome/>}/>
    <Route path="/atlas/company/:slug" element={<PublicAtlasCompany/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route element={<Protected/>}>
      <Route path="/hub" element={<Dashboard/>}/>
      <Route path="/library" element={<Library/>}/>
      <Route path="/stories" element={<Stories/>}/>
      <Route path="/events" element={<Events/>}/>
      <Route path="/people-products" element={<PeopleProducts/>}/>
      <Route path="/reviews" element={<Reviews/>}/>
      <Route path="/timeline" element={<Timeline/>}/>
      <Route path="/atlas-management" element={<AtlasManagement/>}/>
    </Route>
  </Routes>
}
