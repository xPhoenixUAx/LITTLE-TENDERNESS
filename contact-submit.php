<?php
function site_setting($key, $fallback = '') {
  $configPath = __DIR__ . '/js/site-config.js';
  if (!is_readable($configPath)) {
    return $fallback;
  }
  $content = file_get_contents($configPath);
  if (preg_match('/' . preg_quote($key, '/') . '\s*:\s*"([^"]*)"/', $content, $matches)) {
    return stripcslashes($matches[1]);
  }
  return $fallback;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Location: contact.html');
  exit;
}

$company = site_setting('companyName', 'A LITTLE TENDERNESS s.r.o.');
$recipient = site_setting('email', 'support@littletendernessads.com');
$website = site_setting('website', 'littletendernessads.com');

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$companyField = trim($_POST['company'] ?? '');
$websiteField = trim($_POST['website'] ?? '');
$service = trim($_POST['service'] ?? '');
$message = trim($_POST['message'] ?? '');
$honeypot = trim($_POST['website_url'] ?? '');

if ($honeypot !== '') {
  header('Location: contact.html?form=sent#contactForm');
  exit;
}

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === '') {
  header('Location: contact.html?form=invalid#contactForm');
  exit;
}

$safeSubject = $subject !== '' ? $subject : ($service !== '' ? $service . ' audit request' : 'New website inquiry');
$mailSubject = 'Website inquiry from ' . $website . ': ' . $safeSubject;
$body = "New inquiry for {$company}\n\n";
$body .= "Name: {$name}\n";
$body .= "Email: {$email}\n";
$body .= "Subject: {$safeSubject}\n";
$body .= "Company: {$companyField}\n";
$body .= "Website: {$websiteField}\n";
$body .= "Service: {$service}\n\n";
$body .= "Message:\n{$message}\n";

$headers = [];
$headers[] = 'From: ' . $company . ' <' . $recipient . '>';
$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';

$sent = mail($recipient, $mailSubject, $body, implode("\r\n", $headers));
header('Location: contact.html?form=' . ($sent ? 'sent' : 'error') . '#contactForm');
exit;
?>
