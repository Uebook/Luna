<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\TranslationService;
use Symfony\Component\HttpFoundation\Response;

class TranslateResponse
{
    protected $translationService;

    public function __construct(TranslationService $translationService)
    {
        $this->translationService = $translationService;
    }

    /**
     * Handle an incoming request and translate response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Get target language from request
        $targetLang = $request->header('Accept-Language', 'en');
        $targetLang = strtolower(substr($targetLang, 0, 2)); // Extract 'en' or 'ar'
        
        // Also check user's saved language preference if authenticated
        if ($request->user()) {
            $targetLang = $request->user()->language ?? $targetLang;
        }

        // Only translate if not English and response is successful
        if ($targetLang !== 'en' && $response->getStatusCode() === 200) {
            $content = $response->getContent();
            $data = json_decode($content, true);

            if (is_array($data) && json_last_error() === JSON_ERROR_NONE) {
                $translated = $this->translationService->translateResponse($data, $targetLang);
                $response->setContent(json_encode($translated));
            }
        }

        return $response;
    }
}




