<?php

class JWTHandler
{
    private $secretKey = "your_secret_key"; // Change this to your secret key
    private $refreshSecretKey = "your_refresh_secret_key"; // Change this to your refresh secret key

    private function base64UrlEncode($data)
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private function base64UrlDecode($data)
    {
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }

    private function sign($payload, $secret)
    {
        return hash_hmac('sha256', $payload, $secret, true);
    }

    public function generateToken($userId, $userName)
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'iss' => "your_domain.com",
            'aud' => "your_domain.com",
            'iat' => time(),
            'nbf' => time(),
            'exp' => time() + (60 * 60), // Token valid for 1 hour
            'sub' => $userId,
            'userName' => $userName
        ]);

        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);
        $signature = $this->base64UrlEncode($this->sign("$base64UrlHeader.$base64UrlPayload", $this->secretKey));

        return "$base64UrlHeader.$base64UrlPayload.$signature";
    }

    public function generateRefreshToken($userId, $userName)
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'iss' => "your_domain.com",
            'aud' => "your_domain.com",
            'iat' => time(),
            'nbf' => time(),
            'exp' => time() + (60 * 60 * 24 * 7), // Refresh token valid for 1 week
            'sub' => $userId,
            'userName' => $userName
        ]);

        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);
        $signature = $this->base64UrlEncode($this->sign("$base64UrlHeader.$base64UrlPayload", $this->refreshSecretKey));

        return "$base64UrlHeader.$base64UrlPayload.$signature";
    }

    public function validateToken($token, $secret)
    {
        $parts = explode('.', $token);
        if (count($parts) === 3) {
            list($base64UrlHeader, $base64UrlPayload, $signature) = $parts;
            $payload = json_decode($this->base64UrlDecode($base64UrlPayload), true);
            if ($payload && isset($payload['exp']) && $payload['exp'] > time()) {
                $validSignature = $this->base64UrlEncode($this->sign("$base64UrlHeader.$base64UrlPayload", $secret));
                if (hash_equals($signature, $validSignature)) {
                    return $payload;
                }
            }
        }
        return false;
    }

    public function refreshToken($refreshToken)
    {
        $decoded = $this->validateToken($refreshToken, $this->refreshSecretKey);
        if ($decoded) {
            $userId = $decoded['sub'];
            $userName = $decoded['userName'];
            $newAccessToken = $this->generateToken($userId, $userName);
            $newRefreshToken = $this->generateRefreshToken($userId, $userName);
            return [
                'userId' => $userId,
                'userName' => $userName,
                'accessToken' => $newAccessToken,
                'refreshToken' => $newRefreshToken
            ];
        }
        return null;
    }
}
