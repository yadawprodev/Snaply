import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';

import { useSignOutAccount } from '@/lib/tanstack-query/queriesAndMutaions';

import { INITIAL_USER, useAuthStore } from '@/zustand_store/authStore';

const Topbar = () => {
  const navigate = useNavigate();

  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  const { mutate: signOut, isSuccess } = useSignOutAccount();

  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  useEffect(() => {
    if (isSuccess) {
      setUser(INITIAL_USER);
      setIsAuthenticated(false);
      navigate('/sign-in');
    }
  }, [isSuccess, navigate, setIsAuthenticated, setUser]);

  return (
    <section className='topbar'>
      <div className='flex-between py-4 px-5'>
        <Link to='/' className='flex gap-3 items-center'>
          <img
            src='/assets/images/logov4.svg'
            alt='Snaply Logo'
            width={130}
            height={325}
          />
        </Link>

        <div className='flex gap-4'>
          <Button
            variant='ghost'
            className='shad-button_ghost'
            onClick={() => signOut()}
          >
            <img src='/assets/icons/logout.svg' alt='logout' />
          </Button>
          <Button>
            <Link to={`/profile/${user.id}`} className='flex-center gap-3'>
              <img
                src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
                alt={`${user.name}'s profile`}
                className='w-8 h-8 rounded-full object-cover'
              />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
