import { useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';

import { Button } from '../ui/button';

import { useSignOutAccount } from '@/lib/tanstack-query/queriesAndMutaions';

import { INITIAL_USER, useAuthStore } from '@/zustand_store/authStore';
import { sidebarLinks } from '@/constants';
import type { INavLink } from '@/types';

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

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
  }, [isSuccess, navigate, setIsAuthenticated]);

  return (
    <nav className='leftsidebar'>
      <div className='flex flex-col gap-11'>
        <Link to='/' className='flex gap-3 items-center'>
          <img
            src='/assets/images/logov4.svg'
            alt='Snaply Logo'
            width={170}
            height={36}
          />
        </Link>

        <Link to={`/profile/${user.id}`} className='flex gap-3 items-center'>
          <img
            src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
            alt='Profile'
            className='h-14 w-14 rounded-full object-cover'
          />
          <div className='flex flex-col'>
            <p className='body-bold'>{user.name}</p>
            <p className='text-light-3 small-regular'>@{user.username}</p>
          </div>
        </Link>

        <ul className='flex flex-col gap-6'>
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;

            return (
              <li
                key={link.label}
                className={`leftsidebar-link group ${isActive && 'bg-primary-500'}`}
              >
                <NavLink
                  to={link.route}
                  className='flex gap-3 items-center p-3.5'
                >
                  <img
                    src={link.imgURL}
                    alt={`${link.label} icon`}
                    className={`group-hover:invert-white ${isActive && 'invert-white'}`}
                  />
                  <span className='text-base'>{link.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        variant='ghost'
        className='shad-button_ghost'
        onClick={() => signOut()}
      >
        <img src='/assets/icons/logout.svg' alt='logout' />
        <p className='small-medium lg:base-medium'>Logout</p>
      </Button>
    </nav>
  );
};

export default LeftSidebar;
