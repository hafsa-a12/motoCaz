import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function useAuth(redirectTo: string = '/login') {
  const navigate = useNavigate();
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) navigate(redirectTo);
  }, []);
}
