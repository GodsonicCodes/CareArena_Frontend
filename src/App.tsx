import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/layout';
import { ToastProvider } from '@/components/ui';
import {
  Dashboard,
  CampaignsList,
  CreateCampaign,
  CampaignDetail,
  TestingTools,
  Analytics,
  Settings,
} from '@/pages';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/campaigns" element={<CampaignsList />} />
              <Route path="/campaigns/create" element={<CreateCampaign />} />
              <Route path="/campaigns/:jobId" element={<CampaignDetail />} />
              <Route path="/testing" element={<TestingTools />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
