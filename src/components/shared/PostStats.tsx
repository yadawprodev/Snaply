import { useEffect, useMemo, useState } from 'react';

import type { Post } from '@/types';

import {
  useLikePost,
  useSavePost,
  useUnsavePost,
} from '@/lib/tanstack-query/queriesAndMutaions';

import { checkIsLiked } from '@/lib/utils';
import Loader from './Loader';

type postStatProps = {
  post?: Post;
  userId: string;
};

const PostStats = ({ post, userId }: postStatProps) => {
  const likeUserIds = post?.likes?.map((user) => user.$id) ?? [];

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isPending: isSavingPost } = useSavePost();
  const { mutate: unsavePost, isPending: isUnsavingPost } = useUnsavePost();

  // if savedPost is not null or undefined, then it will be true, otherwise false.
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(likeUserIds);

  // Check if the post is already saved by the user
  const savedPost = useMemo(
    () => post?.save?.find((saved) => saved.user === userId),
    [post, userId],
  );

  // sync likes when post changes (e.g. after refetch)
  useEffect(() => {
    setLikes(post?.likes?.map((user) => user.$id) ?? []);
  }, [post]);

  // sync isSaved when savedPost changes (e.g. after mutation refetch)
  useEffect(() => {
    setIsSaved(!!savedPost);
  }, [savedPost]);

  // Function to handle like post
  const handleLikePost = (e: React.MouseEvent) => {
    // when we click on the like button, it won't trigger the onClick event of the parent element
    e.stopPropagation();

    let updatedLikes = [...likes];
    const hasLiked = updatedLikes.includes(userId);

    if (hasLiked) {
      updatedLikes = updatedLikes.filter((id) => id !== userId);
    } else {
      updatedLikes.push(userId);
    }

    setLikes(updatedLikes);
    likePost({ postId: post?.$id || '', usersId: updatedLikes });
  };

  // Function to handle save post
  const handleSavePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If the post is already saved, unsave it
    if (isSaved) {
      setIsSaved(false);

      // Call the API to unsave the post using the savedPost.$id
      unsavePost(savedPost?.$id || '');
    } else {
      setIsSaved(true);
      // Call the API to save the post using the post.$id and userId
      savePost({
        postId: post?.$id || '',
        userId,
      });
    }
  };

  return (
    <div className='flex justify-between items-center z-20'>
      <div className='flex gap-2 mr-5'>
        <img
          src={`/assets/icons/${checkIsLiked(likes, userId) ? 'liked' : 'like'}.svg`}
          alt='like'
          onClick={handleLikePost}
          className='cursor-pointer w-5 h-5'
        />
        <p className='small-medium lg:base-medium'>{likes.length}</p>
      </div>

      <div className='flex gap-2'>
        {isSavingPost || isUnsavingPost ? (
          <Loader />
        ) : (
          <img
            src={`/assets/icons/${isSaved ? 'saved' : 'save'}.svg`}
            alt='save'
            onClick={handleSavePost}
            className='cursor-pointer w-5 h-5'
          />
        )}
      </div>
    </div>
  );
};

export default PostStats;
