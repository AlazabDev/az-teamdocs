import { supabase } from "@/integrations/supabase/client";

export interface PresignedUploadResult {
  uploadUrl: string;
  storageKey: string;
  bucket: string;
}

/**
 * طلب رابط رفع موقّع مسبقاً من مخزن MinIO
 */
export async function getMinioUploadUrl(
  projectId: string,
  fileName: string,
  contentType = "application/pdf"
): Promise<PresignedUploadResult> {
  const { data, error } = await supabase.functions.invoke("minio-storage", {
    body: {
      action: "get-upload-url",
      projectId,
      fileName,
      contentType,
    },
  });

  if (error || !data?.uploadUrl) {
    throw new Error(error?.message || "تعذر الحصول على رابط رفع الملف من خادم التخزين");
  }

  return data;
}

/**
 * رفع الملف مباشرة من المتصفح إلى MinIO مع تتبع نسبة الإنجاز
 */
export async function uploadFileToMinio(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/pdf");

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`فشل رفع الملف. رمز الحالة: ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("حدث خطأ في الشبكة أثناء رفع الملف إلى MinIO"));
    };

    xhr.send(file);
  });
}

/**
 * استخراج رابط عرض أو تحميل للمخطط صالح لفترة زمنية محددة
 */
export async function getMinioViewUrl(fileKey: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("minio-storage", {
    body: {
      action: "get-view-url",
      fileKey,
    },
  });

  if (error || !data?.viewUrl) {
    throw new Error(error?.message || "تعذر إنشاء رابط المعاينة");
  }

  return data.viewUrl;
}
