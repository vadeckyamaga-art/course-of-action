import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import About from './pages/About';
import Programs from './pages/Programs';
import EmergencyResources from './pages/EmergencyResources';
import Testimonials from './pages/Testimonials';
import HowToHelp from './pages/HowToHelp';
import News from './pages/News';
import Contact from './pages/Contact';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ModerateTestimonials from './pages/admin/ModerateTestimonials';
import ManageNews from './pages/admin/ManageNews';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/a-propos" element={<About />} />
        <Route path="/programmes" element={<Programs />} />
        <Route path="/ressources-urgence" element={<EmergencyResources />} />
        <Route path="/temoignages" element={<Testimonials />} />
        <Route path="/comment-aider" element={<HowToHelp />} />
        <Route path="/actualites" element={<News />} />
        <Route path="/contact" element={<Contact />} />

        {/* Espace admin */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/temoignages" element={<ModerateTestimonials />} />
        <Route path="/admin/actualites" element={<ManageNews />} />
      </Routes>
    </BrowserRouter>
  );
}
