import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Stripe webhook placeholder — activate when LLC + Stripe account ready.
 * Set STRIPE_WEBHOOK_SECRET and verify signature in production.
 *
 * Expected events: checkout.session.completed
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 503 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase service role not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const eventType = body?.type as string | undefined;

    if (eventType === "checkout.session.completed") {
      const session = body.data?.object;
      const email =
        session?.customer_details?.email ?? session?.customer_email ?? null;
      const customerId = session?.customer ?? session?.id;

      if (email) {
        const supabase = createClient(supabaseUrl, serviceKey);
        await supabase.from("enrollments").insert({
          user_email: email,
          product_id: "super-bundle",
          plan: "bundle",
          status: "active",
          premium_granted: true,
          provider: "stripe",
          external_id: String(customerId),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Stripe webhook error:", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
