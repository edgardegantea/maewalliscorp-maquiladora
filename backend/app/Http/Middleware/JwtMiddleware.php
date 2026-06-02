<?php
namespace App\Http\Middleware;

use App\Helpers\JwtHelper;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        if (!$token) {
            return response()->json(['message' => 'Token requerido'], 401);
        }
        try {
            $payload = JwtHelper::decode($token);
            if (isset($payload->type) && $payload->type === 'refresh') {
                return response()->json(['message' => 'Token inválido'], 401);
            }
            $user = User::find($payload->sub);
            if (!$user) {
                return response()->json(['message' => 'Usuario no encontrado'], 401);
            }
            // attributes acepta cualquier tipo (objetos incluidos)
            $request->attributes->set('auth_user', $user);
            $request->attributes->set('auth_payload', $payload);
            // merge solo acepta escalares — guardamos empresa_id como shortcut
            $request->merge(['auth_empresa_id' => (int) $user->empresa_id]);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Token inválido o expirado'], 401);
        }
        return $next($request);
    }
}
