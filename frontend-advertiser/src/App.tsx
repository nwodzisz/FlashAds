import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SubmissionForm from './pages/SubmissionForm';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="app-header">
          <h1>FlashAds Portal</h1>
          <p>Boost your local business instantly</p>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<SubmissionForm />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
