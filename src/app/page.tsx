import books from '@/data/books.json';
import type { Book } from '@/types';
import BookCard from '@/components/BookCard';
import BookCardAmazon from '@/components/BookCardAmazon';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='max-w-5xl mx-auto px-6 py-8 bg-gray-100'>
      <Link
        href='/sample'
        className='text-lg font-medium text-green-500 inline-block underline mb-8 hover:underline'
      >
        Pages RouterのSample Page
      </Link>
      <h1 className='text-3xl font-bold mb-8 bg-blue-500'>本の一覧</h1>

      {/* 通常の BookCard */}
      <section className='mb-12'>
        <h2 className='text-xl font-bold mb-4'>通常カード</h2>
        <div className='grid grid-cols-3 gap-6'>
          {books.map((book: Book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      <section>
        <h2 className='text-xl font-bold mb-4'>Amazon風カード</h2>
        <div className='grid grid-cols-3 gap-6'>
          {books.map((book: Book) => (
            <BookCardAmazon key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}
