import { apiBaseUrl, __prod__ } from "../lib/constants";

import redirect from "nextjs-redirect";
export default redirect(`${apiBaseUrl}/auth/discord`);
