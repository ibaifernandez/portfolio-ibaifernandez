<?php
declare(strict_types=1);

function sanitize_header_value(string $value): string {
    return trim(str_replace(["\r", "\n"], "", $value));
}

function sanitize_single_line(string $value, int $maxLength): string {
    $value = trim(str_replace(["\r", "\n"], " ", $value));
    if (function_exists("mb_substr")) {
        return mb_substr($value, 0, $maxLength);
    }

    return substr($value, 0, $maxLength);
}

function sanitize_multiline(string $value, int $maxLength): string {
    $value = trim(str_replace(["\r\n", "\r"], "\n", $value));
    if (function_exists("mb_substr")) {
        return mb_substr($value, 0, $maxLength);
    }

    return substr($value, 0, $maxLength);
}

function get_client_ip(): string {
    $candidates = [
        "HTTP_CF_CONNECTING_IP",
        "HTTP_X_FORWARDED_FOR",
        "REMOTE_ADDR"
    ];

    foreach ($candidates as $key) {
        if (!isset($_SERVER[$key])) {
            continue;
        }
        $raw = trim((string) $_SERVER[$key]);
        if ($raw === "") {
            continue;
        }
        $ip = trim(explode(",", $raw)[0]);
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }

    return "";
}

function should_enforce_captcha(string $provider, string $secret): bool {
    if ($secret === "") {
        return false;
    }
    return in_array($provider, ["recaptcha", "hcaptcha", "turnstile"], true);
}

function load_secret_overrides(): array {
    $candidates = [];

    $envFile = trim((string) (getenv("PORTFOLIO_SECRET_FILE") ?: ""));
    if ($envFile !== "") {
        $candidates[] = $envFile;
    }

    $homeDir = trim((string) ($_SERVER["HOME"] ?? getenv("HOME") ?? ""));
    if ($homeDir !== "") {
        $candidates[] = rtrim($homeDir, "/\\") . "/.config/portfolio-ibaifernandez/secrets.local.php";
    }

    // Local/dev fallback. Keep file gitignored.
    $candidates[] = __DIR__ . "/config/secrets.local.php";

    foreach ($candidates as $candidatePath) {
        if (!is_string($candidatePath) || trim($candidatePath) === "" || !is_readable($candidatePath)) {
            continue;
        }

        $loaded = require $candidatePath;
        if (is_array($loaded)) {
            return $loaded;
        }
    }

    return [];
}

function get_config_string(array $overrides, string $key, string $default = ""): string {
    if (array_key_exists($key, $overrides) && is_string($overrides[$key])) {
        return trim($overrides[$key]);
    }

    $fromEnv = getenv($key);
    if ($fromEnv === false) {
        return $default;
    }

    return trim((string) $fromEnv);
}

function verify_captcha_token(string $provider, string $secret, string $token, string $remoteIp): bool {
    if ($token === "" || $secret === "") {
        return false;
    }

    $verifyUrl = "";
    if ($provider === "hcaptcha") {
        $verifyUrl = "https://hcaptcha.com/siteverify";
    } elseif ($provider === "recaptcha") {
        $verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
    } elseif ($provider === "turnstile") {
        $verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    }

    if ($verifyUrl === "") {
        return false;
    }

    $payload = [
        "secret" => $secret,
        "response" => $token
    ];
    if ($remoteIp !== "") {
        $payload["remoteip"] = $remoteIp;
    }

    $context = stream_context_create([
        "http" => [
            "method" => "POST",
            "header" => "Content-Type: application/x-www-form-urlencoded\r\n",
            "content" => http_build_query($payload),
            "timeout" => 8
        ]
    ]);

    $response = @file_get_contents($verifyUrl, false, $context);
    if ($response === false) {
        return false;
    }

    $decoded = json_decode($response, true);
    if (!is_array($decoded) || empty($decoded["success"])) {
        return false;
    }

    $minScoreRaw = getenv("PORTFOLIO_CAPTCHA_MIN_SCORE");
    if ($provider === "recaptcha" && $minScoreRaw !== false && $minScoreRaw !== "" && isset($decoded["score"])) {
        $minScore = (float) $minScoreRaw;
        if (((float) $decoded["score"]) < $minScore) {
            return false;
        }
    }

    return true;
}

function enforce_ip_rate_limit(string $ip, int $windowSeconds, int $maxRequests, string $storePath): bool {
    if ($ip === "" || $windowSeconds <= 0 || $maxRequests <= 0) {
        return false;
    }

    $directory = dirname($storePath);
    if (!is_dir($directory) && !@mkdir($directory, 0755, true) && !is_dir($directory)) {
        return false;
    }

    $handle = @fopen($storePath, "c+");
    if ($handle === false) {
        return false;
    }

    $isLimited = false;
    $now = time();
    $cutoff = $now - $windowSeconds;

    if (flock($handle, LOCK_EX)) {
        $raw = stream_get_contents($handle);
        $data = [];
        if (is_string($raw) && trim($raw) !== "") {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $data = $decoded;
            }
        }

        foreach ($data as $key => $timestamps) {
            if (!is_array($timestamps)) {
                unset($data[$key]);
                continue;
            }

            $filtered = [];
            foreach ($timestamps as $timestamp) {
                $ts = (int) $timestamp;
                if ($ts >= $cutoff) {
                    $filtered[] = $ts;
                }
            }

            if (count($filtered) > 0) {
                $data[$key] = $filtered;
            } else {
                unset($data[$key]);
            }
        }

        $bucket = $data[$ip] ?? [];
        if (count($bucket) >= $maxRequests) {
            $isLimited = true;
        } else {
            $bucket[] = $now;
            $data[$ip] = $bucket;
        }

        rewind($handle);
        ftruncate($handle, 0);
        fwrite($handle, json_encode($data, JSON_UNESCAPED_SLASHES) ?: "{}");
        fflush($handle);
        flock($handle, LOCK_UN);
    }

    fclose($handle);
    return $isLimited;
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$minSubmitDelayMs = 1200;
$maxFormLifetimeMs = 86400000;
$sessionCooldownSeconds = 20;
$sessionRateLimitKey = "contact_last_submit_ts";
$ipRateLimitWindowSeconds = (int) (getenv("PORTFOLIO_RATE_LIMIT_WINDOW_SECONDS") ?: 600);
$ipRateLimitMaxRequests = (int) (getenv("PORTFOLIO_RATE_LIMIT_MAX_REQUESTS") ?: 12);
$ipRateLimitStorePath = __DIR__ . "/artifacts/contact-rate-limit.json";
$secretOverrides = load_secret_overrides();
$captchaProvider = strtolower(get_config_string($secretOverrides, "PORTFOLIO_CAPTCHA_PROVIDER", ""));
$captchaSecret = get_config_string($secretOverrides, "PORTFOLIO_CAPTCHA_SECRET", "");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo 0;
    exit;
}

$formType = isset($_POST["form_type"]) ? (string) $_POST["form_type"] : "";
if ($formType !== "contact") {
    echo 0;
    exit;
}

$clientIp = get_client_ip();
if (enforce_ip_rate_limit($clientIp, $ipRateLimitWindowSeconds, $ipRateLimitMaxRequests, $ipRateLimitStorePath)) {
    echo 0;
    exit;
}

$honeypot = isset($_POST["website"]) ? trim((string) $_POST["website"]) : "";
if ($honeypot !== "") {
    echo 0;
    exit;
}

$formStartedAt = isset($_POST["form_started_at"]) ? (int) $_POST["form_started_at"] : 0;
$nowMs = (int) round(microtime(true) * 1000);
$elapsedMs = $nowMs - $formStartedAt;
if ($formStartedAt <= 0 || $elapsedMs < $minSubmitDelayMs || $elapsedMs > $maxFormLifetimeMs) {
    echo 0;
    exit;
}

$nowSec = time();
if (isset($_SESSION[$sessionRateLimitKey])) {
    $lastSubmitTs = (int) $_SESSION[$sessionRateLimitKey];
    if (($nowSec - $lastSubmitTs) < $sessionCooldownSeconds) {
        echo 0;
        exit;
    }
}

if (should_enforce_captcha($captchaProvider, $captchaSecret)) {
    $captchaToken = isset($_POST["captcha_token"]) ? trim((string) $_POST["captcha_token"]) : "";
    if (!verify_captcha_token($captchaProvider, $captchaSecret, $captchaToken, $clientIp)) {
        echo 0;
        exit;
    }
}

$fullName = isset($_POST["full_name"]) ? sanitize_single_line((string) $_POST["full_name"], 160) : "";
$firstName = isset($_POST["first_name"]) ? sanitize_single_line((string) $_POST["first_name"], 80) : "";
$lastName = isset($_POST["last_name"]) ? sanitize_single_line((string) $_POST["last_name"], 80) : "";
$emailInput = isset($_POST["email"]) ? trim((string) $_POST["email"]) : "";
$subject = isset($_POST["subject"]) ? sanitize_single_line((string) $_POST["subject"], 180) : "";
$message = isset($_POST["message"]) ? sanitize_multiline((string) $_POST["message"], 5000) : "";

if ($fullName === "") {
    $fullName = trim($firstName . " " . $lastName);
}

$email = filter_var($emailInput, FILTER_VALIDATE_EMAIL) ? $emailInput : "";
if ($email === "" || $message === "") {
    echo 0;
    exit;
}

$mailSubject = ($subject !== "") ? $subject : "Contact form message";
$safeFirstName = htmlspecialchars(($firstName !== "") ? $firstName : "there", ENT_QUOTES, "UTF-8");
$safeFullName = htmlspecialchars(($fullName !== "") ? $fullName : $safeFirstName, ENT_QUOTES, "UTF-8");
$safeSubject = htmlspecialchars($mailSubject, ENT_QUOTES, "UTF-8");
$safeEmail = htmlspecialchars($email, ENT_QUOTES, "UTF-8");
$safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, "UTF-8"), false);

$fromEmail = "info@ibaifernandez.com";
$toEmail = "info@ibaifernandez.com";
$replyTo = sanitize_header_value($email);

$sendMessage = "<p>Hello,</p><p>{$safeFullName} has sent a message with {$safeSubject} as the <strong>subject</strong> from <strong>email</strong>: {$safeEmail}, and a <strong>message</strong> that reads:</p><p>{$safeMessage}</p>";
$responseSubject = "Thank you for your message";
$responseMessage = "Dear {$safeFirstName},<br><br>Thank you for reaching out to me. I have received your message regarding &quot;{$safeSubject}&quot; and I will get back to you as soon as possible.<br><br>Best regards,<br><a href=\"https://portfolio.ibaifernandez.com\" target=\"_blank\" rel=\"noopener noreferrer\">~Ibai Fernández</a>";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type:text/html;charset=UTF-8\r\n";
$headers .= "From: <{$fromEmail}>\r\n";
$headers .= "Reply-To: {$replyTo}\r\n";

$responseHeaders = "MIME-Version: 1.0\r\n";
$responseHeaders .= "Content-type:text/html;charset=UTF-8\r\n";
$responseHeaders .= "From: <{$fromEmail}>\r\n";

mail($email, $responseSubject, $responseMessage, $responseHeaders);

if (mail($toEmail, $mailSubject, $sendMessage, $headers)) {
    $_SESSION[$sessionRateLimitKey] = $nowSec;
    echo 1;
} else {
    echo 0;
}
?>
