import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Catalogue from './pages/Catalogue.jsx';
import ExperienceDetail from './pages/ExperienceDetail.jsx';
import CatalogueTest from './pages/CatalogueTest.jsx';
import ExperienceDetailTest from './pages/ExperienceDetailTest.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalogue" element={<Catalogue />} />
        <Route path="experiences/:id" element={<ExperienceDetail />} />
        <Route path="test" element={<CatalogueTest />} />
        <Route path="test/:id" element={<ExperienceDetailTest />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
