import { useState } from "react";
import { IconMoodSmile } from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { EMOJI_PRESETS } from "@/data/seed";

interface EmojiPickerProps {
  emoji: string | null;
  onSelect: (emoji: string) => void;
  isHovered: boolean;
}

export function EmojiPicker({
  emoji,
  onSelect,
  isHovered,
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (e: string) => {
    onSelect(e);
    setOpen(false);
  };

  const grid = (
    <PopoverContent className="w-[340px] p-2" align="start">
      <div className="grid grid-cols-10 gap-1">
        {EMOJI_PRESETS.map((e) => (
          <Button
            key={e}
            variant="ghost"
            size="icon-sm"
            onClick={() => handleSelect(e)}
            className="text-lg"
          >
            {e}
          </Button>
        ))}
      </div>
    </PopoverContent>
  );

  if (emoji) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="h-auto p-0 text-5xl leading-none hover:bg-transparent hover:opacity-80">
            {emoji}
          </Button>
        </PopoverTrigger>
        {grid}
      </Popover>
    );
  }

  return (
    <div className={`transition-opacity duration-150 ${isHovered || open ? "opacity-100" : "opacity-0"}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            <IconMoodSmile className="size-4" />
            Add icon
          </Button>
        </PopoverTrigger>
        {grid}
      </Popover>
    </div>
  );
}
