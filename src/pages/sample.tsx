import path from 'path';
import fs from 'fs';
import React from 'react';
import type { Book } from '@/types';
import BookCardAmazon from '@/components/BookCardAmazon';
import Link from 'next/link';

export async function getServerSideProps() {
  const filePath = path.join(process.cwd(), 'src/data/books.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const books = JSON.parse(jsonData);

  return {
    props: { books },
  };
}

export default function Sample({ books }: { books: Book[] }) {
  return (
    <div className='max-w-5xl mx-auto px-6 py-8 bg-gray-100'>
      <Link
        href='/'
        className='text-lg font-medium text-green-500 inline-block underline mb-8 hover:underline'
      >
        App RouterのBookCard
      </Link>
      <h1 className='text-3xl font-bold mb-8'>Pages Routerにおける本の一覧</h1>
      <div className='grid grid-cols-3 gap-6'>
        {books.map((book: Book) => (
          <BookCardAmazon key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
