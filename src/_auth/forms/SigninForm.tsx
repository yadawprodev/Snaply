import { z } from 'zod';
import { signinValidation } from '@/lib/validation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import Loader from '@/components/shared/Loader';

import { useAuthStore } from '@/zustand_store/authStore';

import { useSignInAccount } from '@/lib/tanstack-query/queriesAndMutaions';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useEffect } from 'react';

const SigninForm = () => {
  // Tanstack mutation for singing in users
  const { mutateAsync: signInAccount, isPending: isSigninIn } =
    useSignInAccount();

  const checkAuthUser = useAuthStore((state) => state.checkAuthUser);
  const navigate = useNavigate();

  // Define our form
  const form = useForm<z.infer<typeof signinValidation>>({
    resolver: zodResolver(signinValidation),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // On submit form handler
  const onSubmit = async (values: z.infer<typeof signinValidation>) => {
    try {
      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });
      console.log('Session, ', session);

      if (!session) {
        return toast.error('Sign in failed! Please try again.');
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        navigate('/');
      } else {
        return toast.error('Sign in failed! Please try again.');
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';

      if (
        message.includes(
          'Creation of a session is prohibited when a session is active',
        )
      ) {
        return toast.error('You are already signed in!');
      }
      if (message.toLowerCase().includes('credential')) {
        toast.error('Invalid email or password.');
        return;
      }
    }
  };

  // Reset form on mount (clears browser-autofilled values)
  useEffect(() => {
    const id = window.setTimeout(() => {
      form.reset({
        email: '',
        password: '',
      });
    }, 0);

    return () => window.clearTimeout(id);
  }, [form]);

  return (
    <Form {...form}>
      <div className='w-full sm:w-420 flex-center flex-col'>
        <img src='/assets/images/logov4.svg' alt='logo' />
        <h2 className='h3-bold md:h2-bold pt-5 sm:pt-12'>
          Sign in to your account
        </h2>
        <p className='text-light-3 small-medium md:base-regular mt-2'>
          Welcome back! please enter your details.
        </p>

        <form
          autoComplete='off'
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-5 w-full mt-4'
        >
          {/* Field 1 — email  */}
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type='email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Field 2 — password  */}
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type='password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            className='shad-button_primary'
            disabled={isSigninIn}
          >
            {isSigninIn ? (
              <div className='flex-center gap-2'>
                <Loader /> Loading...
              </div>
            ) : (
              'Sign In'
            )}
          </Button>

          <p className='text-small-regular text-light-2 text-center mt-2 '>
            Don't have an account?
            <Link
              to='/sign-up'
              className='text-primary-500 text-small-semibold ml-1.5'
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SigninForm;
