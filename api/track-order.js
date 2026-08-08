export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const orderId = String(req.query.orderId || "")
      .trim()
      .toUpperCase();

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }

    if (!process.env.SUPABASE_URL) {
      return res.status(500).json({
        success: false,
        message: "Supabase configuration is missing"
      });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        success: false,
        message: "Supabase configuration is missing"
      });
    }

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/orders?order_id=eq.${encodeURIComponent(
        orderId
      )}&select=order_id,status,amount,currency,delivery_method,items,created_at,updated_at`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization:
            `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    const orders = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        message: "Unable to search for order"
      });
    }

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: orders[0]
    });

  } catch (error) {
    console.error("Tracking error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to track order"
    });
  }
}
