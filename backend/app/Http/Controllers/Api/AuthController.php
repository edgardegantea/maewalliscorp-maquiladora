<?php
namespace App\Http\Controllers\Api;

use App\Helpers\JwtHelper;
use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'nombre_empresa' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
        ]);

        $empresa = Empresa::create(['nombre' => $data['nombre_empresa']]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'empresa_id' => $empresa->id,
            'role' => 'admin',
        ]);

        $tokens = $this->buildTokens($user);
        $user->update(['refresh_token' => $tokens['refresh_token']]);

        return response()->json(['user' => $user->load('empresa'), ...$tokens], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['Credenciales incorrectas']]);
        }

        $tokens = $this->buildTokens($user);
        $user->update(['refresh_token' => $tokens['refresh_token']]);

        return response()->json(['user' => $user->load('empresa', 'empleado'), ...$tokens]);
    }

    public function me(Request $request)
    {
        return response()->json($request->attributes->get('auth_user')->load('empresa', 'empleado'));
    }

    public function refresh(Request $request)
    {
        $token = $request->input('refresh_token');
        if (!$token) {
            return response()->json(['message' => 'Refresh token requerido'], 401);
        }
        try {
            $payload = JwtHelper::decode($token);
            if (!isset($payload->type) || $payload->type !== 'refresh') {
                return response()->json(['message' => 'Token inválido'], 401);
            }
            $user = User::find($payload->sub);
            if (!$user || $user->refresh_token !== $token) {
                return response()->json(['message' => 'Token revocado'], 401);
            }
            $tokens = $this->buildTokens($user);
            $user->update(['refresh_token' => $tokens['refresh_token']]);
            return response()->json($tokens);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Token inválido o expirado'], 401);
        }
    }

    public function logout(Request $request)
    {
        $request->attributes->get('auth_user')->update(['refresh_token' => null]);
        return response()->json(['message' => 'Sesión cerrada']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // Respuesta genérica aunque no exista el correo (seguridad)
        if (!$user) {
            return response()->json(['message' => 'Si el correo está registrado, recibirás un enlace de recuperación.']);
        }

        // Generar token y guardarlo
        $token = Str::random(64);
        DB::table('password_reset_tokens')->upsert(
            ['email' => $user->email, 'token' => Hash::make($token), 'created_at' => now()],
            ['email']
        );

        // URL del frontend
        $frontUrl = config('app.frontend_url');
        $resetUrl = "{$frontUrl}/reset-password?token={$token}&email=" . urlencode($user->email);

        // Enviar email (en dev queda en storage/logs/laravel.log)
        $safeName = e($user->name);
        $safeUrl  = e($resetUrl);
        try {
            Mail::send([], [], function ($message) use ($user, $safeName, $safeUrl) {
                $message->to($user->email, $user->name)
                    ->subject('Recuperación de contraseña — Maquiladora')
                    ->html("
                        <div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px'>
                          <h2 style='color:#1e40af;margin-bottom:8px'>Recuperar contraseña</h2>
                          <p style='color:#475569;margin-bottom:24px'>
                            Hola <strong>{$safeName}</strong>, recibimos una solicitud para restablecer
                            tu contraseña. Haz clic en el botón para continuar:
                          </p>
                          <a href='{$safeUrl}'
                             style='display:inline-block;background:#2563eb;color:#fff;
                                    text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600'>
                            Restablecer contraseña
                          </a>
                          <p style='color:#94a3b8;font-size:13px;margin-top:24px'>
                            Este enlace expira en 60 minutos. Si no solicitaste este cambio, ignora este mensaje.
                          </p>
                          <hr style='border:none;border-top:1px solid #e2e8f0;margin:24px 0'>
                          <p style='color:#cbd5e1;font-size:12px'>
                            O copia y pega este enlace en tu navegador:<br>
                            <span style='color:#3b82f6'>{$safeUrl}</span>
                          </p>
                        </div>
                    ");
            });
        } catch (\Throwable) {
            // Fallo de transporte: no revelar el error al cliente
        }

        return response()->json(['message' => 'Si el correo está registrado, recibirás un enlace de recuperación.']);
    }

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'email'                 => 'required|email',
            'token'                 => 'required|string',
            'password'              => 'required|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $data['email'])->first();

        if (!$record || !Hash::check($data['token'], $record->token)) {
            return response()->json(['message' => 'El enlace es inválido o ya fue usado.'], 422);
        }

        // Expiración: 60 minutos
        if (Carbon::parse($record->created_at)->diffInMinutes(now()) > 60) {
            DB::table('password_reset_tokens')->where('email', $data['email'])->delete();
            return response()->json(['message' => 'El enlace ha expirado. Solicita uno nuevo.'], 422);
        }

        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $user->update(['password' => Hash::make($data['password'])]);
        DB::table('password_reset_tokens')->where('email', $data['email'])->delete();

        return response()->json(['message' => 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.']);
    }

    /** Cambio de contraseña para el usuario autenticado */
    public function changePassword(Request $request)
    {
        $user = $request->attributes->get('auth_user');

        $data = $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual es incorrecta.'],
            ]);
        }

        $user->update(['password' => Hash::make($data['password'])]);

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }

    private function buildTokens(User $user): array
    {
        $payload = ['sub' => $user->id, 'empresa_id' => $user->empresa_id, 'role' => $user->role];
        return [
            'access_token' => JwtHelper::generateAccessToken($payload),
            'refresh_token' => JwtHelper::generateRefreshToken($payload),
            'token_type' => 'Bearer',
        ];
    }
}
