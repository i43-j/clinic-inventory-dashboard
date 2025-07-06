import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
}

// Method mapping for n8n webhooks - all set to POST as requested
const WEBHOOK_METHOD_MAP: Record<string, string> = {
  "ocr-process": "POST",
  "log-batch": "POST", 
  "get-products": "POST",
  "get-batches": "POST",
  "get-stock-levels": "POST",
  "view-stock": "POST",
  "view-expiry": "POST", 
  "update-stock": "POST",
  "add-product": "POST",
  "dashboard-stats": "POST"
}

serve(async (req) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Incoming request: ${req.method} ${req.url}`);

  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const endpoint = url.searchParams.get("endpoint")
    
    console.log(`Requested endpoint: ${endpoint}`);
    
    if (!endpoint) {
      console.error("Missing endpoint parameter");
      return new Response(
        JSON.stringify({ error: "Missing endpoint parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Construct n8n webhook URL
    const n8nUrl = `https://i43-j.app.n8n.cloud/webhook/${endpoint}`;
    console.log(`Target n8n URL: ${n8nUrl}`);

    // Get the HTTP method to use for this endpoint
    const targetMethod = WEBHOOK_METHOD_MAP[endpoint] || "POST";
    console.log(`Using HTTP method: ${targetMethod} (frontend sent: ${req.method})`);

    // Clone and clean headers
    const headers = new Headers(req.headers)
    const originalHeaders = Array.from(headers.entries());
    
    headers.delete("authorization")
    headers.delete("cookie")
    headers.delete("x-client-info")
    headers.delete("apikey")
    headers.delete("sec-fetch-mode")
    headers.delete("sec-fetch-site")
    headers.delete("sec-fetch-dest")
    headers.delete("referer")
    headers.delete("origin")
    headers.delete("host")

    const cleanedHeaders = Array.from(headers.entries());
    console.log(`Original headers count: ${originalHeaders.length}, Cleaned headers count: ${cleanedHeaders.length}`);

    // Handle request body properly
    let body = null;
    const contentType = req.headers.get("content-type");
    console.log(`Content-Type: ${contentType}`);

    if (req.method !== "GET") {
      if (contentType && contentType.includes("multipart/form-data")) {
        console.log("Processing multipart/form-data (file upload)");
        body = await req.formData();
      } else if (contentType && contentType.includes("application/json")) {
        console.log("Processing JSON payload");
        const textBody = await req.text();
        console.log(`Request body length: ${textBody.length} characters`);
        body = textBody;
      } else {
        console.log("Processing text payload");
        body = await req.text();
      }
    } else {
      console.log("GET request - no body to process");
    }

    console.log(`Forwarding request to n8n...`);
    const forwardedRequest = new Request(n8nUrl, {
      method: targetMethod,
      headers,
      body,
    });

    // Fetch from n8n with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(forwardedRequest, { 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    console.log(`n8n response: ${response.status} ${response.statusText} (${responseTime}ms)`);
    
    const responseData = await response.text();
    console.log(`Response data length: ${responseData.length} characters`);

    // Return response to client
    const finalResponse = new Response(responseData, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("Content-Type") || "application/json"
      }
    });

    console.log(`Request completed successfully in ${responseTime}ms`);
    return finalResponse;

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`Proxy request failed after ${responseTime}ms:`, error);
    
    let errorMessage = "Unknown error";
    let statusCode = 500;

    if (error.name === "AbortError") {
      errorMessage = "Request timeout - n8n took too long to respond";
      statusCode = 504;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({ 
        error: "Proxy request failed", 
        details: errorMessage,
        timestamp: new Date().toISOString()
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})
