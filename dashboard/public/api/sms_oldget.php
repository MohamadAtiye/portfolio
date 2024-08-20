<?php

require_once "JWTHandler.php";

$jwtHandler = new JWTHandler();
$MAX_SMS_LENGTH = 160;


// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');



// Initialize the SQLite database (create if not exists)
$databaseFile = 'messages.db';
$db = new SQLite3($databaseFile);

// Create the 'sms' table if it doesn't exist
$db->exec('CREATE TABLE IF NOT EXISTS sms (
    id INTEGER PRIMARY KEY,
    from_user TEXT,
    from_user_name TEXT,
    to_user TEXT,
    content TEXT,
    sendTS INTEGER
)');

// Handle POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Get the JWT token from the request header
    $jwtToken = getBearerToken();
    // Extract the user ID from the token payload
    $user = $jwtHandler->getUserIdAndNameFromToken($jwtToken);
    if (!$user || !$user['userId'] || !$user['userName']) {
        http_response_code(400);
        echo json_encode(['error' => 'auth error']);
        return;
    }

    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    $to_user = $data['to_user'];
    $to_user = trim($to_user);
    $content = $data['content'];
    $content = trim($content);
    if (!$content || !$to_user) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing data']);
        return;
    }

    // Sanitize
    $content = htmlspecialchars($content, ENT_QUOTES, 'UTF-8');
    if (mb_strlen($content) > $MAX_SMS_LENGTH) {
        http_response_code(400);
        echo json_encode(['error' => 'Message too long']);
        return;
    }
    $to_user = htmlspecialchars($to_user, ENT_QUOTES, 'UTF-8');

    $sendTS = time(); // Current timestamp

    // Insert the message into the database
    $stmt = $db->prepare('INSERT INTO sms (from_user, from_user_name, to_user, content, sendTS) VALUES (?, ?, ?, ?, ?)');
    $stmt->bindValue(1, $user['userId'], SQLITE3_TEXT);
    $stmt->bindValue(2, $user['userName'], SQLITE3_TEXT);
    $stmt->bindValue(3, $to_user, SQLITE3_TEXT);
    $stmt->bindValue(4, $content, SQLITE3_TEXT);
    $stmt->bindValue(5, $sendTS, SQLITE3_TEXT);
    $stmt->execute();

    // Respond with success or appropriate error handling
    http_response_code(200);
    echo json_encode(['message' => 'Message saved successfully']);
}

// Handle GET requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get the JWT token from the request header
    $jwtToken = getBearerToken();
    // Extract the user ID from the token payload
    $user = $jwtHandler->getUserIdAndNameFromToken($jwtToken);
    if (!$user || !$user['userId'] || !$user['userName']) {
        http_response_code(400);
        echo json_encode(['error' => 'auth error']);
        return;
    }

    // Get the last_id from the user (assuming it's passed as a query parameter)
    $lastId = isset($_GET['last_id']) ? intval($_GET['last_id']) : 0;

    // Prepare the query with placeholders
    $query = $db->prepare('SELECT * FROM sms WHERE (from_user = :userId OR to_user = :userId OR to_user = "general") AND id > :lastId ORDER BY id DESC');

    // Bind the parameters
    $query->bindValue(':userId', $user['userId'], SQLITE3_TEXT);
    $query->bindValue(':lastId', $lastId, SQLITE3_INTEGER);

    // Execute the query
    $result = $query->execute();

    $messages = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $messages[] = $row;
    }

    // Respond with the messages (you can format this as needed)
    http_response_code(200);
    echo json_encode($messages);
}

// Close the database connection
$db->close();
?>