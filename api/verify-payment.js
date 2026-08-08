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

    const supabaseUrl =
      (process.env.SUPABASE_URL || "").replace(/\/+$/, "");

    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return res.status(500).json({
        success: false,
        message: "SUPABASE_URL is missing"
      });
    }

    if (!supabaseKey) {
      return res.status(500).json({
        success: false,
        message: "SUPABASE_SERVICE_ROLE_KEY is missing"
      });
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: "PAYSTACK_SECRET_KEY is missing"
      });
    }

    // -----------------------------
    // VERIFY PAYSTACK PAYMENT
    // -----------------------------

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization:
            `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const paystackResult =
      await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackResult.status ||
      !paystackResult.data
    ) {
      return res.status(400).json({
        success: false,
        message:
          paystackResult.message ||
          "Unable to verify payment"
      });
    }

    const transaction =
      paystackResult.data;

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

    const paidAmount =
      Number(transaction.amount);

    const requiredAmount =
      Number(expectedAmount);

    if (paidAmount !== requiredAmount) {
      return res.status(400).json({
        success: false,
        message:
          "Payment amount does not match order total"
      });
    }

    // -----------------------------
    // CHECK FOR DUPLICATE ORDER
    // -----------------------------

    const existingResponse =
      await fetch(
        `${supabaseUrl}/rest/v1/orders?paystack_reference=eq.${encodeURIComponent(
          transaction.reference
        )}&select=order_id`,
        {
          method: "GET",

          headers: {
            apikey: supabaseKey,
            Authorization:
              `Bearer ${supabaseKey}`
          }
        }
      );

    const existingOrders =
      await existingResponse.json();

    if (
      existingResponse.ok &&
      Array.isArray(existingOrders) &&
      existingOrders.length > 0
    ) {
      return res.status(200).json({
        success: true,
        message: "Order already exists",
        data: {
          orderId:
            existingOrders[0].order_id,

          reference:
            transaction.reference
        }
      });
    }

    // -----------------------------
    // GENERATE ORDER ID
    // -----------------------------

    const now = new Date();

    const date =
      now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0");

    const random =
      Math.floor(
        1000 + Math.random() * 9000
      );

    const orderId =
      `GEMI-${date}-${random}`;

    // -----------------------------
    // CREATE ORDER
    // -----------------------------

    const order = {
      order_id: orderId,

      paystack_reference:
        transaction.reference,

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

      amount:
        paidAmount / 100,

      currency:
        transaction.currency,

      delivery_method:
        deliveryMethod ||
        "Not specified",

      status:
        "processing",

      items:
        Array.isArray(items)
          ? items
          : []
    };

    console.log(
      "Creating GEMI order:",
      order
    );

    const createResponse =
      await fetch(
        `${supabaseUrl}/rest/v1/orders`,
        {
          method: "POST",

          headers: {
            apikey: supabaseKey,

            Authorization:
              `Bearer ${supabaseKey}`,

            "Content-Type":
              "application/json",

            Prefer:
              "return=representation"
          },

          body:
            JSON.stringify(order)
        }
      );

    const createdOrder =
      await createResponse.json();

    if (!createResponse.ok) {

      console.error(
        "SUPABASE ORDER CREATION ERROR:",
        {
          status:
            createResponse.status,

          response:
            createdOrder,

          supabaseUrl:
            supabaseUrl
        }
      );

      return res.status(500).json({
        success: false,

        message:
          "Payment verified but order could not be created",

        databaseError:
          createdOrder
      });
    }

    // -----------------------------
    // SUCCESS
    // -----------------------------

    return res.status(200).json({
      success: true,

      message:
        "Payment verified and order created",

      data: {
        orderId:
          orderId,

        reference:
          transaction.reference,

        amount:
          transaction.amount,

        currency:
          transaction.currency,

        status:
          "processing"
      }
    });

  } catch (error) {

    console.error(
      "Payment verification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Payment verification failed"
    });
  }
}
