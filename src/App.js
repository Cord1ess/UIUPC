// App.js - Main Application Component
import React, { useState, useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
// Lazy Loaded Main Pages
const Home = React.lazy(() => import("./pages/Home"));
const Gallery = React.lazy(() => import("./pages/Gallery"));
const Members = React.lazy(() => import("./pages/Members"));
const Events = React.lazy(() => import("./pages/Events"));
const Blog = React.lazy(() => import("./pages/Blog"));
const Join = React.lazy(() => import("./pages/Join"));
const Login = React.lazy(() => import("./pages/Login"));
const Committee2026 = React.lazy(() => import("./pages/Committee2026"));

// Lazy Loaded Components
const Admin = React.lazy(() => import("./pages/Admin"));
const EventDetail = React.lazy(() => import("./pages/EventDetail"));
const PhotoSubmissionForm = React.lazy(() => import("./components/PhotoSubmissionForm"));
const Contact = React.lazy(() => import("./pages/Contact"));
const ResultsPage = React.lazy(() => import("./components/ResultsPage"));
import Loading from "./components/Loading";

// Context
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useFeaturedPhotos, useUpcomingEvents } from "./hooks/useFirebaseData";

// Styles
import "./styles/App.css";

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Public Route component (redirect to admin if already logged in)
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/admin" />;
};

// Main app content component
function AppContent() {
  const { featuredPhotos } = useFeaturedPhotos();
  const { events } = useUpcomingEvents();
  const { loading: authLoading } = useAuth();

  // Show loading screen while auth is initializing
  if (authLoading) {
    return <Loading />;
  }

  return (
    <div className="App">
      <ScrollToTop />
      <Navbar />
      <main>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route
              path="/"
              element={<Home featuredPhotos={featuredPhotos} events={events} />}
            />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/members" element={<Members />} />
            <Route path="/events" element={<Events />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/join" element={<Join />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/events/:eventId" element={<EventDetail />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register/:eventId"
              element={<PhotoSubmissionForm />}
            />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/committee-2026" element={<Committee2026 />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

// Main App wrapper with AuthProvider and Router
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
