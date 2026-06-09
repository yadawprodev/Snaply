import { AppwriteException, ID, Query, type Models } from 'appwrite';

import type {
  NewPost,
  NewUser,
  Post,
  UpdatePost,
  UpdateUser,
  User,
} from '@/types';

import { account, appwriteConfig, avatars, databases, storage } from './config';

// ============================================================
// AUTH
// ============================================================

// ====================== SIGN UP =======================
export const createUserAccount = async (user: NewUser) => {
  try {
    // Create users account
    const userAccount = await account.create({
      userId: ID.unique(),
      email: user.email,
      password: user.password,
      name: user.name,
    });

    if (!userAccount) throw new Error('User account creation failed');

    const avatarUrl = avatars.getInitials({
      name: user.name,
      width: 200,
      height: 200,
      background: '3b82f6',
    });

    // Save users account to database
    const savedUser = await databases.createDocument({
      documentId: ID.unique(),
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userTableId,
      data: {
        accountId: userAccount.$id,
        name: userAccount.name,
        email: userAccount.email,
        username: user.username,
        imageUrl: avatarUrl,
      },
    });

    return savedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ====================== SIGN IN ========================
export const signInAccount = async (user: {
  email: string;
  password: string;
}) => {
  // Appwrite verifies email and password and stores the session cookie in the browser
  try {
    const session = await account.createEmailPasswordSession({
      email: user.email,
      password: user.password,
    });
    return session;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ===================== SIGN OUT ==========================
export const signOutAccount = async () => {
  try {
    // Delete the current active session
    const session = await account.deleteSession('current');
    return session;
  } catch (error) {
    if (error instanceof AppwriteException && error.code === 401) {
      return null; // Session already cleared — treat as success
    }
    console.log(error);
    throw error;
  }
};

// ============================================================
// POSTS
// ============================================================

// ================= CREATE POST ==============================
export const createPost = async (post: NewPost) => {
  try {
    // 1 — Upload the file to Appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw new Error('File upload failed');

    // 2 — Get a public preview URL for the uploaded file
    const fileUrl = await getFilePreview(uploadedFile.$id);

    if (!fileUrl) {
      // If URL generation failed, delete the uploaded file and bail
      await deleteFile(uploadedFile.$id);

      throw new Error('Failed to get file URL');
    }

    // 3 — Convert tags string "Art, Learn, Fun" → ["Art", "Learn", "Fun"]
    const tags = post.tags?.split(',').map((tag: string) => tag.trim()) ?? [];

    // 4 — Save the post document to Appwrite database
    const newPost = await databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.postTableId,
      documentId: ID.unique(),
      data: {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags,
      },
    });

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ===================== GET FILE URL ========================
export const getFilePreview = async (fileId: string) => {
  try {
    // const fileUrl = storage.getFilePreview({
    //   bucketId: appwriteConfig.storageId,
    //   fileId: fileId,
    //   width: 2000,
    //   height: 2000,
    //   quality: 100,
    //   gravity: ImageGravity.Top,
    // });

    // No transformation params = no 403 error
    const fileUrl = storage.getFileView(appwriteConfig.storageId, fileId);

    return fileUrl;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ===================== UPLOAD FILE ========================
export const uploadFile = async (file: File) => {
  try {
    const uploadedFile = await storage.createFile({
      bucketId: appwriteConfig.storageId,
      fileId: ID.unique(),
      file: file,
    });

    return uploadedFile;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ===================== DELETE FILE ========================
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile({
      bucketId: appwriteConfig.storageId,
      fileId: fileId,
    });

    return { status: 'ok' };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ===================== GET POSTS ========================
export const getRecentPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postTableId,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(20),
        Query.select(['*', 'creator.*', 'likes.*', 'save.*']), // Populate user document and likes
      ],
    );

    if (!posts) throw new Error('Failed to fetch posts');

    return posts;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ===================== LIKE POST ========================
export const likePost = async (postId: string, usersId: string[]) => {
  try {
    const updatedPost = await databases.updateDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.postTableId,
      documentId: postId,
      data: {
        likes: usersId,
      },
    });

    if (!updatedPost) throw new Error('Failed to like post');

    return updatedPost;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ===================== SAVE POST ========================
export const savePost = async (postId: string, userId: string) => {
  try {
    const updatedPost = await databases.createDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.savesTableId,
      documentId: ID.unique(),
      data: {
        user: userId,
        post: postId,
      },
    });

    if (!updatedPost) throw new Error('Failed to save post');

    return updatedPost;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ===================== UNSAVE POST ========================
export const unsavePost = async (savedPostId: string) => {
  try {
    const statusCode = await databases.deleteDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.savesTableId,
      documentId: savedPostId,
    });

    if (!statusCode) throw new Error('Failed to delete saved post');

    return { status: 'ok' };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ===================== GET POST BY ID ========================
export const getPostById = async (postId: string) => {
  try {
    const post = await databases.getDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.postTableId,
      documentId: postId,
      queries: [Query.select(['*', 'creator.*', 'likes.*', 'save.*'])],
    });

    if (!post) throw new Error('Failed to fetch post');

    return post as unknown as Post;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ================ GET MULTIPLE POSTS BY IDS ==================
export const getPostsByIds = async (postIds: string[]) => {
  try {
    const posts = await databases.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.postTableId,
      queries: [
        Query.equal('$id', postIds),
        Query.select(['*', 'creator.*', 'likes.*', 'save.*']),
      ],
    });

    if (!posts) throw new Error('Failed to fetch posts');

    return posts.documents as unknown as Post[];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ================= UPDATE POST ==============================
export const updatePost = async (post: UpdatePost) => {
  const hasFileToUpdate = post.file && post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload the file to Appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);

      if (!uploadedFile) throw new Error('File upload failed');

      // Get a public preview URL for the uploaded file
      const fileUrl = await getFilePreview(uploadedFile.$id);

      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);

        throw new Error('Failed to get file URL');
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    const tags = post.tags?.split(',').map((tag: string) => tag.trim()) ?? [];

    // 4 — Save the post document to Appwrite database
    const updatedPost = await databases.updateDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.postTableId,
      documentId: post.postId,
      data: {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags,
      },
    });

    if (!updatedPost) {
      await deleteFile(post.imageId);
      throw Error;
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ================= DELETE POST ==============================
export const deletePost = async (postId: string, imageId: string) => {
  try {
    // Delete the post document from Appwrite database
    const statusCode = await databases.deleteDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.postTableId,
      documentId: postId,
    });

    if (!statusCode) throw new Error('Failed to delete post');

    // Delete the associated image file from Appwrite storage
    await deleteFile(imageId);

    return { status: 'ok' };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ================= GET INFINITE POSTS ========================
export const getInfintePosts = async ({
  pageParam,
}: {
  pageParam: string | null;
}) => {
  const queries: any[] = [
    Query.orderDesc('$createdAt'),
    Query.limit(10),
    Query.select(['*', 'creator.*', 'likes.*', 'save.*']), // Populate user document and likes
  ];

  if (pageParam) {
    // Appwrite uses cursor-based pagination, so we use the last document's ID as the cursor for the next page
    queries.push(Query.cursorAfter(pageParam));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postTableId,
      queries,
    );

    if (!posts) throw new Error('Failed to fetch posts');

    return posts;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ===================== SEARCH POSTS ========================
export const searchPosts = async (searchTerm: string) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postTableId,
      [
        Query.search('caption', searchTerm),
        Query.orderDesc('$createdAt'),
        Query.select(['*', 'creator.*', 'likes.*', 'save.*']),
      ],
    );

    if (!posts) throw new Error('Failed to search posts');

    return posts as unknown as Models.DocumentList<Post>;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ============================================================
// USER
// ============================================================

// ===================== GET USERS ========================
export const getUsers = async (limit?: number) => {
  const queries: any[] = [Query.orderAsc('$createdAt')];

  if (limit) {
    queries.push(Query.limit(limit), Query.select(['*'])); // Select all fields for the limited users
  }

  try {
    const users = await databases.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userTableId,
      queries,
    });

    if (!users) throw new Error('Failed to fetch users');

    return users;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ===================== GET USER BY ID ========================
export const getUserById = async (userId: string) => {
  try {
    const response = await databases.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userTableId,
      queries: [
        Query.equal('$id', userId),
        Query.select(['*', 'save.*', 'posts.*', 'liked.*']),
      ],
    });

    const user = response.documents[0];
    if (!user) throw new Error('Failed to fetch user');

    return user as unknown as User;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ==================== UPDATE USER ============================
export const updateUser = async (user: UpdateUser) => {
  const hasFileToUpdate = user.file && user.file.length > 0;

  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(user.file[0]);

      if (!uploadedFile) throw new Error('File upload failed');

      const fileUrl = await getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw new Error('Failed to get file URL');
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Update user document in Appwrite database
    const updatedUser = await databases.updateDocument({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userTableId,
      documentId: user.userId,
      data: {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      },
    });

    return updatedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ==================== GET CURRENT USER ============================
export const getCurrentUser = async () => {
  try {
    //  automatically reads the session cookie stored in the browser
    const currentAccount = await account.get();

    if (!currentAccount) throw new Error('Failed to get user account');

    const currentUser = await databases.listDocuments({
      databaseId: appwriteConfig.databaseId,
      collectionId: appwriteConfig.userTableId,
      queries: [
        Query.equal('accountId', currentAccount.$id),
        Query.select(['*', 'save.*', 'posts.*', 'liked.*']), // Populate saved posts and liked posts
      ],
    });

    if (!currentUser || currentUser.documents.length === 0)
      throw new Error('User not found !');

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    throw error;
  }
};
