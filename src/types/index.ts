import type { Models } from 'appwrite';

type Creator = {
  $id: string;
  name: string;
  username: string;
  imageUrl: string;
};

type Like = {
  $id: string;
  name: string;
  imageUrl: string;
};

type Save = {
  $id: string;
  user: string;
};

export type Post = Models.Document & {
  caption: string;
  location: string;
  tags: string[];
  imageUrl: string;
  imageId: string;
  likes: Like[]; // Array of userIds who liked the post
  save: Save[]; // Array of userIds who saved the post
  creator: Creator;
  post: string;
};

export type NewUser = {
  name: string;
  username: string;
  password: string;
  email: string;
};

export type User = Models.Document & {
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  posts: Post[];
};

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type UpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type NewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type UpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: string;
  file: File[];
  location?: string;
  tags?: string;
  creator: Creator;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};
