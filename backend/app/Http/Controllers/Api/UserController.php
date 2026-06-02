<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empleado;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    /** Lista de usuarios de la empresa (admin) */
    public function index(Request $request)
    {
        $users = User::with('empleado:id,nombre,apellidos')
            ->where('empresa_id', $request->auth_empresa_id)
            ->orderBy('name')
            ->get()
            ->map(fn($u) => [
                'id'          => $u->id,
                'name'        => $u->name,
                'email'       => $u->email,
                'role'        => $u->role,
                'empleado_id' => $u->empleado_id,
                'empleado'    => $u->empleado ? "{$u->empleado->apellidos} {$u->empleado->nombre}" : null,
            ]);

        return response()->json($users);
    }

    /** Crear usuario */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|unique:users,email',
            'password'    => 'required|string|min:8|confirmed',
            'role'        => 'required|in:admin,encargado,empleado',
            'empleado_id' => 'nullable|exists:empleados,id',
        ]);

        // Validar que el empleado pertenezca a la empresa
        if (!empty($data['empleado_id'])) {
            $emp = Empleado::find($data['empleado_id']);
            if (!$emp || $emp->empresa_id !== $request->auth_empresa_id) {
                abort(422, 'El empleado no pertenece a esta empresa.');
            }
        }

        $user = User::create([
            'name'        => $data['name'],
            'email'       => $data['email'],
            'password'    => Hash::make($data['password']),
            'role'        => $data['role'],
            'empleado_id' => $data['empleado_id'] ?? null,
            'empresa_id'  => $request->auth_empresa_id,
        ]);

        return response()->json([
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'role'        => $user->role,
            'empleado_id' => $user->empleado_id,
        ], 201);
    }

    /** Actualizar nombre, rol y empleado vinculado */
    public function update(Request $request, User $user)
    {
        if ($user->empresa_id !== $request->auth_empresa_id) abort(403);

        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'role'        => 'sometimes|in:admin,encargado,empleado',
            'empleado_id' => 'nullable|exists:empleados,id',
        ]);

        if (!empty($data['empleado_id'])) {
            $emp = Empleado::find($data['empleado_id']);
            if (!$emp || $emp->empresa_id !== $request->auth_empresa_id) {
                abort(422, 'El empleado no pertenece a esta empresa.');
            }
        }

        $user->update($data);

        return response()->json([
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'role'        => $user->role,
            'empleado_id' => $user->empleado_id,
        ]);
    }

    /** Resetear contraseña (admin establece nueva contraseña para otro usuario) */
    public function resetPassword(Request $request, User $user)
    {
        if ($user->empresa_id !== $request->auth_empresa_id) abort(403);

        $data = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update(['password' => Hash::make($data['password'])]);

        return response()->json(['message' => 'Contraseña actualizada correctamente.']);
    }

    /** Eliminar usuario (no puede eliminarse a sí mismo) */
    public function destroy(Request $request, User $user)
    {
        if ($user->empresa_id !== $request->auth_empresa_id) abort(403);

        $authUser = $request->attributes->get('auth_user');
        if ($user->id === $authUser->id) {
            abort(422, 'No puedes eliminar tu propia cuenta.');
        }

        $user->delete();
        return response()->json(null, 204);
    }
}
