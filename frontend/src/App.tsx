import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { ResultsPage } from './pages/ResultsPage';
import { SchemeDetailPage } from './pages/SchemeDetailPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="questionnaire" element={<QuestionnairePage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="schemes/:id" element={<SchemeDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
