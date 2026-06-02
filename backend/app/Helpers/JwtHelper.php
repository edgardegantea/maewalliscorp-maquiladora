<?php
namespace App\Helpers;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtHelper
{
    private static string $algo = 'HS256';

    private static function secret(): string
    {
        return config('jwt.secret') ?: env('JWT_SECRET', '');
    }

    public static function generateAccessToken(array $payload): string
    {
        $payload['iat'] = time();
        $payload['exp'] = time() + config('jwt.ttl', 1440) * 60;
        return JWT::encode($payload, self::secret(), self::$algo);
    }

    public static function generateRefreshToken(array $payload): string
    {
        $payload['iat'] = time();
        $payload['exp'] = time() + 60 * 60 * 24 * 30; // 30 días
        $payload['type'] = 'refresh';
        return JWT::encode($payload, self::secret(), self::$algo);
    }

    public static function decode(string $token): object
    {
        return JWT::decode($token, new Key(self::secret(), self::$algo));
    }
}
