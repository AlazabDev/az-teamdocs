import { useState } from "react";
import { IconPhoto } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { COVER_IMAGE_PRESETS } from "@/data/seed";

interface CoverImagePickerProps {
  coverUrl: string | null;
  onSelect: (url: string) => void;
  isHovered: boolean;
}

export function CoverImagePicker({
  coverUrl,
  onSelect,
  isHovered,
}: CoverImagePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (url: string) => {
    onSelect(url);
    setOpen(false);
  };

  const grid = (
    <PopoverContent className="w-[320px] p-2" align="start">
      <div className="grid grid-cols-3 gap-2">
        {COVER_IMAGE_PRESETS.map((url) => (
          <Button
            key={url}
            variant="ghost"
            onClick={() => handleSelect(url)}
            className="h-auto overflow-hidden rounded-lg border border-border p-0 transition-colors hover:border-foreground"
          >
            <img
              src={url}
              alt="Cover preset"
              className="h-16 w-full object-cover"
            />
          </Button>
        ))}
      </div>
    </PopoverContent>
  );

  if (coverUrl) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <div className="group/cover relative overflow-hidden rounded-t-2xl">
          <img
            src={coverUrl}
            alt="Document cover"
            className="h-[200px] w-full object-cover"
          />
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="absolute inset-0 h-auto rounded-none bg-black/40 text-sm font-medium text-white opacity-0 transition-opacity hover:bg-black/50 hover:text-white group-hover/cover:opacity-100"
            >
              Change cover
            </Button>
          </PopoverTrigger>
        </div>
        {grid}
      </Popover>
    );
  }

  return (
    <div className={`transition-opacity duration-150 ${isHovered || open ? "opacity-100" : "opacity-0"}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            <IconPhoto className="size-4" />
            Add cover
          </Button>
        </PopoverTrigger>
        {grid}
      </Popover>
    </div>
  );
}
