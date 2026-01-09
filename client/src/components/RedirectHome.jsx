import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const RedirectHome = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        // If logged in, go to the dashboard
        navigate('/home', { replace: true });
      } else {
        // If NOT logged in, go to the Alpha Landing Page
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate]);

  return <Loader />;
};

export default RedirectHome;