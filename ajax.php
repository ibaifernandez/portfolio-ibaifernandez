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

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$minSubmitDelayMs = 1200;
$maxFormLifetimeMs = 86400000;
$sessionCooldownSeconds = 20;
$sessionRateLimitKey = "contact_last_submit_ts";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo 0;
    exit;
}

$formType = isset($_POST["form_type"]) ? (string) $_POST["form_type"] : "";
if ($formType !== "contact") {
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
