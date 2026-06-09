import { useParams } from 'react-router-dom';

import PostForm from '@/components/forms/PostForm';
import { useGetPostById } from '@/lib/tanstack-query/queriesAndMutaions';
import Loader from '@/components/shared/Loader';

const EditPost = () => {
  const { id } = useParams();

  const { data: post, isPending } = useGetPostById(id || '');

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className='flex flex-1'>
      <div className='common-container'>
        <div className='max-w-5xl flex-start gap-3 justify-start w-full'>
          <img
            src='/assets/icons/edit.svg'
            width={36}
            height={36}
            alt='edit-icon'
          />
          <h2 className='text-left h3-bold md:h2-bold w-full'>Edit Post</h2>
        </div>
        <PostForm action='Update' post={post} />
      </div>
    </div>
  );
};

export default EditPost;
