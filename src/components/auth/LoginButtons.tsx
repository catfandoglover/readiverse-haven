import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function LoginButtons() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return (
      <div className="flex gap-2">
        <Button onClick={() => navigate('/profile')}>Profile</Button>
        <Button variant="destructive" onClick={signOut}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => navigate('/login')}>Login</Button>
      <Button variant="outline" onClick={() => navigate('/register')}>
        Sign Up
      </Button>
    </div>
  );
}
