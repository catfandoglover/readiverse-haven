import { useAuth } from '@/contexts/OutsetaAuthContext';
import { Button } from '@/components/ui/button';

export function LoginButtons() {
  const { user, openLogin, openSignup, openProfile, logout } = useAuth();

  if (user) {
    return (
      <div className="flex gap-2">
        <Button onClick={() => openProfile()}>Profile</Button>
        <Button variant="destructive" onClick={logout}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => openLogin()}>Login</Button>
      <Button variant="outline" onClick={() => openSignup()}>
        Sign Up
      </Button>
    </div>
  );
}