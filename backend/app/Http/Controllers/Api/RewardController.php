<?php

namespace App\Http\Controllers\Api;

use App\Models\Reward;
use App\Models\Redemption;
use App\Models\PointTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class RewardController extends Controller
{
    /**
     * Return a public URL for a stored file path.
     */
    private function fileUrl(?string $path): ?string
    {
        if (!$path) return null;
        $disk = config('filesystems.default');
        
        // For local/public disk, use /api/files/ route
        if ($disk === 'public' || $disk === 'local') {
            return url('api/files/' . $path);
        }
        
        // S3 or cloud disk
        return Storage::disk($disk)->exists($path) ? Storage::disk($disk)->url($path) : null;
    }

    // Get semua reward aktif (reward catalog)
    public function index()
    {
        $rewards = Reward::where('is_active', true)
            ->select('id', 'name', 'description', 'points_required', 'stock', 'icon', 'category', 'image')
            ->get()
            ->map(function ($reward) {
                $reward->image_url = $this->fileUrl($reward->image);
                return $reward;
            });

        return response()->json([
            'data' => $rewards,
        ]);
    }

    // Store reward baru (Admin only)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'points_required' => 'required|integer|min:1',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:5000',
        ]);

        try {
            $disk = config('filesystems.default');

            // Store image if provided
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('rewards/images', $disk);
            }

            $reward = Reward::create([
                'name'            => $validated['name'],
                'description'     => $validated['description'],
                'points_required' => $validated['points_required'],
                'stock'           => $validated['stock'],
                'category'        => $validated['category'],
                'image'           => $imagePath,
                'is_active'       => true,
            ]);

            $reward->image_url = $this->fileUrl($reward->image);

            return response()->json([
                'message' => 'Reward created',
                'data'    => $reward,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create reward',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Get reward by ID
    public function show(string $id)
    {
        $reward = Reward::findOrFail($id);

        return response()->json([
            'data' => $reward,
        ]);
    }

    // Update reward (Admin only)
    public function update(Request $request, string $id)
    {
        \Log::info('Reward update request', [
            'id' => $id,
            'method' => $request->method(),
            'all_data' => $request->all(),
            'has_file' => $request->hasFile('image'),
        ]);

        try {
            $reward = Reward::findOrFail($id);

            // Validate - don't validate image if it's not uploaded
            $rules = [
                'name' => 'sometimes|string',
                'description' => 'sometimes|string',
                'points_required' => 'sometimes|integer|min:1',
                'stock' => 'sometimes|integer|min:0',
                'is_active' => 'sometimes|boolean',
                'category' => 'sometimes|string',
            ];

            // Only validate image if file is actually uploaded
            if ($request->hasFile('image')) {
                $rules['image'] = 'nullable|image|mimes:jpg,jpeg,png|max:5000';
            }

            $validated = $request->validate($rules);

            \Log::info('Validation passed', ['validated' => $validated]);

            $disk = config('filesystems.default');

            // Update image if provided
            if ($request->hasFile('image') && $request->file('image')->isValid()) {
                \Log::info('Processing image upload');
                if ($reward->image) {
                    Storage::disk($disk)->delete($reward->image);
                }
                $reward->image = $request->file('image')->store('rewards/images', $disk);
                $reward->save();
            }

            // Update other fields (only if provided)
            $updateData = [];
            if (isset($validated['name'])) $updateData['name'] = $validated['name'];
            if (isset($validated['description'])) $updateData['description'] = $validated['description'];
            if (isset($validated['points_required'])) $updateData['points_required'] = $validated['points_required'];
            if (isset($validated['stock'])) $updateData['stock'] = $validated['stock'];
            if (isset($validated['category'])) $updateData['category'] = $validated['category'];
            if (isset($validated['is_active'])) $updateData['is_active'] = $validated['is_active'];

            if (!empty($updateData)) {
                $reward->update($updateData);
            }

            $reward->refresh();
            $reward->image_url = $this->fileUrl($reward->image);

            \Log::info('Reward updated successfully', ['reward_id' => $reward->id]);

            return response()->json([
                'message' => 'Reward updated',
                'data'    => $reward,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', ['errors' => $e->errors()]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Reward update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to update reward',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Hapus reward (soft delete)
    public function destroy(string $id)
    {
        $reward = Reward::findOrFail($id);
        $reward->update(['is_active' => false]);

        return response()->json([
            'message' => 'Reward deactivated',
        ]);
    }

    // Redeem reward (tukar poin dengan hadiah)
    public function redeem(Request $request, $rewardId)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $reward = Reward::findOrFail($rewardId);

        try {
            // Use database transaction to prevent race conditions
            $redemption = \DB::transaction(function () use ($user, $reward, $validated, $request) {
                // Lock the user for points calculation (pessimistic lock)
                $lockedUser = User::lockForUpdate()->find($user->id);
                
                // Lock the reward for stock calculation
                $lockedReward = Reward::lockForUpdate()->find($reward->id);

                // Calculate total points needed
                $totalPointsNeeded = $lockedReward->points_required * $validated['quantity'];

                // Get user points with lock
                $userPoints = PointTransaction::where('user_id', $lockedUser->id)
                    ->sum('points');

                // Check if user has enough points
                if ($userPoints < $totalPointsNeeded) {
                    throw new \Exception('Insufficient points: Required ' . $totalPointsNeeded . ', Available ' . $userPoints, 402);
                }

                // Check stock
                if ($lockedReward->stock < $validated['quantity']) {
                    throw new \Exception('Insufficient stock: Available ' . $lockedReward->stock . ', Requested ' . $validated['quantity'], 400);
                }

                // Generate unique claim code
                $claimCode = 'CLAIM-' . strtoupper(\Illuminate\Support\Str::random(8)) . '-' . $lockedReward->id;

                // Create redemption record
                $redemption = Redemption::create([
                    'user_id' => $lockedUser->id,
                    'reward_id' => $lockedReward->id,
                    'quantity' => $validated['quantity'],
                    'points_used' => $totalPointsNeeded,
                    'claim_code' => $claimCode,
                    'status' => 'pending', // Pending pickup at library/admin
                    'claimed_at' => null,
                ]);

                // Deduct points
                PointTransaction::create([
                    'user_id' => $lockedUser->id,
                    'redemption_id' => $redemption->id,
                    'points' => -$totalPointsNeeded,
                    'type' => 'reward_redemption',
                    'description' => "Penukaran reward '{$lockedReward->name}' (x{$validated['quantity']})",
                ]);

                // Update reward stock
                $lockedReward->decrement('stock', $validated['quantity']);

                return $redemption;
            });

            return response()->json([
                'message' => 'Reward redeemed successfully',
                'redemption' => [
                    'id' => $redemption->id,
                    'claim_code' => $redemption->claim_code,
                    'reward_name' => $reward->name,
                    'quantity' => $validated['quantity'],
                    'points_used' => $redemption->points_used,
                    'status' => 'pending',
                    'instructions' => 'Tunjukkan kode klaim ini ke perpustakaan untuk mengambil hadiah Anda',
                ],
            ], 201);
        } catch (\Exception $e) {
            // Check if it's our custom exception with HTTP code
            if ($e->getCode() >= 400 && $e->getCode() < 500) {
                $statusCode = $e->getCode();
                $message = $e->getMessage();
            } else {
                $statusCode = 500;
                $message = 'Failed to process reward redemption: ' . $e->getMessage();
            }

            return response()->json([
                'message' => $message,
                'error' => true,
            ], $statusCode);
        }
    }

    // Get redemption history 
    public function getMyRedemptions(Request $request)
    {
        $redemptions = Redemption::where('user_id', $request->user()->id)
            ->with('reward')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $redemptions,
        ]);
    }

    // Get user's total points
    public function getUserPoints(Request $request)
    {
        $totalPoints = PointTransaction::where('user_id', $request->user()->id)
            ->sum('points');

        $recentTransactions = PointTransaction::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'total_points' => $totalPoints,
            'recent_transactions' => $recentTransactions,
        ]);
    }

    // Admin: Verify claim code (for library staff)
    public function verifyClaim(Request $request)
    {
        $validated = $request->validate([
            'claim_code' => 'required|string',
        ]);

        $redemption = Redemption::where('claim_code', $validated['claim_code'])
            ->with('reward', 'user')
            ->firstOrFail();

        if ($redemption->status !== 'pending') {
            return response()->json([
                'message' => 'Reward already claimed or invalid',
            ], 400);
        }

        // Mark as claimed
        $redemption->update([
            'status' => 'claimed',
            'claimed_at' => now(),
            'verified_by' => $request->user()->id, // Admin/library staff
        ]);

        return response()->json([
            'message' => 'Reward verified and claimed',
            'redemption' => $redemption,
        ]);
    }
}
