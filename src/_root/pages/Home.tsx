import Loader from '@/components/shared/Loader';

import { useGetRecentPosts } from '@/lib/tanstack-query/queriesAndMutaions';

import type { Post } from '@/types';

import PostCard from '@/components/shared/PostCard';
import { toast } from 'sonner';

const Home = () => {
  const {
    data: posts,
    isPending: isPostLoading,
    isError: isPostError,
  } = useGetRecentPosts();

  if (isPostError) {
    return (
      toast.error('Error fetching posts'),
      (<div className='flex-center w-full h-full'>Error fetching posts</div>)
    );
  }

  return (
    <div className='flex flex-1'>
      <div className='home-container'>
        <div className='home-posts'>
          <h2 className='h3-bold md:h2-bold text-left w-full'>Home Feed</h2>
          {isPostLoading && !posts ? (
            <div className='flex-center flex-1 w-full min-h-65'>
              <Loader />
            </div>
          ) : (
            <ul className='flex flex-col flex-1 gap-9 w-full'>
              {(posts?.documents as unknown as Post[])?.map((post, i) => (
                <PostCard key={i} post={post} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
