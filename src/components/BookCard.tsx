import type { Book } from '@/types';

function BookCard({ book }: { book: Book }) {
  return (
    <div className='border rounded-lg overflow-hidden shadow-sm'>
      <div className='bg-gray-200 h-48 flex items-center justify-center'>
        <span className='text-gray-500'>No Image</span>
      </div>
      <div className='p-4'>
        <h2 className='text-lg font-bold'>{book.title}</h2>
        <p className='text-sm text-gray-600'>{book.author}</p>
        <p className='text-lg font-semibold text-blue-600'>
          ¥{book.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default BookCard;
