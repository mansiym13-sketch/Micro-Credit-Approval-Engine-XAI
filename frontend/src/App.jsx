import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import LoanEvaluator from './pages/LoanEvaluator';
import History from './pages/History';
import Portfolio from './pages/Portfolio';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"          element={<LoanEvaluator />} />
          <Route path="/history"   element={<History />} />
          <Route path="/portfolio" element={<Portfolio />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
