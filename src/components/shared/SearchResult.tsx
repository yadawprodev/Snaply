import type { Post } from '@/types';

import Loader from './Loader';
import GridPostList from './GridPostList';
import type { Models } from 'appwrite';

type searchResultsProps = {
  isSearching: boolean;
  searchedPosts: Models.DocumentList<Post> | undefined;
};

const SearchResult = ({ isSearching, searchedPosts }: searchResultsProps) => {
  if (isSearching) return <Loader />;

  if (searchedPosts && searchedPosts.documents.length > 0) {
    return <GridPostList posts={searchedPosts.documents} />;
  }

  return (
    <p className='text-center w-full text-light-4 mt-10'>No results found.</p>
  );
};

export default SearchResult;
