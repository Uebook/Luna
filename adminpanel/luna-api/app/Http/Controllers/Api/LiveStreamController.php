<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\LiveStream;
use App\Models\User;
use App\Models\StreamProduct;
use App\Services\AgoraTokenService;

class LiveStreamController extends Controller
{
    protected $agoraTokenService;

    public function __construct(AgoraTokenService $agoraTokenService)
    {
        $this->agoraTokenService = $agoraTokenService;
    }

    /**
     * Get Agora token for joining/starting a stream
     */
    public function getAgoraToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'channelName' => 'required|string',
            'role' => 'required|in:broadcaster,audience',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $channelName = $request->channelName;
        $role = $request->role === 'broadcaster' ? 'publisher' : 'subscriber';
        $uid = $request->user_id ?? auth()->id() ?? 0;

        try {
            // Generate Agora token using service
            $token = $this->agoraTokenService->generateSimpleToken($channelName, $uid, $role);

            return response()->json([
                'success' => true,
                'token' => $token,
                'channelName' => $channelName,
                'uid' => $uid,
                'appId' => config('services.agora.app_id'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate token: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new live stream
     */
    public function createStream(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'channelName' => 'required|string|unique:live_streams,channel_name',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $userId = $request->user_id ?? auth()->id();

        $stream = LiveStream::create([
            'user_id' => $userId,
            'channel_name' => $request->channelName,
            'title' => $request->title,
            'description' => $request->description,
            'status' => 'live',
            'viewer_count' => 0,
            'likes_count' => 0,
            'started_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Stream created successfully',
            'stream' => $stream,
        ]);
    }

    /**
     * Get list of active live streams
     */
    public function getActiveStreams(Request $request)
    {
        $category = $request->category ?? 'all';
        $limit = $request->limit ?? 20;

        $query = LiveStream::where('status', 'live')
            ->with(['user:id,name,email,avatar', 'productsWithDetails.product'])
            ->orderBy('viewer_count', 'desc')
            ->orderBy('started_at', 'desc');

        // Filter by category if needed
        if ($category !== 'all') {
            // Add category filtering logic here
        }

        $streams = $query->limit($limit)->get();

        return response()->json([
            'success' => true,
            'streams' => $streams,
        ]);
    }

    /**
     * Get stream details
     */
    public function getStreamDetails(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'streamId' => 'required|exists:live_streams,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $stream = LiveStream::with(['user:id,name,email,avatar', 'productsWithDetails.product'])
            ->findOrFail($request->streamId);

        return response()->json([
            'success' => true,
            'stream' => $stream,
        ]);
    }

    /**
     * End a live stream
     */
    public function endStream(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'streamId' => 'required|exists:live_streams,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $stream = LiveStream::findOrFail($request->streamId);
        
        // Check if user owns the stream
        $userId = $request->user_id ?? auth()->id();
        if ($stream->user_id != $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $stream->update([
            'status' => 'ended',
            'ended_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Stream ended successfully',
        ]);
    }

    /**
     * Track viewer joining
     */
    public function viewerJoin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'streamId' => 'required|exists:live_streams,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $stream = LiveStream::findOrFail($request->streamId);
        $stream->increment('viewer_count');

        return response()->json([
            'success' => true,
            'viewerCount' => $stream->viewer_count,
        ]);
    }

    /**
     * Track viewer leaving
     */
    public function viewerLeave(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'streamId' => 'required|exists:live_streams,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $stream = LiveStream::findOrFail($request->streamId);
        $stream->decrement('viewer_count');

        return response()->json([
            'success' => true,
            'viewerCount' => $stream->viewer_count,
        ]);
    }

    /**
     * Like/Unlike a stream
     */
    public function likeStream(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'streamId' => 'required|exists:live_streams,id',
            'action' => 'required|in:like,unlike',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $stream = LiveStream::findOrFail($request->streamId);
        
        if ($request->action === 'like') {
            $stream->increment('likes_count');
        } else {
            $stream->decrement('likes_count');
        }

        return response()->json([
            'success' => true,
            'likesCount' => $stream->likes_count,
        ]);
    }

    /**
     * Generate Agora token
     * Note: This is a placeholder. You need to implement actual token generation
     * using Agora's token server or PHP SDK
     */
    private function generateAgoraToken($channelName, $uid, $role)
    {
        // TODO: Implement actual Agora token generation
        // You can use: https://github.com/AgoraIO/Tools/tree/master/DynamicKey/AgoraDynamicKey/php
        
        $appId = config('services.agora.app_id');
        $appCertificate = config('services.agora.app_certificate');
        
        if (!$appId || !$appCertificate) {
            // Return a temporary token for development
            // In production, you MUST generate proper tokens
            return 'temp_token_' . md5($channelName . $uid . time());
        }

        // Implement actual token generation here
        // For now, return a placeholder
        return 'temp_token_' . md5($channelName . $uid . time());
    }
}

