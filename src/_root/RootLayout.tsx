import { useEffect } from 'react';

import { Outlet, useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/zustand_store/authStore';

import Loader from '@/components/shared/Loader';
import Topbar from '@/components/shared/Topbar';
import LeftSidebar from '@/components/shared/LeftSidebar';
import Bottombar from '@/components/shared/Bottombar';

const RootLayout = () => {
  const navigate = useNavigate();

  const checkAuthUser = useAuthStore((state) => state.checkAuthUser);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // check if user is authenticated
  useEffect(() => {
    checkAuthUser();
  }, [checkAuthUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/sign-in');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading)
    return (
      <div className='flex-center h-screen w-full'>
        <Loader />
      </div>
    );

  return (
    <div className='w-full md:flex'>
      <Topbar />
      <LeftSidebar />

      <section className='flex flex-1 h-full'>
        <Outlet />
      </section>

      <Bottombar />
    </div>
  );
};

export default RootLayout;
