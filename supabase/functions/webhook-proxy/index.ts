import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const endpoint = url.searchParams.get("endpoint")
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "Missing endpoint parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    // Construct n8n webhook URL
    const n8nUrl = `https://i43-j.app.n8n.cloud/webhook/${endpoint}`

    // Clone and clean headers
    const headers = new Headers(req.headers)
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

    // Build the proxied request
    const forwardedRequest = new Request(n8nUrl, {
      method: req.method,
      headers,
      body: req.method !== "GET" ? await req.text() : undefined,
    })

    // Fetch from n8n
    const response = await fetch(forwardedRequest)
    const responseData = await response.text()

    // Return response to client
    return new Response(responseData, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("Content-Type") || "application/json"
      }
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Proxy request failed", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }
})
