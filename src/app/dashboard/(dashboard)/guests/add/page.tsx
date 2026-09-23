import { GuestForm } from "../_components/guest-form";
import { GuestLimitGate } from "../_components/guest-limit-gate";

/**
 * Add Guest. The form lives in `_components/guest-form.tsx` because the edit
 * route renders the identical fields — two copies is how a field added to one
 * goes missing from the other.
 *
 * Gated like Create Event: once every event is at the plan's guest limit the
 * form does not open at all.
 */
export default function AddGuestPage() {
    return (
        <GuestLimitGate>
            <GuestForm />
        </GuestLimitGate>
    );
}
