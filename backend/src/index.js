// backend/src/index.js
// Cloudflare Worker Backend for GreenTrack Platform
// Handles Carbon Estimation, Waste Classification, and Market Orders.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // Standard CORS headers for mobile and web frontend
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const body = method === "POST" ? await request.json() : {};

      // --- Carbon Estimation ---
      if (url.pathname === "/api/carbon/estimate") {
        const { type, params } = body;
        let co2e = 0;
        if (type === 'travel') co2e = (parseFloat(params.distance) || 0) * 0.12;
        else if (type === 'food') co2e = (params.mealType === 'beef' ? 5 : 0.8) * (parseInt(params.servings) || 1);
        else if (type === 'energy') co2e = (parseFloat(params.kwh) || 0) * 0.4;
        else if (type === 'flight') co2e = (parseFloat(params.hours) || 1) * 90;
        
        return new Response(JSON.stringify({ kg_co2e: co2e, success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // --- Carbon AI Suggestions ---
      if (url.pathname === "/api/carbon/suggest") {
        const tips = [
          "Carpool to work tomorrow and save up to 2 kg of CO2.",
          "Eat a plant-based meal today to cut your footprint by 3 kg.",
          "Turn off standby appliances to save energy."
        ];
        return new Response(JSON.stringify({ tips, success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // --- Waste Classification ---
      if (url.pathname === "/api/waste/classify") {
        const categories = ["Dry Waste", "Wet Waste", "Recyclable", "Hazardous"];
        const bestMatch = categories[Math.floor(Math.random() * categories.length)];
        return new Response(JSON.stringify({ 
          label: bestMatch, 
          confidence: (Math.random() * 0.4 + 0.6).toFixed(2), 
          success: true 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // --- Market Order Mock ---
      if (url.pathname === "/api/market/order") {
        return new Response(JSON.stringify({ 
          orderId: `cl_order_${Math.random().toString(36).substr(2, 9)}`, 
          success: true 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Default Health Check
      return new Response(JSON.stringify({ status: "GreenTrack API Online", timestamp: new Date().toISOString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
