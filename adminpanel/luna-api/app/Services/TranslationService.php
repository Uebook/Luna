<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class TranslationService
{
    private $defaultLang = 'en';
    private $supportedLangs = ['en', 'ar'];

    /**
     * Translate API response based on user language
     */
    public function translateResponse($data, $targetLang = 'en')
    {
        if ($targetLang === 'en' || !in_array($targetLang, $this->supportedLangs)) {
            return $data;
        }

        // If data is array, translate recursively
        if (is_array($data)) {
            return $this->translateArray($data, $targetLang);
        }

        return $data;
    }

    /**
     * Translate array recursively
     */
    private function translateArray($array, $targetLang)
    {
        $translated = [];

        foreach ($array as $key => $value) {
            // Fields that need translation
            $translatableFields = [
                'name', 'title', 'description', 'text', 'message',
                'category_name', 'brand_name', 'product_name',
                'status', 'error', 'label', 'answer', 'question'
            ];

            if (in_array($key, $translatableFields) && is_string($value)) {
                $translated[$key] = $this->translateText($value, $targetLang);
            } elseif (is_array($value)) {
                $translated[$key] = $this->translateArray($value, $targetLang);
            } else {
                $translated[$key] = $value;
            }
        }

        return $translated;
    }

    /**
     * Translate single text
     */
    private function translateText($text, $targetLang)
    {
        if (empty($text) || $targetLang === 'en') {
            return $text;
        }

        // Check cache first
        $cacheKey = "translation_{$targetLang}_" . md5($text);
        $cached = Cache::get($cacheKey);
        
        if ($cached !== null) {
            return $cached;
        }

        // Check database translations first
        $dbTranslation = $this->getDatabaseTranslation($text, $targetLang);
        if ($dbTranslation) {
            Cache::put($cacheKey, $dbTranslation, now()->addDays(30));
            return $dbTranslation;
        }

        // Use Google Translate API (optional - requires API key)
        $translated = $this->translateWithGoogle($text, $targetLang);
        
        if ($translated) {
            // Save to database for future use
            $this->saveTranslation($text, $targetLang, $translated);
            Cache::put($cacheKey, $translated, now()->addDays(30));
        }

        return $translated ?: $text; // Fallback to original if translation fails
    }

    /**
     * Get translation from database
     */
    private function getDatabaseTranslation($text, $targetLang)
    {
        return DB::table('translations')
            ->where('source_text', $text)
            ->where('target_language', $targetLang)
            ->value('translated_text');
    }

    /**
     * Save translation to database
     */
    private function saveTranslation($sourceText, $targetLang, $translatedText)
    {
        DB::table('translations')->insertOrIgnore([
            'source_text' => $sourceText,
            'target_language' => $targetLang,
            'translated_text' => $translatedText,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Translate using Google Translate API (optional)
     */
    private function translateWithGoogle($text, $targetLang)
    {
        try {
            $apiKey = config('services.google.translate_key');
            if (!$apiKey) {
                return null; // No API key configured
            }

            $response = Http::post('https://translation.googleapis.com/language/translate/v2', [
                'key' => $apiKey,
                'q' => $text,
                'target' => $targetLang,
                'source' => 'en'
            ]);

            if ($response->successful()) {
                return $response->json('data.translations.0.translatedText');
            }
        } catch (\Exception $e) {
            \Log::error('Translation error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Batch translate multiple texts
     */
    public function translateBatch(array $texts, $targetLang)
    {
        $translated = [];
        
        foreach ($texts as $text) {
            $translated[] = $this->translateText($text, $targetLang);
        }

        return $translated;
    }
}




