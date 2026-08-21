import { GuestForm } from "../_components/guest-form";

/**
 * Add Guest. The form lives in `_components/guest-form.tsx` because the edit
 * route renders the identical fields — two copies is how a field added to one
 * goes missing from the other.
 */
export default function AddGuestPage() {
    return <GuestForm />;
}
