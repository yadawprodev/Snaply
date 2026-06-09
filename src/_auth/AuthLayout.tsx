import { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';

import { useAuthStore } from '@/zustand_store/authStore';

import Loader from '@/components/shared/Loader';

const AuthLayout = () => {
  const checkAuthUser = useAuthStore((state) => state.checkAuthUser);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    checkAuthUser();
  }, [checkAuthUser]);

  if (isLoading)
    return (
      <div className='flex-center h-screen w-full'>
        <Loader />
      </div>
    );

  return (
    <>
      {isAuthenticated ? (
        <Navigate to='/' />
      ) : (
        <>
          <section className='flex flex-1 justify-center items-center flex-col py-10'>
            <Outlet />
          </section>

          <img
            src='assets/images/side-img.svg'
            alt='logo'
            className='hidden xl:block h-screen w-1/2 object-cover bg-no-repeat'
          />
        </>
      )}
    </>
  );
};

export default AuthLayout;
