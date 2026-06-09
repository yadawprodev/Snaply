import GridPostList from '@/components/shared/GridPostList';
import Loader from '@/components/shared/Loader';
import {
  useGetCurrentUser,
  useGetPostsByIds,
} from '@/lib/tanstack-query/queriesAndMutaions';

const Saved = () => {
  const { data: currentUser, isPending } = useGetCurrentUser();

  const postIds = currentUser?.save.map((savePost: any) => savePost.post) || [];

  const { data: savedPosts } = useGetPostsByIds(postIds);

  console.log('savedPosts', savedPosts);

  if (isPending) {
    return <Loader />;
  }

  //const savePosts = currentUser?.save.map((savePost: any) => {
  // const { data: posts } = useGetPostById(savePost.post);

  // return {
  //   ...savePost,
  // imageUrl: posts?.imageUrl,
  // creator: {
  //   imageUrl: posts?.creator.imageUrl,
  //   name: posts?.creator.name,
  // },
  //   };
  // });

  return (
    <div className='saved-container'>
      <div className='flex gap-2 w-full max-w-5xl'>
        <img
          src='/assets/icons/save.svg'
          width={36}
          height={36}
          alt='edit'
          className='invert-white'
        />
        <h2 className='h3-bold md:h2-bold text-left w-full'>Saved Posts</h2>
      </div>

      {!currentUser ? (
        <Loader />
      ) : (
        <ul className='flex w-full justify-center max-w-5xl gap-9'>
          {savedPosts?.length === 0 ? (
            <p className='text-light-4'>No available posts</p>
          ) : (
            <GridPostList posts={savedPosts ?? []} showStats={false} />
          )}
        </ul>
      )}
    </div>
  );
};

export default Saved;
