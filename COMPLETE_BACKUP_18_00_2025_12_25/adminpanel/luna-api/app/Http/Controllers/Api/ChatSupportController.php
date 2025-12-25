<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ChatSupportController extends Controller
{
    /**
     * Get chat messages
     */
    public function getMessages(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'limit' => 'nullable|integer|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $limit = $request->limit ?? 50;

        $messages = DB::table('chat_messages')
            ->where('user_id', $request->user_id)
            ->orderBy('created_at', 'asc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'messages' => $messages,
        ]);
    }

    /**
     * Send message
     */
    public function sendMessage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'message' => 'required|string|max:1000',
            'type' => 'nullable|in:text,image,file',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $messageId = DB::table('chat_messages')->insertGetId([
            'user_id' => $request->user_id,
            'message' => $request->message,
            'type' => $request->type ?? 'text',
            'sender' => 'user',
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $message = DB::table('chat_messages')->find($messageId);

        return response()->json([
            'success' => true,
            'status' => true,
            'message' => $message,
        ]);
    }

    /**
     * Get chat history
     */
    public function getChatHistory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $messages = DB::table('chat_messages')
            ->where('user_id', $request->user_id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'status' => true,
            'messages' => $messages,
        ]);
    }
}


