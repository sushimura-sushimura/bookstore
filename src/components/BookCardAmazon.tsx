import type { Book } from '@/types';

function BookCardAmazon({ book }: { book: Book }) {
  return (
    <div className='bg-white border border-gray-200 rounded p-4 shadow-sm'>
      {/* バッジ（ベストセラーなど） */}
      <div className='mb-2'>
        <span className='text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded'>
          ベストセラー
        </span>
      </div>

      {/* 画像エリア */}
      <div className='bg-gray-100 h-48 grid place-items-center mb-4 rounded'>
        <span className='text-gray-500 text-sm'>No Image</span>
      </div>

      {/* タイトル */}
      <h2 className='text-sm font-medium text-gray-900 line-clamp-2 mb-1'>
        {book.title}
      </h2>

      {/* 著者 */}
      <p className='text-xs text-gray-600 mb-2'>{book.author}</p>

      {/* 評価（プレースホルダー） */}
      <div className='flex items-center gap-1 mb-2'>
        <span className='text-amber-500 text-xs'>★★★★☆</span>
        <span className='text-xs text-gray-500'>(0)</span>
      </div>

      {/* 価格 */}
      <p className='text-base font-bold text-gray-900 mb-3'>
        ¥{book.price.toLocaleString()}
      </p>

      {/* カートボタン（プレースホルダー） */}
      <button
        type='submit'
        className='w-full bg-amber-400 hover:bg-amber-500 text-gray-900 text-sm font-medium py-2 px-4 rounded'
      >
        カートに入れる
      </button>
    </div>
  );
}

export default BookCardAmazon;
