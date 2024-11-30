import { auth } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { Customers, Invoices } from "@/db/schema";
import Invoice from "./invoice";

// If you're using Next.js App Directory with dynamic routing
interface InvoicePageProps {
  params: { invoiceId: string };
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { userId, orgId } = auth();

  if (!userId) return;

  const invoiceId = Number.parseInt(params.invoiceId);

  if (Number.isNaN(invoiceId)) {
    throw new Error("Invalid Invoice ID");
  }

  // Fetching invoices and customers
  const [result]: Array<{
    invoices: typeof Invoices.$inferSelect;
    customers: typeof Customers.$inferSelect;
  }> = await db
    .select()
    .from(Invoices)
    .innerJoin(Customers, eq(Invoices.customerId, Customers.id))
    .limit(1);

  if (!result) {
    notFound();
  }

  const invoice = {
    ...result.invoices,
    customer: result.customers,
  };

  return <Invoice invoice={invoice} />;
}
