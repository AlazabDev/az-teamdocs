import React, { useState, useRef } from "react";
import { UploadCloud, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMinioUpload } from "@/hooks/use-minio-upload";

interface DrawingUploaderProps {
  projectId: string;
  onUploaded: (fileData: { storageKey: string; fileName: string; fileSize: number }) => void;
}

export function DrawingUploader({ projectId, onUploaded }: DrawingUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, isUploading, progress } = useMinioUpload();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = async (file: File) => {
    const result = await upload(file, projectId);
    if (result) {
      onUploaded({
        storageKey: result.storageKey,
        fileName: file.name,
        fileSize: file.size,
      });
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
      }}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        isDragOver ? "border-primary bg-primary/5" : "border-border bg-card"
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />

      <div className="flex flex-col items-center justify-center gap-3">
        <div className="p-4 bg-muted rounded-full text-primary">
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        <div>
          <h3 className="font-semibold text-lg text-foreground">
            رفع المخطط الهندسي (PDF)
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            اسحب المخطط هنا أو اختره من جهازك للرفع المباشر إلى مخزن MinIO
          </p>
        </div>

        {isUploading && (
          <div className="w-full max-w-xs mt-3 space-y-1">
            <Progress value={progress} className="h-2" />
            <span className="text-xs text-muted-foreground">جاري الرفع... {progress}%</span>
          </div>
        )}

        <Button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="mt-2"
        >
          {isUploading ? "جاري الرفع..." : "اختر ملف PDF"}
        </Button>
      </div>
    </div>
  );
}
