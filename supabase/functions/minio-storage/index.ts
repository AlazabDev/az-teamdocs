import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const endpoint = Deno.env.get("MINIO_ENDPOINT_URL");
const accessKeyId = Deno.env.get("MINIO_ACCESS_KEY");
const secretAccessKey = Deno.env.get("MINIO_SECRET_KEY");
const bucketName = Deno.env.get("MINIO_BUCKET_NAME") || "construction-drawings";
const region = Deno.env.get("MINIO_REGION") || "us-east-1";

const s3Client = new S3Client({
  endpoint: endpoint?.endsWith("/") ? endpoint.slice(0, -1) : endpoint,
  region: region,
  credentials: {
    accessKeyId: accessKeyId ?? "",
    secretAccessKey: secretAccessKey ?? "",
  },
  forcePathStyle: true,
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "غير مصرح: يجب تسجيل الدخول" }),
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

    const { action, projectId, fileName, fileKey, contentType } = await req.json();

    // 1. توليد رابط رفع موقّع
    if (action === "get-upload-url") {
      if (!projectId || !fileName) {
        return new Response(
          JSON.stringify({ error: "معرف المشروع واسم الملف مطلوبان" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storageKey = `projects/${projectId}/${Date.now()}-${cleanFileName}`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: storageKey,
        ContentType: contentType || "application/pdf",
        Metadata: {
          "user-id": user.id,
          "project-id": projectId,
        },
      });

      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

      return new Response(
        JSON.stringify({ uploadUrl, storageKey, bucket: bucketName }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. توليد رابط معاينة/تنزيل موقّع
    if (action === "get-view-url") {
      if (!fileKey) {
        return new Response(
          JSON.stringify({ error: "مسار الملف مطلوب" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      });

      const viewUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      return new Response(
        JSON.stringify({ viewUrl }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. حذف ملف من المخزن
    if (action === "delete-file") {
      if (!fileKey) {
        return new Response(
          JSON.stringify({ error: "مسار الملف مطلوب للحذف" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      });

      await s3Client.send(command);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "العملية غير معروفة" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "فشل الاتصال بمخزن MinIO" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
