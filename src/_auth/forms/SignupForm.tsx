import { z } from 'zod';
import { signupValidation } from '@/lib/validation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import Loader from '@/components/shared/Loader';

import { useAuthStore } from '@/zustand_store/authStore';

import {
  useCreateUserAccount,
  useSignInAccount,
} from '@/lib/tanstack-query/queriesAndMutaions';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const SignupForm = () => {
  // Tanstack mutation for creating users
  const { mutateAsync: createUserAccount, isPending: isCreatingUser } =
    useCreateUserAccount();

  // Tanstack mutation for singing in users
  const { mutateAsync: signInAccount, isPending: isSigninIn } =
    useSignInAccount();

  const checkAuthUser = useAuthStore((state) => state.checkAuthUser);
  const navigate = useNavigate();

  // Define our form
  const form = useForm<z.infer<typeof signupValidation>>({
    resolver: zodResolver(signupValidation),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  });

  // On submit form handler
  const onSubmit = async (values: z.infer<typeof signupValidation>) => {
    try {
      const newUser = await createUserAccount(values);

      if (!newUser) {
        return toast.error('Sign up failed! Please try again.');
      }

      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });

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
        const isLoggedIn = await checkAuthUser();
        if (isLoggedIn) {
          navigate('/');
          return;
        }
      }

      if (message.includes('already exists')) {
        toast.error('Email already registered. Please try signing in instead.');
      } else {
        toast.error(message || 'Sign up failed! Please try again.');
      }
    }
  };

  return (
    <Form {...form}>
      <div className='w-full sm:w-420 flex-center flex-col'>
        <img src='/assets/images/logov4.svg' alt='logo' />
        <h2 className='h3-bold md:h2-bold pt-5 sm:pt-12'>
          Create a new account
        </h2>
        <p className='text-light-3 small-medium md:base-regular mt-2'>
          To use Snaply, please enter your details
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-5 w-full mt-4'
        >
          {/* Field 1 — name  */}
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type='text' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Field 2 — username  */}
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input type='text' className='shad-input' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Field 3 — email  */}
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

          {/* Field 4 — password  */}
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
            disabled={isCreatingUser || isSigninIn}
          >
            {isCreatingUser || isSigninIn ? (
              <div className='flex-center gap-2'>
                <Loader /> Loading...
              </div>
            ) : (
              'Sign Up'
            )}
          </Button>

          <p className='text-small-regular text-light-2 text-center mt-2 '>
            Already have an account?
            <Link
              to='/sign-in'
              className='text-primary-500 text-small-semibold ml-1.5'
            >
              Login in
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignupForm;
