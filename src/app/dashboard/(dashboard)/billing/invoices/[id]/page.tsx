import InvoiceDetail from './invoice-detail';

/**
 * Invoice detail.
 *
 * The id is validated HERE, in the server component, before the client one
 * mounts — otherwise `Number("abc")` is `NaN` and the page fires
 * `GET /client/billing/invoices/NaN`. Same guard the event detail page needed.
 */
export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const numeric = Number(id);

    if (!Number.isInteger(numeric) || numeric <= 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
                <p className="text-sm font-medium">Invoice not found</p>
                <p className="text-[12.5px] text-muted-foreground">
                    That is not a valid invoice link.
                </p>
            </div>
        );
    }

    return <InvoiceDetail invoiceId={numeric} />;
}
