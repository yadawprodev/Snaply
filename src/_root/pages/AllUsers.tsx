import Loader from '@/components/shared/Loader';
import UserCard from '@/components/shared/UserCard';
import { useGetUsers } from '@/lib/tanstack-query/queriesAndMutaions';
import type { User } from '@/types';
import { toast } from 'sonner';

const AllUsers = () => {
  const { data: users, isLoading, isError: isUsersError } = useGetUsers();

  if (isUsersError) {
    toast.error('Error fetching users');
    return;
  }

  return (
    <div className='common-container'>
      <div className='user-container'>
        <h2 className='h3-bold md:h2-bold text-left w-full'>All Users</h2>
        {isLoading && !users ? (
          <Loader /> + 'Loading users...'
        ) : (
          <ul className='user-grid'>
            {users?.documents.map((user) => (
              <li key={user?.$id} className='flex-1 min-w-50 w-full'>
                <UserCard user={user as unknown as User} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
