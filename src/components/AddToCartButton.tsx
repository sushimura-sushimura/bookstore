'use client';

export default function AddToCartButton() {
  return (
    <button
      onClick={(e) => e.stopPropagation()}
      className='w-full bg-amber-400 hover:bg-amber-500 text-gray-900 text-base font-medium py-2 px-4 rounded'
    >
      カートに入れる
    </button>
  );
}
