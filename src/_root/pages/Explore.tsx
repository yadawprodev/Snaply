import { useState, useEffect } from 'react';

import { Input } from '@/components/ui/input';

import {
  useGetPosts,
  useSearchPosts,
} from '@/lib/tanstack-query/queriesAndMutaions';

import GridPostList from '@/components/shared/GridPostList';
import SearchResult from '@/components/shared/SearchResult';

import useDebounce from '@/hooks/useDebounce';

import Loader from '@/components/shared/Loader';
import type { Post } from '@/types';
import { useInView } from 'react-intersection-observer';

const Explore = () => {
  const { ref, inView } = useInView();

  const [searchValue, setSearchValue] = useState('');

  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts();

  // Debounce the search value to prevent excessive API calls
  const debouncedValue = useDebounce(searchValue, 500);

  const { data: searchedPosts, isFetching: isSearching } =
    useSearchPosts(debouncedValue);

  useEffect(() => {
    if (inView && !searchValue) {
      fetchNextPage();
    }
  }, [inView, searchValue]);

  const shouldShowSearchResults = searchValue.trim() !== '';
  const shouldShowPosts =
    !shouldShowSearchResults &&
    posts?.pages.every((page) => page.documents.length === 0);

  if (!posts) {
    return (
      <div className='flex-center w-full h-full'>
        <Loader />
      </div>
    );
  }

  return (
    <div className='explore-container'>
      <div className='explore-inner_container'>
        <h2 className='h3-bold md:h2-bold w-full'>Search Posts</h2>
        <div className='flex gap-1 px-4 w-full rounded-lg bg-dark-4'>
          <img
            src='/assets/icons/search.svg'
            alt='Search'
            width={24}
            height={24}
          />
          <Input
            type='text'
            placeholder='Search posts...'
            className='explore-search'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      <div className='flex-between w-full max-w-5xl mt-16 mb-7'>
        <h3 className='body-bold md:h3-bold'>Popular Today</h3>
        <div className='flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer'>
          <p className='small-medium md:base-medium text-light-2'>All</p>
          <img
            src='/assets/icons/filter.svg'
            alt='Filter'
            width={20}
            height={20}
          />
        </div>
      </div>

      <div className='flex flex-wrap gap-9 w-full max-w-5xl'>
        {shouldShowSearchResults ? (
          <SearchResult
            isSearching={isSearching}
            searchedPosts={searchedPosts}
          />
        ) : shouldShowPosts ? (
          <p className='text-center w-full mt-10 text-light-4'>End of posts</p>
        ) : (
          posts?.pages.map((page, index) => (
            <GridPostList
              key={`page-${index}`}
              posts={page.documents as unknown as Post[]}
            />
          ))
        )}
      </div>

      {hasNextPage && !searchValue && (
        <div ref={ref} className='mt-10'>
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Explore;
