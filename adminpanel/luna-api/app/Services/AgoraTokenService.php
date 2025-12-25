<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class AgoraTokenService
{
    /**
     * Generate Agora RTC Token
     * 
     * @param string $channelName
     * @param int $uid
     * @param string $role (publisher or subscriber)
     * @param int $expireTime Token expiration time in seconds (default 24 hours)
     * @return string
     */
    public function generateRtcToken($channelName, $uid, $role = 'publisher', $expireTime = 86400)
    {
        $appId = config('services.agora.app_id');
        $appCertificate = config('services.agora.app_certificate');

        if (!$appId || !$appCertificate) {
            Log::error('Agora credentials not configured');
            throw new \Exception('Agora credentials not configured');
        }

        // Calculate expiration timestamp
        $expireTimestamp = time() + $expireTime;

        // Build token
        $token = $this->buildToken($appId, $appCertificate, $channelName, $uid, $role, $expireTimestamp);

        return $token;
    }

    /**
     * Build Agora RTC Token
     */
    private function buildToken($appId, $appCertificate, $channelName, $uid, $role, $expireTimestamp)
    {
        // Convert role to privilege
        $privilege = $role === 'publisher' ? 1 : 2; // 1 = publish, 2 = subscribe

        // Build token string
        $token = [
            'version' => '004',
            'appId' => $appId,
            'channelName' => $channelName,
            'uid' => (string)$uid,
            'expire' => $expireTimestamp,
            'privilege' => $privilege,
        ];

        // Create message
        $message = json_encode([
            'appId' => $appId,
            'channelName' => $channelName,
            'uid' => (string)$uid,
            'expire' => $expireTimestamp,
            'privilege' => $privilege,
        ]);

        // Sign message
        $signature = hash_hmac('sha256', $message, $appCertificate, true);
        $signatureBase64 = base64_encode($signature);

        // Build final token
        $tokenString = base64_encode(json_encode([
            'signature' => $signatureBase64,
            'message' => $message,
        ]));

        return $tokenString;
    }

    /**
     * Generate simple token (for development/testing)
     * This is a simplified version - for production use Agora's official SDK
     */
    public function generateSimpleToken($channelName, $uid, $role = 'publisher')
    {
        $appId = config('services.agora.app_id');
        $appCertificate = config('services.agora.app_certificate');

        if (!$appId || !$appCertificate) {
            // Return a development token
            return base64_encode(json_encode([
                'appId' => 'dev_app_id',
                'channelName' => $channelName,
                'uid' => (string)$uid,
                'role' => $role,
                'timestamp' => time(),
            ]));
        }

        // For production, use Agora's official token generation
        // You can install: composer require agora/agora-token
        // Or use Agora's REST API token server
        
        $expireTime = 3600; // 1 hour
        return $this->generateRtcToken($channelName, $uid, $role, $expireTime);
    }
}




