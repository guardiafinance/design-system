import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarStatus,
  initials,
  type AvatarFallbackColor,
  type AvatarStatusType,
} from "@ds/components/avatar";

const SAMPLE_IMG =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&fit=crop";

export function SizesRow() {
  return (
    <>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Avatar size={size}>
            <AvatarImage src={SAMPLE_IMG} alt="Fernando" />
            <AvatarFallback>FS</AvatarFallback>
          </Avatar>
          <code className="text-[11px] text-muted-foreground">{size}</code>
        </div>
      ))}
    </>
  );
}

export function ShapesRow() {
  return (
    <>
      <Avatar size="lg" shape="circle">
        <AvatarFallback color="violet">FS</AvatarFallback>
      </Avatar>
      <Avatar size="lg" shape="square">
        <AvatarFallback color="orange">FS</AvatarFallback>
      </Avatar>
    </>
  );
}

export function ColorsRow() {
  const colors: AvatarFallbackColor[] = [
    "violet",
    "orange",
    "pink",
    "yellow",
    "green",
    "blue",
    "gray",
  ];
  return (
    <>
      {colors.map((c) => (
        <div key={c} className="flex flex-col items-center gap-2">
          <Avatar size="lg">
            <AvatarFallback color={c}>
              {c.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <code className="text-[11px] text-muted-foreground">{c}</code>
        </div>
      ))}
    </>
  );
}

export function StatusRow() {
  const statuses: AvatarStatusType[] = ["online", "offline", "busy", "away"];
  return (
    <>
      {statuses.map((s) => (
        <div key={s} className="flex flex-col items-center gap-2">
          <Avatar size="lg">
            <AvatarImage src={SAMPLE_IMG} alt="User" />
            <AvatarFallback>FS</AvatarFallback>
            <AvatarStatus status={s} />
          </Avatar>
          <code className="text-[11px] text-muted-foreground">{s}</code>
        </div>
      ))}
    </>
  );
}

export function FallbackInitials() {
  const people = [
    { name: "Ada Lovelace", color: "violet" as const },
    { name: "Alan Turing", color: "orange" as const },
    { name: "Grace Hopper", color: "pink" as const },
    { name: "Linus Torvalds", color: "green" as const },
  ];
  return (
    <>
      {people.map((p) => (
        <div key={p.name} className="flex flex-col items-center gap-2">
          <Avatar size="md">
            <AvatarFallback color={p.color}>
              {initials(p.name)}
            </AvatarFallback>
          </Avatar>
          <code className="text-[11px] text-muted-foreground">{p.name}</code>
        </div>
      ))}
    </>
  );
}

export function AvatarGroup() {
  return (
    <div className="flex -space-x-2">
      {[
        { initials: "FS", color: "violet" as const },
        { initials: "AL", color: "orange" as const },
        { initials: "GH", color: "pink" as const },
        { initials: "AT", color: "green" as const },
      ].map((p) => (
        <Avatar
          key={p.initials}
          size="md"
          className="ring-2 ring-background"
        >
          <AvatarFallback color={p.color}>{p.initials}</AvatarFallback>
        </Avatar>
      ))}
      <Avatar size="md" className="ring-2 ring-background">
        <AvatarFallback color="gray">+3</AvatarFallback>
      </Avatar>
    </div>
  );
}
