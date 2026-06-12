import { useState } from 'react';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

import type { Post } from '@/types';

import { useAuthStore } from '@/zustand_store/authStore';

import FileUploader from '../shared/FileUploader';
import { postValidation } from '@/lib/validation';

import {
  useCreatePost,
  useUpdatePost,
} from '@/lib/tanstack-query/queriesAndMutaions';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Loader from '../shared/Loader';

type PostFormProps = {
  post?: Post;
  action: 'Create' | 'Update';
};

const PostForm = ({ post, action }: PostFormProps) => {
  const [fileKey, setFileKey] = useState(0);

  const { mutateAsync: createPost, isPending: isCreatingPost } =
    useCreatePost();

  const { mutateAsync: updatePost, isPending: isUpdatingPost } =
    useUpdatePost();

  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const schema =
    action === 'Update'
      ? postValidation.extend({ file: z.custom<File[]>().optional() })
      : postValidation;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      caption: post ? post?.caption : '',
      file: [],
      location: post ? post?.location : '',
      tags: post ? post?.tags?.join(', ') : '',
    },
  });

  function clearForm() {
    if (action === 'Update') {
      navigate(-1);
    } else {
      form.reset();
      setFileKey((prev) => prev + 1);
    }
  }

  // Form submit handler
  async function onSubmit(values: z.infer<typeof schema>) {
    if (post && action === 'Update') {
      const updatedPost = await updatePost({
        ...values,
        file: values.file ?? [],
        postId: post.$id,
        imageUrl: post?.imageUrl,
        imageId: post?.imageId,
        creator: {
          $id: post.creator.$id,
          name: post.creator.name,
          username: post.creator.username,
          imageUrl: post.creator.imageUrl,
        },
      });

      if (!updatedPost) {
        toast.error('Failed to update post. Please try again.');
        return;
      }

      return navigate(`/posts/${post.$id}`);
    }

    const newPost = await createPost({
      ...values,
      file: values.file ?? [],
      userId: user.id,
    });

    if (!newPost) {
      toast.error('Failed to create post. Please try again.');
    }

    navigate('/');
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-3 w-full max-w-5xl'
      >
        {/* Field 1 — caption  */}
        <FormField
          control={form.control}
          name='caption'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='shad-form_label'>Caption</FormLabel>
              <FormControl>
                <Textarea
                  className='shad-textarea custom-scrollbar'
                  {...field}
                />
              </FormControl>
              <FormMessage className='shad-form_message' />
            </FormItem>
          )}
        />
        {/* Field 2 — Upload file */}
        <FormField
          control={form.control}
          name='file'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='shad-form_label'>Add Photos</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  imageUrl={post?.imageUrl}
                  key={fileKey} // forces remount when fileKey changes
                />
              </FormControl>
              <FormMessage className='shad-form_message' />
            </FormItem>
          )}
        />

        {/* Field 3 — Location */}
        <FormField
          control={form.control}
          name='location'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='shad-form_label'>Add Location</FormLabel>
              <FormControl>
                <Input type='text' className='shad-input' {...field} />
              </FormControl>
              <FormMessage className='shad-form_message' />
            </FormItem>
          )}
        />

        {/* Field 4 — Tags */}
        <FormField
          control={form.control}
          name='tags'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='shad-form_label'>
                Add Tags (separated by comma " , ")
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
                  className='shad-input'
                  placeholder='Art, Expression, Learn'
                  {...field}
                />
              </FormControl>
              <FormMessage className='shad-form_message' />
            </FormItem>
          )}
        />
        <div className='flex gap-4 items-center justify-end'>
          <Button
            type='button'
            className='shad-button_dark_4'
            onClick={clearForm} // forces FileUploader to remount
          >
            Clear
          </Button>
          <Button
            type='submit'
            className='shad-button_primary whitespace-nowrap'
            disabled={isCreatingPost || isUpdatingPost}
          >
            {isCreatingPost || isUpdatingPost ? (
              <div className='flex items-center gap-2'>
                <Loader /> Loading...
              </div>
            ) : (
              action + 'Post'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
