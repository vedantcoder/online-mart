const Stripe = require("stripe");

const stripeKey =
  "sk_test_51SWZf45h7vkRUcvYTiGQmtXxhpyCEvoiSr5SwyFbMogKbD2LrPilnQDVzg2ol3KXKlDiA6Vm9mNbEtnrYbGsQoFS00XxLAkv6w";

async function testStripe() {
  try {
    console.log("Initializing Stripe...");
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-11-17.clover",
    });

    console.log("Creating PaymentIntent...");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: "inr",
      payment_method_types: ["card"],
    });

    console.log("Success! PaymentIntent created:", paymentIntent.id);
  } catch (error) {
    console.error("Stripe Error:", error.message);
  }
}

testStripe();
