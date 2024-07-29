<?php

require_once "JWTHandler.php";

$handler = new JWTHandler();
$MAX_NAME_LENGTH = 30;
$MIN_NAME_LENGTH = 5;

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


function generateUserId()
{
    // Generate a unique ID based on the current time in microseconds, with additional entropy
    $userId = uniqid('user_', true);

    // Optionally, add more randomness
    $randomNumber = mt_rand(1000, 9999);
    $userId .= $randomNumber;

    return $userId;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['action'])) {
        switch ($input['action']) {
            case 'create':
                if (isset($input['user_name'])) {
                    $userName = $input['user_name'];
                    $userName = trim($userName);
                    $userName = htmlspecialchars($userName, ENT_QUOTES, 'UTF-8');
                    if (mb_strlen($userName) > $MAX_NAME_LENGTH || mb_strlen($userName) < $MIN_NAME_LENGTH) {
                        http_response_code(400);
                        echo json_encode(['error' => 'Name length error']);
                        return;
                    }

                    $userId = generateUserId();
                    $token = $handler->generateToken($userId, $userName);
                    $refreshToken = $handler->generateRefreshToken($userId, $userName);
                    echo json_encode([
                        'token' => $token,
                        'refresh_token' => $refreshToken,
                        'userID' => $userId,
                        'userName' => $userName
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing user_id']);
                }
                break;

            case 'refresh':
                if (isset($input['refresh_token'])) {
                    $refreshToken = $input['refresh_token'];
                    $newData = $handler->refreshToken($refreshToken);
                    if ($newData) {
                        echo json_encode([
                            'token' => $newData['accessToken'],
                            'refresh_token' => $newData['refreshToken'],
                            'userID' => $newData['userId'],
                            'userName' => $newData['userName']
                        ]);

                    } else {
                        http_response_code(400);
                        echo json_encode(['error' => 'Invalid refresh token']);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing refresh_token']);
                }
                break;

            default:
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Missing action']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>