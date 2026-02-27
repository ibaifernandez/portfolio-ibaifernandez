<?php
declare(strict_types=1);

/**
 * Copy this file to config/secrets.local.php (gitignored) and fill values.
 * You can also place this file outside public root and point to it with:
 * PORTFOLIO_SECRET_FILE=/absolute/path/to/secrets.local.php
 */
return [
    "PORTFOLIO_CAPTCHA_PROVIDER" => "turnstile",
    "PORTFOLIO_CAPTCHA_SECRET" => "replace-with-turnstile-secret"
];
