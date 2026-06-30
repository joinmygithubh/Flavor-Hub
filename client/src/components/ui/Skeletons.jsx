/** Skeleton loaders shown while async content is fetching. */

export const DishCardSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="aspect-[4/3] animate-pulse bg-primary-100/70" />
    <div className="space-y-3 p-4">
      <div className="h-4 w-3/4 animate-pulse rounded bg-primary-100/70" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-primary-100/60" />
      <div className="flex justify-between pt-2">
        <div className="h-5 w-16 animate-pulse rounded bg-primary-100/70" />
        <div className="h-8 w-24 animate-pulse rounded-full bg-primary-100/70" />
      </div>
    </div>
  </div>
);

export const DishGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <DishCardSkeleton key={i} />
    ))}
  </div>
);

export const DetailSkeleton = () => (
  <div className="grid gap-8 lg:grid-cols-2">
    <div className="aspect-[4/3] animate-pulse rounded-2xl bg-primary-100/70" />
    <div className="space-y-4">
      <div className="h-8 w-2/3 animate-pulse rounded bg-primary-100/70" />
      <div className="h-4 w-full animate-pulse rounded bg-primary-100/60" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-primary-100/60" />
      <div className="h-10 w-1/3 animate-pulse rounded bg-primary-100/70" />
    </div>
  </div>
);
