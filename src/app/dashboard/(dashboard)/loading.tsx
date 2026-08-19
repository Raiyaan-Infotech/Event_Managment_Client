import { PageLoader } from "@/components/common/page-loader";

/**
 * Route-transition loader for EVERY page under the dashboard.
 *
 * Next renders this automatically while a route's code and server work resolve,
 * so a new page is covered without adding anything to it. This is the half of
 * the global rule that GlobalLoader cannot see — at this point the page's
 * components have not mounted, so no query exists to report as fetching.
 */
export default function DashboardLoading() {
    return <PageLoader text="Loading..." />;
}
