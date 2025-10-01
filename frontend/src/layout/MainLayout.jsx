import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

/**
 * Main Layout Component
 * Wraps pages with Navbar and consistent layout structure
 */
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <main className="min-h-[calc(100vh-64px)]">
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default MainLayout;
