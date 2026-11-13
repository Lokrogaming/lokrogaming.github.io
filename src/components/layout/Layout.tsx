import { Outlet } from 'react-router-dom';
import { useTranslation } from '@/lib';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { MobileNav } from './MobileNav';

export function Layout() {
  useTranslation();

  return (
    <>
      <Header />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <MobileNav />
    </>
  );
}
