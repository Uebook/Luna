<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class HomeController extends Controller
{
 public function getCategories() {
    // First, check total categories in database
    $totalCategories = DB::table('categories')->count();
    $activeCategories = DB::table('categories')->where('status', 1)->count();
    
    // Get all active categories, ordered by display order or name
    // If there are fewer than 5 active categories, also include inactive ones to reach minimum 8-10
    $categoriesQuery = DB::table('categories');
    
    if ($activeCategories >= 8) {
        // Enough active categories, only return active ones
        $categoriesQuery->where('status', 1);
    } else {
        // Not enough active categories, return all categories (active first, then inactive)
        // This ensures we show at least 8-10 categories
        $categoriesQuery->orderByRaw('CASE WHEN status = 1 THEN 0 ELSE 1 END'); // Active first
    }
    
    $categories = $categoriesQuery
                    ->orderBy('is_featured', 'desc') // Featured categories first
                    ->orderBy('name', 'asc') // Then alphabetically
                    ->limit(15) // Limit to 15 max
                    ->get()
                    ->map(function ($category) {
                        $category->subcategories = DB::table('subcategories')
                            ->where('category_id', $category->id)
                            ->where('status', 1)
                            ->orderBy('name', 'asc')
                            ->get()
                            ->map(function ($sub) {
                                $sub->childcategories = DB::table('childcategories')
                                    ->where('subcategory_id', $sub->id)
                                    ->where('status', 1)
                                    ->orderBy('name', 'asc')
                                    ->get();
                                return $sub;
                            });
                        return $category;
                    });

    // Log total categories for debugging
    \Log::info('Categories API called - Total: ' . $totalCategories . ', Active: ' . $activeCategories . ', Returned: ' . $categories->count());

    return response()->json([
        'status' => true,
        'categories' => $categories
    ]);
}
 
public function homeData(Request $request)
{
    try {
        $categoryId = $request->category_id;

        $storiesQuery = DB::table('stories')
            ->join('users', 'stories.user_id', '=', 'users.id')
            // ->where('stories.expires_at', '>', now())
            ->where('users.is_provider', 1)
            ->select(
                'stories.*',
                'users.name as user_name',
                'users.shop_name',
                'users.photo as user_photo',
                'users.shop_image'
            );

        if (!empty($categoryId)) {
            $storiesQuery->where('stories.category_id', $categoryId);
        }

        $stories = $storiesQuery->orderBy('stories.created_at', 'desc')->get();

        $blogsQuery = DB::table('blogs')
            ->where('status', 1)
            ->orderBy('created_at', 'desc');

        if (!empty($categoryId)) {
            $blogsQuery->where('category_id', $categoryId);
        }

        $blogs = $blogsQuery->take(10)->get()->map(function ($blog) {
            // Generate full image URL for blog photo
            if (!empty($blog->photo)) {
                // If already a full URL, keep it; otherwise prepend base URL
                if (!preg_match('/^https?:\/\//', $blog->photo)) {
                    $blog->photo = 'https://proteinbros.in/assets/images/blogs/' . ltrim($blog->photo, '/');
                }
            }
            // Also handle image field if it exists
            if (!empty($blog->image) && !preg_match('/^https?:\/\//', $blog->image)) {
                $blog->image = 'https://proteinbros.in/assets/images/blogs/' . ltrim($blog->image, '/');
            }
            return $blog;
        });

        $brandsQuery = DB::table('brands');
        if (!empty($categoryId)) {
            $brandsQuery->join('brand_served_categories', 'brand_served_categories.brand_id', '=', 'brands.id')
                ->where('brand_served_categories.category_id', $categoryId);
        }
        $brands = $brandsQuery->inRandomOrder()->take(10)->get();

        $productsQuery = DB::table('products')
               ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
               ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
               ->select(
            'products.*',
            'brands.name as brand_name',
            'brands.logo as brand_logo',
            'categories.name as category_name',
            'categories.image as category_image',
            'categories.photo as category_photo',
        )
               ->inRandomOrder()
               ->take(10);

if (!empty($categoryId)) {
    $productsQuery->where(function ($q) use ($categoryId) {
        $q->where('products.category_id', $categoryId)
            ->orWhere('products.subcategory_id', $categoryId)
            ->orWhere('products.childcategory_id', $categoryId);
    });
}

$products = $productsQuery->get();

        $vendorsQuery = DB::table('vendor_categories')
            ->join('users', 'vendor_categories.vendor_id', '=', 'users.id')
            ->where('users.is_provider', 1)
            ->select('users.*')
            ->inRandomOrder()
            ->take(10);

        if (!empty($categoryId)) {
            $vendorsQuery->where('vendor_categories.category_id', $categoryId);
        }
        $vendors = $vendorsQuery->get();


if (!empty($categoryId)) {
    $subCategories = DB::table('subcategories')
        ->where('category_id', $categoryId)
        ->where('status',1)
        ->inRandomOrder()
        ->take(15)
        ->get();
} else {
   
    $subCategories = DB::table('subcategories')
        ->whereNotNull('category_id')
        ->where('status',1)
        ->inRandomOrder()
        ->take(15)
        ->get();
}



        // Fetch sliders (banners) from sliders table (admin panel slider management)
        // Try sliders table first, fallback to banners table if sliders doesn't exist
        $banners = collect([]);
        
        try {
            // Try to fetch from sliders table first
            // Check if status column exists and filter by it, otherwise get all
            $slidersQuery = DB::table('sliders');
            
            // Check if status column exists in sliders table
            $columns = DB::getSchemaBuilder()->getColumnListing('sliders');
            if (in_array('status', $columns)) {
                $slidersQuery->where('status', 1); // Only active sliders
            }
            
            $sliders = $slidersQuery
                ->orderBy('position', 'asc')
                ->orderBy('id', 'asc')
                ->take(10)
                ->get();
            
            if ($sliders->count() > 0) {
                // Format sliders with proper image URLs
                $banners = $sliders->map(function ($slider) {
                    // Generate full image URL - use production URL
                    $imageUrl = null;
                    if ($slider->photo) {
                        if (filter_var($slider->photo, FILTER_VALIDATE_URL)) {
                            $imageUrl = $slider->photo;
                        } else {
                            // Use production URL instead of localhost
                            $baseUrl = 'https://proteinbros.in';
                            // Check if path already includes the base path
                            if (strpos($slider->photo, '/assets/images/sliders/') === 0 || strpos($slider->photo, 'assets/images/sliders/') === 0) {
                                $imageUrl = $baseUrl . '/' . ltrim($slider->photo, '/');
                            } else {
                                $imageUrl = $baseUrl . '/assets/images/sliders/' . $slider->photo;
                            }
                        }
                    }
                    
                    return (object) [
                        'id' => $slider->id,
                        'image' => $imageUrl,
                        'photo' => $imageUrl,
                        'banner' => $imageUrl,
                        'link' => $slider->link ?? null,
                        'title' => $slider->title_text ?? null,
                        'subtitle' => $slider->subtitle_text ?? null,
                        'details' => $slider->details_text ?? null,
                    ];
                });
            } else {
                // If sliders table is empty or no active sliders, try banners table
                throw new \Exception('No active sliders found, trying banners');
            }
        } catch (\Exception $e) {
            // Fallback to banners table
            try {
                $bannersQuery = DB::table('banners')
                    ->where('status', 1); // Only active banners
                    
                if (!empty($categoryId)) {
                    $bannersQuery->where('category_id', $categoryId);
                }
                
                $rawBanners = $bannersQuery
                    ->inRandomOrder()
                    ->take(5)
                    ->get();
                
                // Format banners with proper image URLs
                $banners = $rawBanners->map(function ($banner) {
                    $imageUrl = null;
                    if ($banner->image || $banner->photo || ($banner->banner ?? null)) {
                        $imagePath = $banner->image ?? $banner->photo ?? $banner->banner;
                        if (filter_var($imagePath, FILTER_VALIDATE_URL)) {
                            $imageUrl = $imagePath;
                        } else {
                            // Use production URL instead of localhost
                            $baseUrl = 'https://proteinbros.in';
                            
                            if (strpos($imagePath, '/assets/images/banners/') === 0 || strpos($imagePath, 'assets/images/banners/') === 0) {
                                $imageUrl = $baseUrl . '/' . ltrim($imagePath, '/');
                            } else {
                                $imageUrl = $baseUrl . '/assets/images/banners/' . $imagePath;
                            }
                        }
                    }
                    
                    return (object) [
                        'id' => $banner->id,
                        'image' => $imageUrl,
                        'photo' => $imageUrl,
                        'banner' => $imageUrl,
                        'link' => $banner->link ?? null,
                    ];
                });
            } catch (\Exception $e2) {
                // If both fail, return empty collection
                $banners = collect([]);
            }
        }

        $couponsQuery = DB::table('coupons')
            ->where('status', 1)
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->take(10);

        if (!empty($categoryId)) {
            $couponsQuery->where('category', $categoryId);
        }
        $coupons = $couponsQuery->get();

        $productTypes = ['hot', 'latest', 'best', 'trending', 'sale', 'flash_deal'];
        $productCollections = [];

        foreach ($productTypes as $type) {
    $query = DB::table('products')
        ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
        ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
        ->select(
            'products.*',
            'brands.name as brand_name',
            'brands.logo as brand_logo',
            'categories.name as category_name',
            'categories.image as category_image',
            'categories.photo as category_photo',
        )
        ->where("products.$type", 1)
        ->take(10);

    if (!empty($categoryId)) {
        $query->where('products.category_id', $categoryId);
    }

    if ($type === 'latest') {
        $query->orderBy('products.created_at', 'desc');
    } else {
        $query->inRandomOrder();
    }

    $productCollections["{$type}_products"] = $query->get();
}

        return response()->json([
            'status' => true,
            'message' => 'Data fetched successfully.',
            'filtered' => !empty($categoryId),
            'category_id' => $categoryId,
            'stories' => $stories,
            'blogs' => $blogs,
            'banners' => $banners,
            'partners' => DB::table('partners')->take(10)->get(),
            'coupons' => $coupons,
            'vendors' => $vendors,
            'brands' => $brands,
            'subCategories'=>$subCategories,
            'random_products' => $products,
            ...$productCollections,
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'status' => false,
            'message' => 'Something went wrong while fetching data.',
            'error' => $e->getMessage(),
        ], 500);
    }
}



    public function stories(Request $request)
    {
        $categoryId = $request->category_id;
        
        if($categoryId!=""){
            $stories = DB::table('stories')
            ->join('users', 'stories.user_id', '=', 'users.id')
            ->when($categoryId, function ($q) use ($categoryId) {
                $q->where('stories.category_id', $categoryId);
            })
            ->where('stories.expires_at', '>', now())
            ->where('users.is_provider', 1)
            ->select('stories.*', 'users.name as user_name', 'users.shop_name', 'users.photo as user_photo', 'users.shop_image')
            ->orderBy('stories.created_at', 'desc')
            ->get();   
        }else{
            $stories = DB::table('stories')
            ->join('users', 'stories.user_id', '=', 'users.id') 
            ->where('stories.expires_at', '>', now())
            ->where('users.is_provider', 1)
            ->select('stories.*', 'users.name as user_name', 'users.shop_name', 'users.photo as user_photo', 'users.shop_image')
            ->orderBy('stories.created_at', 'desc')
            ->get();
        }
        
        return response()->json([
            'status' => true,
            'filtered' => $categoryId ? true : false,
            'stories' => $stories
        ]);
    }
    
    public function celebrityProducts(Request $request)
    {
    $validator = Validator::make($request->all(), [
        'vendor_id' => 'required|integer|exists:users,id'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    $vendor_id = $request->vendor_id;
    $vendor = DB::table('users')
        ->where('id', $vendor_id)
        ->where('is_provider', 1)
        ->select('id', 'name', 'shop_name', 'photo', 'shop_image', 'email', 'phone')
        ->first();

    if (!$vendor) {
        return response()->json([
            'status' => false,
            'message' => 'Vendor not found or not a provider'
        ], 404);
    }
    $products = DB::table('products')
        ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
        ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
        ->select(
            'products.*',
            'brands.name as brand_name',
            'brands.logo as brand_logo',
            'categories.name as category_name',
            'categories.image as category_image',
            'categories.photo as category_photo',
        )
        ->where('products.user_id', $vendor_id)
        ->where('products.status', 1)
        ->get();

    return response()->json([
        'status' => true,
        'vendor' => $vendor,
        'products' => $products
    ]);
}
    
    public function brands(Request $request)
    {
        $categoryId = $request->category_id;
        $brandsQuery = DB::table('brands');
        if (!empty($categoryId)) {
            $brandsQuery->join('brand_served_categories', 'brand_served_categories.brand_id', '=', 'brands.id')
                ->where('brand_served_categories.category_id', $categoryId);
        }
        $brands = $brandsQuery->inRandomOrder()->take(10)->get();
        return response()->json([
            'status' => true,
            'filtered' => $categoryId ? true : false,
            'brands' => $brands
        ]);
    }

    public function discovers(Request $request)
    {
        $categoryId = $request->category_id;
       
        if($categoryId!=""){
            $blogs = DB::table('blogs')
            ->where('status', 1)
            ->when($categoryId, function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->orderBy('created_at', 'desc')
            ->get();
        }else{
            $blogs = DB::table('blogs')
            ->where('status', 1)
            ->orderBy('created_at', 'desc')
            ->get();
        }
        
        // Format blog images with full URLs
        $blogs = $blogs->map(function ($blog) {
            // Generate full image URL for blog photo
            if (!empty($blog->photo)) {
                if (!preg_match('/^https?:\/\//', $blog->photo)) {
                    $blog->photo = 'https://proteinbros.in/assets/images/blogs/' . ltrim($blog->photo, '/');
                }
            }
            // Also handle image field if it exists
            if (!empty($blog->image) && !preg_match('/^https?:\/\//', $blog->image)) {
                $blog->image = 'https://proteinbros.in/assets/images/blogs/' . ltrim($blog->image, '/');
            }
            return $blog;
        });
        
        return response()->json([
            'status' => true,
            'filtered' => $categoryId ? true : false,
            'discovers' => $blogs
        ]);
    }
    
    public function coupons(Request $request)
    {
        $categoryId = $request->category_id;
        if($categoryId!=""){
            $coupons = DB::table('coupons')
            ->where('status', 1)
            ->where('category',$categoryId)
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())->get(); 
        }else{
            $coupons = DB::table('coupons')
            ->where('status', 1)
            ->whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())->get();
        }
        return response()->json([
            'status' => true,
            'filtered' => $categoryId ? true : false,
            'coupons' => $coupons
        ]);
    }

    public function vendors(Request $request)
    {
        $categoryId = $request->category_id;

        if ($categoryId) {
            $vendors = DB::table('vendor_categories')
                ->join('users', 'vendor_categories.vendor_id', '=', 'users.id')
                ->where('vendor_categories.category_id', $categoryId)
                ->where('users.is_provider', 1)
                ->select('users.*')
                ->get();

            return response()->json(['status' => true, 'filtered' => true, 'vendors' => $vendors]);
        }

        $vendors = DB::table('users')
            ->where('is_provider', 1)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(['status' => true, 'filtered' => false, 'vendors' => $vendors]);
    }

    public function products(Request $request)
    {
        $categoryId = $request->category_id;

        if ($categoryId) {
            $products = DB::table('products')
                ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
        ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
        ->select(
            'products.*',
            'brands.name as brand_name',
            'brands.logo as brand_logo',
            'categories.name as category_name',
            'categories.image as category_image',
            'categories.photo as category_photo',
        )
                ->where('products.category_id', $categoryId)
                ->orWhere('products.subcategory_id', $categoryId)
                ->orWhere('products.childcategory_id', $categoryId)
                ->get();

            return response()->json(['status' => true, 'filtered' => true, 'products' => $products]);
        }

        return response()->json([
            'status' => true,
            'filtered' => false,
            'products' => DB::table('products')
              ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
        ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
        ->select(
            'products.*',
            'brands.name as brand_name',
            'brands.logo as brand_logo',
            'categories.name as category_name',
            'categories.image as category_image',
            'categories.photo as category_photo',
        )
              ->orderBy('products.id', 'desc')->get()
        ]);
    }

public function productDetails(Request $request)
{
    $productId = $request->product_id;

    if (!$productId) {
        return response()->json(['status' => false, 'message' => 'Product ID is required'], 400);
    }

    // Fetch the main product with brand and category details
    $product = DB::table('products')
        ->leftJoin('brands', 'products.brand_id', '=', 'brands.id')
        ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
        ->select(
            'products.*',
            'brands.name as brand_name',
            'brands.logo as brand_logo',
            'categories.name as category_name',
            'categories.image as category_image',
            'categories.photo as category_photo'
        )
        ->where('products.id', $productId)
        ->first();

    if (!$product) {
        return response()->json(['status' => false, 'message' => 'Product not found'], 404);
    }

    // Fetch galleries related to this product
    $galleries = DB::table('galleries')
        ->select('id', 'product_id', 'photo')
        ->where('product_id', $productId)
        ->orderBy('id', 'asc') // Order by ID to maintain upload order
        ->get()
        ->map(function ($gallery) {
            // Generate full image URL for gallery photos
            // Gallery images are stored in /assets/images/galleries/ (not /products/)
            if (!empty($gallery->photo)) {
                if (!preg_match('/^https?:\/\//', $gallery->photo)) {
                    $gallery->photo = 'https://proteinbros.in/assets/images/galleries/' . ltrim($gallery->photo, '/');
                }
            }
            return $gallery;
        });

    // Fetch ratings with user name
    $ratings = DB::table('ratings')
        ->leftJoin('users', 'ratings.user_id', '=', 'users.id')
        ->select(
            'ratings.id',
            'ratings.user_id',
            'users.name as user_name',
            'ratings.product_id',
            'ratings.review',
            'ratings.rating',
            'ratings.review_date'
        )
        ->where('ratings.product_id', $productId)
        ->orderBy('ratings.id', 'desc')
        ->get();

    // Calculate average rating
    $averageRating = DB::table('ratings')
        ->where('product_id', $productId)
        ->avg('rating');

    // Final API response
    return response()->json([
        'status' => true,
        'product' => $product,
        'galleries' => $galleries,
        'ratings' => $ratings,
        'average_rating' => $averageRating ? round($averageRating, 1) : 0,
    ]);
}

public function addReview(Request $request)
{
    // Map 'comment' to 'review' if 'comment' is provided (for compatibility)
    $reviewText = $request->input('review');
    if (!$reviewText && $request->has('comment')) {
        $reviewText = $request->input('comment');
    }
    
    // Validate required inputs
    $validator = Validator::make(array_merge($request->all(), ['review' => $reviewText]), [
        'user_id' => 'required|exists:users,id',
        'product_id' => 'required|exists:products,id',
        'review' => 'nullable|string',
        'rating' => 'required|numeric|min:1|max:5',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'errors' => $validator->errors(),
        ], 422);
    }

    // Prepare data for insert
    $data = [
        'user_id' => $request->user_id,
        'product_id' => $request->product_id,
        'review' => $reviewText,
        'rating' => $request->rating,
        'review_date' => now(),
    ];

    // Insert review
    DB::table('ratings')->insert($data);

    // Recalculate product average rating
    $averageRating = DB::table('ratings')
        ->where('product_id', $request->product_id)
        ->avg('rating');

    // Response
    return response()->json([
        'status' => true,
        'message' => 'Review added successfully.',
        'average_rating' => $averageRating ? round($averageRating, 1) : 0,
    ]);
}

public function editReview(Request $request)
{
    // Validate required inputs
    $validator = Validator::make($request->all(), [
        'user_id' => 'required|exists:users,id',
        'product_id' => 'required|exists:products,id',
        'review' => 'nullable|string',
        'rating' => 'required|numeric|min:1|max:5',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'errors' => $validator->errors(),
        ], 422);
    }

    // Check if review exists for this user and product
    $existingReview = DB::table('ratings')
        ->where('user_id', $request->user_id)
        ->where('product_id', $request->product_id)
        ->first();

    if (!$existingReview) {
        return response()->json([
            'status' => false,
            'message' => 'No existing review found for this product by this user.',
        ], 404);
    }

    // Update review
    DB::table('ratings')
        ->where('id', $existingReview->id)
        ->update([
            'review' => $request->review,
            'rating' => $request->rating,
            'review_date' => now(),
        ]);

    // Recalculate average rating
    $averageRating = DB::table('ratings')
        ->where('product_id', $request->product_id)
        ->avg('rating');

    // Response
    return response()->json([
        'status' => true,
        'message' => 'Review updated successfully.',
        'average_rating' => $averageRating ? round($averageRating, 1) : 0,
    ]);
}

    public function hotProducts(Request $request)
    {
        return $this->filterableProducts($request, 'hot');
    }
    public function flashProducts(Request $request)
    {
        return $this->filterableProducts($request, 'flash_deal');
    }

    public function latestProducts(Request $request)
    {
        return $this->filterableProducts($request, 'latest', true);
    }

    public function trendingProducts(Request $request)
    {
        return $this->filterableProducts($request, 'trending');
    }


    public function bestProducts(Request $request)
    {
        return $this->filterableProducts($request, 'best');
    }

    public function saleProducts(Request $request)
    {
        return $this->filterableProducts($request, 'sale');
    }

    
    private function filterableProducts(Request $request, $column, $latest = false)
{
    $categoryId = $request->category_id;
    $query = DB::table('products as p')
        ->where('p.' . $column, 1)
        ->leftJoin('brands as b', 'p.brand_id', '=', 'b.id')
        ->leftJoin('categories as c', 'p.category_id', '=', 'c.id')
        ->select(
            'p.*',
            'b.name as brand_name',
            'b.logo as brand_logo',
            'c.name as category_name',
            'c.image as category_image',
            'c.photo as category_photo'
        );

    if ($categoryId) {
        $query->where(function ($q) use ($categoryId) {
            $q->where('p.category_id', $categoryId)
              ->orWhere('p.subcategory_id', $categoryId)
              ->orWhere('p.childcategory_id', $categoryId);
        });
    }

    if ($latest) {
        $query->orderBy('p.id', 'desc');
    }

    // Get results
    $products = $query->get();

    return response()->json([
        'status' => true,
        'filtered' => $categoryId ? true : false,
        'products' => $products
    ]);
}

    
    public function addProduct(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
            'product_id' => 'required|integer|exists:products,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = $request->user_id;
        $productId = $request->product_id;

        // Check if already exists
        $exists = DB::table('recently_viewed_products')
            ->where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();

        if ($exists) {
            DB::table('recently_viewed_products')
                ->where('id', $exists->id)
                ->update(['viewed_at' => now()]);
        } else {
            DB::table('recently_viewed_products')->insert([
                'user_id' => $userId,
                'product_id' => $productId,
                'viewed_at' => now()
            ]);

            // Keep only latest 5
            $total = DB::table('recently_viewed_products')
                ->where('user_id', $userId)
                ->count();

            if ($total > 5) {
                $oldest = DB::table('recently_viewed_products')
                    ->where('user_id', $userId)
                    ->orderBy('viewed_at', 'asc')
                    ->first();

                if ($oldest) {
                    DB::table('recently_viewed_products')
                        ->where('id', $oldest->id)
                        ->delete();
                }
            }
        }

        return response()->json([
            'status' => true,
            'message' => 'Product added to recently viewed'
        ]);
    }

    public function getProducts(Request $request)
{
    $validator = Validator::make($request->all(), [
        'user_id' => 'required|integer|exists:users,id',
        'category_id' => 'nullable|integer|exists:categories,id',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    $userId = $request->user_id;
    $categoryId = $request->category_id;

    // Recent products viewed by user
    $recentProducts = DB::table('recently_viewed_products as r')
        ->join('products as p', 'r.product_id', '=', 'p.id')
        ->leftJoin('brands as b', 'p.brand_id', '=', 'b.id')
        ->leftJoin('categories as c', 'p.category_id', '=', 'c.id')
        ->where('r.user_id', $userId)
        ->orderBy('r.viewed_at', 'desc')
        ->limit(5)
        ->select(
            'p.*',
            'b.name as brand_name',
            'b.logo as brand_logo',
            'c.name as category_name',
            'c.image as category_image',
            'c.photo as category_photo',
            'r.viewed_at'
        )
        ->get();

    // Random products query
    $productsQuery = DB::table('products as p')
        ->leftJoin('brands as b', 'p.brand_id', '=', 'b.id')
        ->leftJoin('categories as c', 'p.category_id', '=', 'c.id')
        ->select(
            'p.*',
            'b.name as brand_name',
            'b.logo as brand_logo',
            'c.name as category_name',
            'c.image as category_image',
            'c.photo as category_photo'
        )
        ->inRandomOrder()
        ->take(10);

    // Apply category filter if provided
    if (!empty($categoryId)) {
        $productsQuery->where(function ($q) use ($categoryId) {
            $q->where('p.category_id', $categoryId)
              ->orWhere('p.subcategory_id', $categoryId)
              ->orWhere('p.childcategory_id', $categoryId);
        });
    }

    $products = $productsQuery->get();

    return response()->json([
        'status' => true,
        'recent_products' => $recentProducts,
        'products' => $products,
    ]);
}

    
   public function getProductsBySubCategory(Request $request)
{
    $validator = Validator::make($request->all(), [
        'subcategory_id' => 'required|integer|exists:subcategories,id',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    $subcategoryId = $request->subcategory_id;

    $products = DB::table('products as p')
        ->where('p.subcategory_id', $subcategoryId)
        ->leftJoin('brands as b', 'p.brand_id', '=', 'b.id')
        ->leftJoin('categories as c', 'p.category_id', '=', 'c.id')
        ->select(
            'p.*',
            'b.name as brand_name',
            'b.logo as brand_logo',
            'c.name as category_name',
            'c.image as category_image',
            'c.photo as category_photo'
        )
        ->get();

    return response()->json([
        'status' => true,
        'products' => $products
    ]);
}

public function getProductsByBrand(Request $request)
{
    $validator = Validator::make($request->all(), [
        'brand_id' => 'required|integer|exists:brands,id',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    $brandId = $request->brand_id;

    $products = DB::table('products as p')
        ->where('p.brand_id', $brandId)
        ->leftJoin('brands as b', 'p.brand_id', '=', 'b.id')
        ->leftJoin('categories as c', 'p.category_id', '=', 'c.id')
        ->select(
            'p.*',
            'b.name as brand_name',
            'b.logo as brand_logo',
            'c.name as category_name',
            'c.image as category_image',
            'c.photo as category_photo'
        )
        ->get();

    return response()->json([
        'status' => true,
        'products' => $products
    ]);
}

    
    
    
    public function toggleWishlistProduct(Request $request)
{

    $validator = Validator::make($request->all(), [
        'user_id' => 'required|integer|exists:users,id',
        'product_id' => 'required|integer|exists:products,id',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    $userId = $request->user_id;
    $productId = $request->product_id;
    $exists = DB::table('wishlists')
        ->where('user_id', $userId)
        ->where('product_id', $productId)
        ->first();
    if ($exists) {
        DB::table('wishlists')
            ->where('id', $exists->id)
            ->delete();

        return response()->json([
            'status' => true,
            'action' => 'removed',
            'message' => 'Product removed from wishlist'
        ]);
    } else {
        DB::table('wishlists')->insert([
            'user_id' => $userId,
            'product_id' => $productId
        ]);

        $total = DB::table('wishlists')
            ->where('user_id', $userId)
            ->count();

        if ($total > 15) {
            $oldest = DB::table('wishlists')
                ->where('user_id', $userId)
                ->orderBy('id', 'asc')
                ->first();

            if ($oldest) {
                DB::table('wishlists')
                    ->where('id', $oldest->id)
                    ->delete();
            }
        }

        return response()->json([
            'status' => true,
            'action' => 'added',
            'message' => 'Product added to wishlist'
        ]);
    }
}
    public function getWishlistProducts(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $userId = $request->user_id;

       $recentProducts = DB::table('wishlists as r')
    ->join('products as p', 'r.product_id', '=', 'p.id')
    ->leftJoin('brands as b', 'p.brand_id', '=', 'b.id')
    ->leftJoin('categories as c', 'p.category_id', '=', 'c.id')
    ->where('r.user_id', $userId)
    ->orderBy('r.id', 'desc')
    ->select(
        'p.*',
        'b.name as brand_name',
        'b.logo as brand_logo',
        'c.name as category_name',
        'c.image as category_image',
        'c.photo as category_photo',
        'r.id as wishlist_id' 
    )
    ->get();


        return response()->json([
            'status' => true,
            'wishlist_products' => $recentProducts
        ]);
    }

}
