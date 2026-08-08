export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const {
      reference,
      expectedAmount,
      customer,
      items,
      deliveryMethod
    } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Transaction reference is required"
      });
    }

    if (!expectedAmount || Number(expectedAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Expected payment amount is required"
      });
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: "Paystack configuration is missing"
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
        message: "Supabase secret is missing"
      });
    }

    // Verify transaction with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const result = await response.json();

    if (!response.ok || !result.status || !result.data) {
      return res.status(400).json({
        success: false,
        message: result.message || "Unable to verify payment"
      });
    }

    const transaction = result.data;

    if (transaction.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment was not successful"
      });
    }

    if (transaction.currency !== "NGN") {
      return res.status(400).json({
        success: false,
        message: "Incorrect payment currency"
      });
    }

    const paidAmount = Number(transaction.amount);
    const requiredAmount = Number(expectedAmount);

    if (paidAmount !== requiredAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount does not match the order total"
      });
    }

    // Prevent duplicate order creation
    const existingResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/orders?paystack_reference=eq.${encodeURIComponent(
        transaction.reference
      )}&select=order_id`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    const existingOrders = await existingResponse.json();

    if (Array.isArray(existingOrders) && existingOrders.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Order already exists",
        data: {
          orderId: existingOrders[0].order_id,
          reference: transaction.reference
        }
      });
    }

    // Generate GEMI order ID
    const now = new Date();

    const date =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");

    const random = Math.floor(1000 + Math.random() * 9000);

    const orderId = `GEMI-${date}-${random}`;

    // Create order
    const order = {
      order_id: orderId,

      paystack_reference: transaction.reference,

      customer_name:
        customer?.name ||
        transaction.customer?.first_name ||
        "GEMI Customer",

      customer_email:
        customer?.email ||
        transaction.customer?.email ||
        "",

      phone:
        customer?.phone ||
        transaction.customer?.phone ||
        "",

      amount: paidAmount / 100,

      currency: transaction.currency,

      delivery_method:
        deliveryMethod || "Not specified",

      status: "processing",

      items: Array.isArray(items) ? items : []
    };

    const createResponse = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/orders`,
      {
        method: "POST",

        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,

          Authorization:
            `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,

          "Content-Type": "application/json",

          Prefer: "return=representation"
        },

        body: JSON.stringify(order)
      }
    );

    const createdOrder = await createResponse.json();

    if (!createResponse.ok) {
      console.error("Supabase error:", createdOrder);

      return res.status(500).json({
        success: false,
        message: "Payment verified but order could not be created"
      });
    }

    return res.status(200).json({
      success: true,

      message: "Payment verified and order created",

      data: {
        orderId,
        reference: transaction.reference,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status
      }
    });

  } catch (error) {
    console.error("Payment verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
}
