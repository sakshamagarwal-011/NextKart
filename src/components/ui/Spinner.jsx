export default function Spinner({ size = 'md' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${sizes[size]} animate-spin rounded-full border-3 border-dark-200 border-t-primary-500 dark:border-dark-700 dark:border-t-primary-400`} />
    </div>
  );
}
