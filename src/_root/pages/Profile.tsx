import {
  Outlet,
  useLocation,
  useParams,
  Route,
  Routes,
  Link,
} from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  useFollowUser,
  useGetUserById,
} from '@/lib/tanstack-query/queriesAndMutaions';
import { useAuthStore } from '@/zustand_store/authStore';

import LikedPosts from './LikedPosts';
import GridPostList from '@/components/shared/GridPostList';

interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className='flex-center gap-2'>
    <p className='small-semibold lg:body-bold text-primary-500'>{value}</p>
    <p className='small-medium lg:base-medium text-light-2'>{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();

  const user = useAuthStore((state) => state.user);

  const followers = useAuthStore((state) => state.followers);
  const following = useAuthStore((state) => state.following);
  const setFollowing = useAuthStore((state) => state.setFollowing);

  const setFollowers = useAuthStore((state) => state.setFollowers);

  const { data: currentUser } = useGetUserById(id || '');

  const { pathname } = useLocation();
  const isOwnProfile = user.id === currentUser?.$id;

  const { mutate: followUser } = useFollowUser();

  function handleFollowUser(e: React.MouseEvent) {
    e.stopPropagation();

    // Update followed user's followers
    let cpyFollowers = [...followers];
    const hasFollowed = cpyFollowers.includes(user.id);

    if (hasFollowed) {
      cpyFollowers = cpyFollowers.filter((id) => id !== user.id);
    } else {
      cpyFollowers.push(user.id);
    }

    // Update current user's following
    let cpyFollowing = [...following];
    const isFollowing = cpyFollowing.includes(currentUser!.$id);

    if (isFollowing) {
      cpyFollowing = cpyFollowing.filter((id) => id !== currentUser!.$id);
    } else {
      cpyFollowing.push(currentUser!.$id);
    }

    setFollowers(cpyFollowers);
    setFollowing(cpyFollowing);

    followUser({
      followedUserId: currentUser!.$id,
      followedUserFollowers: cpyFollowers,
      currentUserId: user.id,
      currentUserFollowing: cpyFollowing,
    });
  }

  return (
    <div className='profile-container'>
      <div className='profile-inner_container'>
        <div className='flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7'>
          <img
            src={
              currentUser?.imageUrl || '/assets/icons/profile-placeholder.svg'
            }
            alt='profile'
            className='w-28 h-28 lg:h-36 lg:w-36 rounded-full'
          />
          <div className='flex flex-col flex-1 justify-between md:mt-2'>
            <div className='flex flex-col w-full'>
              <h1 className='text-center xl:text-left h3-bold md:h1-semibold w-full'>
                {currentUser?.name}
              </h1>
              <p className='small-regular md:body-medium text-light-3 text-center xl:text-left'>
                @{currentUser?.username}
              </p>
            </div>

            <div className='flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20'>
              <StatBlock
                value={currentUser?.posts.length || ''}
                label='Posts'
              />
              <StatBlock
                value={currentUser?.followers?.length ?? 0}
                label='Followers'
              />
              <StatBlock
                value={currentUser?.following?.length ?? 0}
                label='Following'
              />
            </div>
            <p className='small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm'>
              {currentUser?.bio}
            </p>
          </div>

          <div className='flex justify-center gap-4'>
            <div className={`${!isOwnProfile && 'hidden'}`}>
              <Link
                to={`/update-profile/${currentUser?.$id}`}
                className={`h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg ${
                  !isOwnProfile && 'hidden'
                }`}
              >
                <img
                  src={'/assets/icons/edit.svg'}
                  alt='edit'
                  width={20}
                  height={20}
                />
                <p className='flex whitespace-nowrap small-medium'>
                  Edit Profile
                </p>
              </Link>
            </div>

            {/* Follow button — only show on other profiles */}
            {!isOwnProfile && (
              <div>
                <Button
                  onClick={handleFollowUser}
                  type='button'
                  className='shad-button_primary px-8'
                >
                  {followers.includes(user.id) ? 'Unfollow' : 'Follow'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isOwnProfile && (
        <div className='flex max-w-5xl w-full'>
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${
              pathname === `/profile/${id}` && 'bg-dark-3!'
            }`}
          >
            <img
              src={'/assets/icons/posts.svg'}
              alt='posts'
              width={20}
              height={20}
            />
            Posts
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-lg ${
              pathname === `/profile/${id}/liked-posts` && 'bg-dark-3!'
            }`}
          >
            <img
              src={'/assets/icons/like.svg'}
              alt='like'
              width={20}
              height={20}
            />
            Liked Posts
          </Link>
        </div>
      )}

      <Routes>
        <Route
          index
          element={
            <GridPostList posts={currentUser?.posts ?? []} showUser={false} />
          }
        />
        {isOwnProfile && <Route path='/liked-posts' element={<LikedPosts />} />}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;
