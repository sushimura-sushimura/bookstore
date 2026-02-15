import type { Book } from '@/types';

function BookCard({ book }: { book: Book }) {
  return (
    <div className='border-10 border-blue-200 rounded-lg overflow-hidden shadow-sm'>
      <div className='bg-gray-200 h-48 grid grid-cols-3 place-items-center'>
        <div className='text-gray-500'>No Image</div>
        <div className='text-font-bold'>No Image1</div>
        <div className='text-font-bold'>No Image1</div>
        <div className='text-font-bold'>No Image1</div>
        <div className='text-font-bold'>No Image1</div>
        <div className='text-font-bold'>No Image1</div>
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
