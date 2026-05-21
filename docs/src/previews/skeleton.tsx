import { Skeleton } from "@ds/components/skeleton";

export function VariantsRow() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Text (default)
        </p>
        <Skeleton />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Title
        </p>
        <Skeleton variant="title" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Rect
        </p>
        <Skeleton variant="rect" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Circle
        </p>
        <Skeleton variant="circle" />
      </div>
    </div>
  );
}

export function ParagraphRow() {
  return (
    <div className="w-full max-w-md">
      <Skeleton variant="text" lines={4} />
    </div>
  );
}

export function ProfileRow() {
  return (
    <div className="flex w-full max-w-md items-center gap-3">
      <Skeleton variant="circle" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="70%" />
      </div>
    </div>
  );
}

export function CardRow() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <Skeleton variant="rect" />
      <Skeleton variant="title" />
      <Skeleton variant="text" lines={3} />
    </div>
  );
}

export function CustomDimensionsRow() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Skeleton width={320} height={48} />
      <Skeleton width="80%" height={20} />
      <Skeleton width={120} height={120} className="rounded-2xl" />
    </div>
  );
}

export function ListLoadingRow() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="flex w-full max-w-md flex-col gap-3 rounded-lg border border-border bg-card p-4"
    >
      <span className="sr-only">Carregando lista de transações…</span>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3">
            <Skeleton variant="circle" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="35%" />
            </div>
          </div>
          <Skeleton variant="text" width={80} />
        </div>
      ))}
    </div>
  );
}
