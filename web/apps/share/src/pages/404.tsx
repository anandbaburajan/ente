import { CustomHeadShare } from "ente-base/components/Head";
import React from "react";
import { FileShareView } from "../components/file-share/FileShareView";

/**
 * 404 page that handles all share links
 *
 * Share links use the format /token#key (e.g., /tcGFnaEuXf#key...)
 *
 * This approach works because:
 * - Next.js dev server automatically serves this for unknown routes
 * - Static export generates 404.html
 * - _redirects (Cloudflare) and nginx serve 404.html with 200 status in production
 */
const NotFoundPage: React.FC = () => {
    return (
        <>
            <CustomHeadShare title="Ente Locker" />
            <FileShareView />
        </>
    );
};

export default NotFoundPage;
