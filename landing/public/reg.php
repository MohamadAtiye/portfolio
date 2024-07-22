<?php
// Get user information
$ip_address = $_SERVER['REMOTE_ADDR'];
$user_agent = $_SERVER['HTTP_USER_AGENT'];
$referrer = $_SERVER['HTTP_REFERER'] ?? 'Direct';
$timestamp = date("Y-m-d H:i:s");

// Prepare the data to be written to the file
$data = "IP Address: $ip_address\nUser Agent: $user_agent\nReferrer: $referrer\nVisit Time: $timestamp\n\n";

// Specify the file path
$file = 'user_visits.txt';

// Write the data to the file
file_put_contents($file, $data, FILE_APPEND | LOCK_EX);

echo "Visit recorded successfully";
?>