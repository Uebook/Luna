<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ImageSearchController extends Controller
{
    /**
     * Search products by image
     */
    public function searchByImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Save uploaded image
            $image = $request->file('image');
            $imagePath = $image->store('temp', 'public');
            $fullPath = storage_path('app/public/' . $imagePath);

            // Process image using native PHP GD library
            $this->processImage($fullPath);

            // Simple color-based matching (for demo - replace with ML/AI)
            $dominantColors = $this->extractDominantColors($fullPath);

            // Search products by similar colors/features
            $products = $this->findSimilarProducts($dominantColors);

            // Clean up temp file
            Storage::disk('public')->delete($imagePath);

            return response()->json([
                'success' => true,
                'products' => $products,
                'match_count' => count($products),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Image processing failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process image (resize using native PHP GD)
     */
    private function processImage($imagePath)
    {
        if (!function_exists('imagecreatefromjpeg')) {
            // GD library not available, skip processing
            return;
        }

        $info = getimagesize($imagePath);
        if (!$info) {
            return;
        }

        $mime = $info['mime'];
        $maxWidth = 300;
        $maxHeight = 300;

        // Create image resource based on type
        switch ($mime) {
            case 'image/jpeg':
                $source = imagecreatefromjpeg($imagePath);
                break;
            case 'image/png':
                $source = imagecreatefrompng($imagePath);
                break;
            case 'image/gif':
                $source = imagecreatefromgif($imagePath);
                break;
            default:
                return;
        }

        if (!$source) {
            return;
        }

        $width = imagesx($source);
        $height = imagesy($source);

        // Calculate new dimensions maintaining aspect ratio
        $ratio = min($maxWidth / $width, $maxHeight / $height);
        $newWidth = (int)($width * $ratio);
        $newHeight = (int)($height * $ratio);

        // Create resized image
        $resized = imagecreatetruecolor($newWidth, $newHeight);
        imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        // Save resized image
        switch ($mime) {
            case 'image/jpeg':
                imagejpeg($resized, $imagePath, 85);
                break;
            case 'image/png':
                imagepng($resized, $imagePath);
                break;
            case 'image/gif':
                imagegif($resized, $imagePath);
                break;
        }

        imagedestroy($source);
        imagedestroy($resized);
    }

    /**
     * Extract dominant colors from image
     */
    private function extractDominantColors($imagePath)
    {
        // Simplified color extraction
        // In production, use ML/AI service like Google Vision API, AWS Rekognition, etc.
        $image = imagecreatefromstring(file_get_contents($imagePath));
        $colors = [];
        
        // Sample pixels
        $width = imagesx($image);
        $height = imagesy($image);
        
        for ($i = 0; $i < 100; $i++) {
            $x = rand(0, $width - 1);
            $y = rand(0, $height - 1);
            $rgb = imagecolorat($image, $x, $y);
            $r = ($rgb >> 16) & 0xFF;
            $g = ($rgb >> 8) & 0xFF;
            $b = $rgb & 0xFF;
            $colors[] = ['r' => $r, 'g' => $g, 'b' => $b];
        }
        
        imagedestroy($image);
        return $colors;
    }

    /**
     * Find similar products based on colors
     */
    private function findSimilarProducts($colors)
    {
        // Simplified matching - in production use proper ML/AI
        // For now, return random products as placeholder
        $products = DB::table('products')
            ->where('status', 1)
            ->select('id', 'name', 'sku', 'price', 'thumbnail', 'photo')
            ->inRandomOrder()
            ->limit(20)
            ->get();

        return $products;
    }
}

