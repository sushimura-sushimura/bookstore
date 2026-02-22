import books from '@/data/books.json';
import type { Book } from '@/types';
import BookCard from '@/components/BookCard';
import BookCardAmazon from '@/components/BookCardAmazon';

export default function Home() {
  return (
    <div className='max-w-5xl mx-auto px-6 py-8 bg-gray-100'>
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
    </div>
  );
}
