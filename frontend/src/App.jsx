import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Compare from './pages/Compare';
import Saved from './pages/Saved';
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => {
  return (
    <AuthProvider>
      <CompareProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1e2639',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
              },
              success: {
                iconTheme: { primary: '#4ade80', secondary: '#1e2639' },
              },
              error: {
                iconTheme: { primary: '#f87171', secondary: '#1e2639' },
              },
            }}
          />

          <div className="min-h-screen flex flex-col">
            <Routes>
              {/* Auth pages (no Navbar) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Main app with Navbar */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/properties" element={<Properties />} />
                        <Route path="/properties/:id" element={<PropertyDetail />} />
                        <Route path="/compare" element={<Compare />} />
                        <Route
                          path="/saved"
                          element={
                            <ProtectedRoute>
                              <Saved />
                            </ProtectedRoute>
                          }
                        />
                      </Routes>
                    </main>
                  </>
                }
              />
            </Routes>
          </div>
        </Router>
      </CompareProvider>
    </AuthProvider>
  );
};

export default App;
