import path from 'path';
import fs from 'fs';
import type { Book } from '@/types';
import type { GetServerSidePropsContext } from 'next';
import BookCardAmazon from '@/components/BookCardAmazon';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params?.id;

  const filePath = path.join(process.cwd(), 'src/data/books.json');
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const books: Book[] = JSON.parse(jsonData);

  const book = books.find((book) => book.id === id);
  if (!book) return { notFound: true };

  const recommendBooks: Book[] = books
    .filter((book) => book.id !== id)
    .slice(0, 3);

  return {
    props: { book, recommendBooks },
  };
}

export default function BookDetail({
  book,
  recommendBooks,
}: {
  book: Book;
  recommendBooks: Book[];
}) {
  return (
    <div className='max-w-7xl mx-auto px-6 py-8'>
      <h1 className='text-3xl font-bold mb-8'>{book.title}</h1>
      <p className='text-gray-600 mb-4'>{book.author}</p>
      <p className='text-gray-600 mb-4'>¥{book.price.toLocaleString()}</p>
      <p className='text-gray-600 mb-4'>{book.description}</p>
      <button className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-8'>
        Add to Cart
      </button>
      {/* おすすめセクション */}
      {recommendBooks.length > 0 && (
        <>
          <h2 className='text-2xl font-bold mb-4'>おすすめの本</h2>
          <div className='grid grid-cols-3 gap-6'>
            {recommendBooks.map((book) => (
              <BookCardAmazon key={book.id} book={book} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
