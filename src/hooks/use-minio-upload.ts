import { useState } from "react";
import { getMinioUploadUrl, uploadFileToMinio } from "@/lib/minio-storage";
import { toast } from "sonner";

export function useMinioUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (
    file: File,
    projectId: string
  ): Promise<{ storageKey: string; bucket: string } | null> => {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("الملفات المدعومة هي مخططات PDF فقط");
      return null;
    }

    try {
      setIsUploading(true);
      setProgress(5);

      // 1. استخراج الرابط الموقّع
      const { uploadUrl, storageKey, bucket } = await getMinioUploadUrl(
        projectId,
        file.name,
        file.type
      );

      // 2. الرفع المباشر
      await uploadFileToMinio(uploadUrl, file, (p) => {
        setProgress(Math.max(5, p));
      });

      toast.success("تم رفع المخطط بنجاح إلى مخزن MinIO");
      return { storageKey, bucket };
    } catch (err: any) {
      toast.error(err.message || "فشل رفع الملف إلى المخزن");
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return { upload, isUploading, progress };
}
