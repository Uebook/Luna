<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductChatbotQuery;
use App\Models\ProductFaq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProductChatbotController extends Controller
{
    /**
     * Handle product-specific chatbot query
     */
    public function productQuery(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'question' => 'required|string|max:500',
            'language' => 'nullable|string|in:en,ar'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = $request->user_id;
        $productId = $request->product_id;
        $question = $request->question;
        $language = $request->language ?? 'en';

        // Step 1: Try to find auto-answer from FAQ
        $autoAnswer = $this->findAutoAnswer($productId, $question, $language);

        if ($autoAnswer) {
            // Save query with auto-answer
            $query = ProductChatbotQuery::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'question' => $question,
                'answer' => $autoAnswer['answer'],
                'is_auto_answer' => true,
                'status' => 'answered',
                'language' => $language,
                'answered_at' => now()
            ]);

            return response()->json([
                'status' => true,
                'is_auto_answer' => true,
                'answer' => $autoAnswer['answer'],
                'query_id' => $query->id,
                'message' => 'Auto-answer provided'
            ]);
        }

        // Step 2: No auto-answer found - save for admin response
        $query = ProductChatbotQuery::create([
            'user_id' => $userId,
            'product_id' => $productId,
            'question' => $question,
            'is_auto_answer' => false,
            'status' => 'pending',
            'language' => $language
        ]);

        return response()->json([
            'status' => true,
            'is_auto_answer' => false,
            'message' => $language === 'ar' 
                ? 'شكراً لسؤالك! سنقوم بالرد عليك قريباً من خلال فريق الدعم.'
                : 'Thanks for your question! Our support team will respond soon.',
            'query_id' => $query->id
        ]);
    }

    /**
     * Find matching FAQ answer
     */
    private function findAutoAnswer($productId, $question, $language)
    {
        // Normalize question for matching
        $normalizedQuestion = strtolower(trim($question));
        $keywords = explode(' ', $normalizedQuestion);

        // First: Try product-specific FAQs
        $productFaqs = ProductFaq::where('product_id', $productId)
            ->where('language', $language)
            ->where('is_active', true)
            ->orderBy('priority', 'desc')
            ->get();

        foreach ($productFaqs as $faq) {
            $faqQuestion = strtolower($faq->question);
            $matchScore = $this->calculateMatchScore($normalizedQuestion, $faqQuestion, $keywords);
            
            if ($matchScore >= 0.6) { // 60% match threshold
                return [
                    'answer' => $faq->answer,
                    'faq_id' => $faq->id,
                    'match_score' => $matchScore
                ];
            }
        }

        // Second: Try general FAQs (product_id = null)
        $generalFaqs = ProductFaq::whereNull('product_id')
            ->where('language', $language)
            ->where('is_active', true)
            ->orderBy('priority', 'desc')
            ->get();

        foreach ($generalFaqs as $faq) {
            $faqQuestion = strtolower($faq->question);
            $matchScore = $this->calculateMatchScore($normalizedQuestion, $faqQuestion, $keywords);
            
            if ($matchScore >= 0.5) { // Lower threshold for general FAQs
                return [
                    'answer' => $faq->answer,
                    'faq_id' => $faq->id,
                    'match_score' => $matchScore
                ];
            }
        }

        return null;
    }

    /**
     * Calculate similarity score between question and FAQ
     */
    private function calculateMatchScore($question, $faqQuestion, $keywords)
    {
        // Exact match
        if (strpos($faqQuestion, $question) !== false || strpos($question, $faqQuestion) !== false) {
            return 1.0;
        }

        // Keyword matching
        $faqWords = explode(' ', $faqQuestion);
        $matchedKeywords = 0;
        
        foreach ($keywords as $keyword) {
            if (strlen($keyword) > 2) { // Ignore very short words
                foreach ($faqWords as $faqWord) {
                    if (strpos($faqWord, $keyword) !== false || strpos($keyword, $faqWord) !== false) {
                        $matchedKeywords++;
                        break;
                    }
                }
            }
        }

        if (count($keywords) === 0) return 0;
        
        return $matchedKeywords / count($keywords);
    }

    /**
     * Get chat history for a product
     */
    public function getChatHistory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $queries = ProductChatbotQuery::where('user_id', $request->user_id)
            ->where('product_id', $request->product_id)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($query) {
                return [
                    'id' => $query->id,
                    'question' => $query->question,
                    'answer' => $query->answer,
                    'is_auto_answer' => $query->is_auto_answer,
                    'status' => $query->status,
                    'created_at' => $query->created_at->toISOString(),
                    'answered_at' => $query->answered_at?->toISOString()
                ];
            });

        return response()->json([
            'status' => true,
            'messages' => $queries
        ]);
    }

    /**
     * Check for new answers (for polling)
     */
    public function checkUpdates(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'last_check' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $query = ProductChatbotQuery::where('user_id', $request->user_id)
            ->where('product_id', $request->product_id)
            ->where('status', 'answered');

        if ($request->last_check) {
            $query->where('answered_at', '>', $request->last_check);
        }

        $newAnswers = $query->get()->map(function ($q) {
            return [
                'query_id' => $q->id,
                'answer' => $q->answer,
                'answered_at' => $q->answered_at->toISOString()
            ];
        });

        return response()->json([
            'status' => true,
            'new_answers' => $newAnswers
        ]);
    }
}



