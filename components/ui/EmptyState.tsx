import { Card } from "./Card";

export function EmptyState({ title = "Nothing here yet", description }: { title?: string; description?: string }) {
  return (
    <Card className="p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-2xl">✦</div>
      <h2 className="mt-5 text-xl font-black text-slate-950">{title}</h2>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p> : null}
    </Card>
  );
}