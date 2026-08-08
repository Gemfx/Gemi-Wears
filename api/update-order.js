export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const {
      orderId,
      status,
      adminKey
    } = req.body;

    if (!process.env.ORDER_ADMIN_KEY) {
      return res.status(500).json({
        success: false,
        message: "Admin key is not configured"
      });
    }

    if (adminKey !== process.env.ORDER_ADMIN_KEY) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const allowedStatuses = [
      "processing",
      "shipped",
      "in_transit",
      "out_for_delivery",
      "delivered"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }

    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/orders?order_id=eq.${encodeURIComponent(
        orderId
      )}`,
      {
        method: "PATCH",

        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,

          Authorization:
            `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,

          "Content-Type": "application/json",

          Prefer: "return=representation"
        },

        body: JSON.stringify({
          status,
          updated_at: new Date().toISOString()
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        message: "Unable to update order"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: result
    });

  } catch (error) {
    console.error("Order update error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update order"
    });
  }
}
