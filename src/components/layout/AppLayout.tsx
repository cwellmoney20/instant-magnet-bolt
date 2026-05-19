import TopNavBar from './TopNavBar';
import SideNavBar from './SideNavBar';
import BottomNavBar from './BottomNavBar';
import { NotificationProvider } from '../../context/NotificationContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-surface">
        <TopNavBar />
        <SideNavBar />
        <main className="md:ml-64 pt-20 pb-20 md:pb-0 min-h-screen">
          {children}
        </main>
        <BottomNavBar />
      </div>
    </NotificationProvider>
  );
}
