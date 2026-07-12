import { Outlet } from 'react-router';
import Navbar from '../components/Navbar';

const RootLayout = () => {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-bg">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
