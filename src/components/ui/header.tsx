import { LoginButtons } from '@/components/auth/LoginButtons';

export function Header() {
  return (
    <header className="w-full border-b">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="font-semibold">
            Readiverse Haven
          </a>
        </div>
        <LoginButtons />
      </div>
    </header>
  );
}

export default Header;