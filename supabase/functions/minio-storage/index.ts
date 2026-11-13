import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand, GetObjectCommand } from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

// قراءة بيانات الاتصال بمخزن MinIO من الـ Secrets المحفوظة
const endpoint = Deno.env.get("MINIO_ENDPOINT_URL");
const accessKeyId = Deno.env.get("MINIO_ACCESS_KEY");
const secretAccessKey = Deno.env.get("MINIO_SECRET_KEY");
const bucketName = Deno.env.get("MINIO_BUCKET_NAME") || "construction-drawings";
const region = Deno.env.get("MINIO_REGION") || "us-east-1";

// تهيئة عميل S3 المتوافق مع MinIO
const s3Client = new S3Client({
  endpoint: endpoint?.endsWith("/") ? endpoint.slice(0, -1) : endpoint,
  region: region,
  credentials: {
    accessKeyId: accessKeyId ?? "",
    secretAccessKey: secretAccessKey ?? "",
  },
  forcePathStyle: true, // ضروري جداً لـ MinIO للتعامل مع الـ Buckets كمسارات (/bucket-name/file)
});

serve(async (req) => {
  // معالجة طلبات فحص CORS المسبقة
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. التحقق من توثيق وصلاحية المستخدم عبر Supabase Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "غير مصرح: يرجى تسجيل الدخول أولاً" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "جلسة العمل غير صالحة" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. قراءة بيانات الطلب (نوع العملية والملف)
    const { action, projectId, fileName, fileKey, contentType } = await req.json();

    // ----------------------------------------------------
    // الحالة أ: توليد رابط رفع موقّع مسبقاً (Upload Presigned URL)
    // ----------------------------------------------------
    if (action === "get-upload-url") {
      if (!projectId || !fileName) {
        return new Response(
          JSON.stringify({ error: "رقم المشروع واسم الملف مطلوبان" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // توليد مسار منظم للملف: projects/{projectId}/drawings/{timestamp}-{fileName}
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storageKey = `projects/${projectId}/drawings/${Date.now()}-${sanitizedName}`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: storageKey,
        ContentType: contentType || "application/pdf",
        Metadata: {
          "uploaded-by": user.id,
          "project-id": projectId,
        },
      });

      // الرابط صالح لمدة 15 دقيقة فقط لإتمام عملية الرفع
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

      return new Response(
        JSON.stringify({
          uploadUrl,
          storageKey,
          bucket: bucketName,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ----------------------------------------------------
    // الحالة ب: توليد رابط عرض/تنزيل موقّع مسبقاً (View/Download URL)
    // ----------------------------------------------------
    if (action === "get-view-url") {
      if (!fileKey) {
        return new Response(
          JSON.stringify({ error: "مسار الملف (fileKey) مطلوب" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      });

      // الرابط صالح لمدة 30 دقيقة للمعاينة
      const viewUrl = await getSignedUrl(s3Client, command, { expiresIn: 1800 });

      return new Response(
        JSON.stringify({ viewUrl }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "نوع العملية غير مدعوم" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "حدث خطأ غير متوقع أثناء الاتصال بمخزن MinIO" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
