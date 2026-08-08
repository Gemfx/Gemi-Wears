export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { reference, expectedAmount } = req.body;

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

    // Paystack amounts are in kobo.
    const paidAmount = Number(transaction.amount);
    const requiredAmount = Number(expectedAmount);

    // Make sure the payment was successful.
    if (transaction.status !== "success") {
      return res.status(400).json({
        success: false,
        message: "Payment was not successful"
      });
    }

    // Make sure the currency is correct.
    if (transaction.currency !== "NGN") {
      return res.status(400).json({
        success: false,
        message: "Incorrect payment currency"
      });
    }

    // Make sure the customer paid the exact amount.
    if (paidAmount !== requiredAmount) {
      return res.status(400).json({
        success: false,
        message: "Payment amount does not match the order total"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
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
