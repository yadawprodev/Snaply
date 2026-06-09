import type { Post } from '@/types';

import { Link } from 'react-router-dom';
import { useAuthStore } from '@/zustand_store/authStore';
import PostStats from './PostStats';

type GridPostListProps = {
  posts: Post[];
  showUser?: boolean;
  showStats?: boolean;
  noId?: boolean;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  const user = useAuthStore((state) => state.user);

  return (
    <ul className='grid-container'>
      {posts.map((post) => (
        <li key={post.$id} className='relative min-w-80 h-80'>
          <Link to={`/posts/${post.$id}`} className='grid-post_link'>
            <img
              src={post.imageUrl}
              alt={'post'}
              className='w-full h-full object-cover'
            />
          </Link>
          <div className='grid-post_user'>
            {showUser && (
              <div className='flex items-center gap-2 justify-start flex-1'>
                <img
                  src={post.creator?.imageUrl || user.imageUrl}
                  alt='creator'
                  className='h-8 w-8 rounded-full'
                />
                <div className='line-clamp-1'>
                  {post.creator?.name || user.name}
                </div>
              </div>
            )}
            {showStats && <PostStats post={post} userId={user?.id} />}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default GridPostList;
