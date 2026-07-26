const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");

admin.initializeApp();

exports.getFlavorRecommendation = onCall({
  cors: true,
  maxInstances: 10
}, async (request) => {
  const data = request.data;
  const cravingInput = data.cravingInput;
  const flavors = data.flavors;

  if (!cravingInput || !flavors) {
    throw new HttpsError('invalid-argument', 'Missing cravingInput or flavors');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No Gemini API key found in env vars");
    throw new HttpsError('internal', 'Server configuration error');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a helpful assistant for Kim's Boochery. 
The user says: "${cravingInput}"
Here is the list of available kombucha flavors:
${JSON.stringify(flavors, null, 2)}

Sort the flavors from best match to worst match based on the user's craving.
Return ONLY a valid JSON array of flavor IDs (strings). Do not include any markdown formatting or explanation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    const sortedIds = JSON.parse(text);
    return { sortedIds };
  } catch (err) {
    console.error("AI Recommendation Error:", err);
    throw new HttpsError('internal', 'Error generating recommendation');
  }
});

const Stripe = require("stripe");

exports.createStripeCheckoutSession = onCall({
  cors: true,
  maxInstances: 10
}, async (request) => {
  const data = request.data;
  const items = data.items;
  const successUrl = data.successUrl;
  const cancelUrl = data.cancelUrl;

  const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new HttpsError("internal", "Stripe API Secret Key is not configured on the server.");
  }

  const stripe = new Stripe(stripeKey);

  try {
    const lineItems = items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return { url: session.url, sessionId: session.id };
  } catch (err) {
    console.error("Stripe Session Error:", err);
    throw new HttpsError("internal", err.message || "Failed to create Stripe Checkout session");
  }
});
