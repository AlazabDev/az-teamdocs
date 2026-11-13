import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DocThumbnailProps {
  children?: React.ReactNode;
  author?: {
    full_name: string;
    initials: string;
    avatar_url: string | null;
  };
}

export function DocThumbnail({ children, author }: DocThumbnailProps) {
  return (
    <div className="relative shrink-0">
      <div
        className="aspect-[1/1.414] w-10 overflow-hidden rounded-md"
        style={{
          backgroundColor: "#fff",
          boxShadow:
            "rgba(0, 0, 0, 0.02) 0px 0px 2px 0px, rgba(0, 0, 0, 0.04) 0px 4px 12px 0px, rgba(0, 0, 0, 0.08) 0 0 0 0.5px",
        }}
      >
        {children}
      </div>
      {author && (
        <Avatar className="absolute bottom-0.5 right-0.5 size-4 border border-white">
          {author.avatar_url && (
            <AvatarImage src={author.avatar_url} alt={author.full_name} />
          )}
          <AvatarFallback className="text-[8px]">
            {author.initials}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
