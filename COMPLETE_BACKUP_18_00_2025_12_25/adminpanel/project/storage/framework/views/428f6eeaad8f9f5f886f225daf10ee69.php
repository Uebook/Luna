<!--==================== Header Section Start ====================-->
<header class="ecommerce-header px-lg-5">
    <div class="top-header d-none d-lg-block py-2 border-0 font-400">
        <div class="container-fluid">
            <div class="row align-items-center">
                <div class="col-lg-4 sm-mx-none">
                    <a href="javascript:;" class="text-general"><span><?php echo e(__('Contact & Support')); ?> :
                            <?php echo e($ps->phone); ?></span></a>
                </div>
                <div class="col-lg-8 d-flex">
                    <ul class="top-links d-flex ms-auto align-items-center">
                        <?php if(Auth::guard('web')->check() && Auth::guard('web')->user()->is_vendor == 2): ?>
                        <li><a class="border px-3 py-1" href="<?php echo e(route('vendor.dashboard')); ?>"><?php echo e(__('Vendor Panel')); ?></a>
                        </li>
                        <?php else: ?>
                        <li><a class="border px-3 py-1" href="<?php echo e(route('vendor.register')); ?>"><?php echo e(__('Sell')); ?></a></li>
                        <?php endif; ?>

                        <?php if(!Auth::guard('rider')->check()): ?>
                        <li><a class="border px-3 py-1" href="<?php echo e(route('rider.login')); ?>"><?php echo e(__('Rider Login')); ?></a></li>
                        <?php endif; ?>

                        <li class="my-account-dropdown">
                            <?php
                            $languges = App\Models\Language::all();
                            ?>
                            <div class="language-selector nice-select">
                                <i class="fas fa-globe-americas text-dark"></i>
                                <select name="language" class="language selectors nice select2-js-init">
                                    <?php $__currentLoopData = $languges; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $language): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <option value="<?php echo e(route('front.language',$language->id)); ?>" <?php echo e(Session::has('language') ? ( Session::get('language')==$language->id ?
                                        'selected' : '' ) : ($languges->where('is_default','=',1)->first()->id ==
                                        $language->id ? 'selected' : '')); ?> >
                                        <?php echo e($language->language); ?>

                                    </option>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                </select>
                            </div>
                        </li>
                        <?php
                        $currencies = App\Models\Currency::all();
                        ?>
                        <li class="my-account-dropdown">
                            <div class="currency-selector nice-select">
                                <span class="text-dark">
                                    <?php echo e(Session::has('currency') ?
                                    $currencies->where('id','=',Session::get('currency'))->first()->sign :
                                    DB::table('currencies')->where('is_default','=',1)->first()->sign); ?>

                                </span>
                                <select name="currency" class="currency selectors nice select2-js-init">
                                    <?php $__currentLoopData = $currencies; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $currency): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <option value="<?php echo e(route('front.currency',$currency->id)); ?>" <?php echo e(Session::has('currency') ? ( Session::get('currency')==$currency->id ?
                                        'selected' : '' ) : ($currencies->where('is_default','=',1)->first()->id ==
                                        $currency->id ? 'selected' : '')); ?>>
                                        <?php echo e($currency->name); ?>

                                    </option>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                </select>
                            </div>
                        </li>


                        <li class="my-account-dropdown">
                            <a href="my-account.html" class="has-dropdown"><i
                                    class="flaticon-user-3 flat-mini me-1"></i><?php echo e(__('My Account')); ?></a>
                            <ul class="my-account-popup">
                                <?php if(Auth::guard('web')->check()): ?>
                                <li><a href="<?php echo e(route('user-dashboard')); ?>"><span class="menu-item-text"><?php echo e(('User
                                            Panel')); ?></span></a></li>
                                <?php if(Auth::guard('web')->user()->IsVendor()): ?>
                                <li><a href="<?php echo e(route('vendor.dashboard')); ?>"><span class="menu-item-text"><?php echo e(__('Vendor
                                            Panel')); ?></span></a></li>
                                <?php endif; ?>
                                <li><a href="<?php echo e(route('user-profile')); ?>"><span class="menu-item-text"><?php echo e(__('Edit
                                            Profile')); ?></span></a></li>
                                <li><a href="<?php echo e(route('user-logout')); ?>"><span class="menu-item-text"><?php echo e(__('Logout')); ?></span></a></li>

                                <?php elseif(Auth::guard('rider')->check()): ?>
                                <li><a href="<?php echo e(route('rider-dashboard')); ?>"><span class="menu-item-text"><?php echo e(('Rider
                                            Panel')); ?></span></a></li>
                                <li><a href="<?php echo e(route('rider-profile')); ?>"><span class="menu-item-text"><?php echo e(__('Edit
                                            Profile')); ?></span></a></li>
                                <li><a href="<?php echo e(route('rider-logout')); ?>"><span class="menu-item-text"><?php echo e(__('Logout')); ?></span></a></li>

                                <?php else: ?>
                                <li><a href="<?php echo e(route('user.login')); ?>"><span class="menu-item-text sign-in"><?php echo e(__('User
                                            Login')); ?></span></a></li>
                                <li><a href="<?php echo e(route('rider.login')); ?>"><span class="menu-item-text sign-in"><?php echo e(__('Rider Login')); ?></span></a></li>
                                <li><a href="<?php echo e(route('user.register')); ?>"><span class="menu-item-text join"><?php echo e(__('Join')); ?></span></a></li>
                                <?php endif; ?>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>


    <?php
    $categories = App\Models\Category::with('subs')->where('status',1)->get();
    $pages = App\Models\Page::get();
    ?>
    <div class="main-nav py-4 d-none d-lg-block">
        <div class="container-fluid">
            <div class="row">
                <div class="col-xl-7 col-lg-9">
                    <nav class="navbar navbar-expand-lg nav-dark nav-primary-hover nav-line-active">
                        <a class="navbar-brand" href="<?php echo e(route('front.index')); ?>"><img class="nav-logo "
                                src="<?php echo e(asset('assets/images/'.$gs->logo)); ?>" alt="Image not found !"></a>
                        <button class="navbar-toggler" type="button" data-toggle="collapse"
                            data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                            aria-expanded="false" aria-label="Toggle navigation">
                            <i class="flaticon-menu-2 flat-small text-primary"></i>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul class="navbar-nav ms-md-5">
                                <li class="nav-item dropdown <?php echo e(request()->path() == '/' ? 'active':''); ?>">
                                    <a class="nav-link dropdown-toggle" href="<?php echo e(route('front.index')); ?>"><?php echo e(__('Home')); ?></a>
                                </li>
                                <li class="nav-item dropdown mega-dropdown">
                                    <a class="nav-link dropdown-toggle" href="<?php echo e(route('front.category')); ?>"><?php echo e(__('Product')); ?></a>
                                    <ul class="dropdown-menu mega-dropdown-menu">
                                        <li class="mega-container">
                                            <div class="row row-cols-lg-4 row-cols-sm-2 row-cols-1">

                                                <?php $__currentLoopData = $categories; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $category): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                <div class="col">
                                                    <span
                                                        class="d-inline-block px-3 font-600 text-uppercase text-secondary pb-2"><?php echo e($category->name); ?></span>
                                                    <ul>
                                                        <?php if($category->subs->count() > 0): ?>
                                                        <?php $__currentLoopData = $category->subs; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $subcategory): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                        <li><a class="dropdown-item"
                                                                href="<?php echo e(route('front.category', [$category->slug, $subcategory->slug])); ?><?php echo e(!empty(request()->input('search')) ? '?search='.request()->input('search') : ''); ?>"><?php echo e($subcategory->name); ?></a>
                                                        </li>
                                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                                        <?php endif; ?>
                                                    </ul>
                                                </div>
                                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>

                                            </div>
                                        </li>
                                    </ul>
                                </li>
                                <li class="nav-item dropdown ">
                                    <a class="nav-link dropdown-toggle" href="#"><?php echo e(__('Pages')); ?></a>
                                    <ul class="dropdown-menu">
                                        <?php $__currentLoopData = $pages->where('header','=',1); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $data): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                        <li><a class="dropdown-item" href="<?php echo e(route('front.vendor',$data->slug)); ?>"><?php echo e($data->title); ?></a></li>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                    </ul>
                                </li>
                                <li class="nav-item dropdown <?php echo e(request()->path()=='blog' ? 'active' : ''); ?>">
                                    <a class="nav-link dropdown-toggle" href="<?php echo e(route('front.blog')); ?>"><?php echo e(__('Blog')); ?></a>
                                </li>
                                <li class="nav-item dropdown <?php echo e(request()->path()=='faq' ? 'active' : ''); ?>">
                                    <a class="nav-link dropdown-toggle" href="<?php echo e(route('front.faq')); ?>"><?php echo e(__('FAQ')); ?></a>
                                </li>

                                <li class="nav-item <?php echo e(request()->path()=='contact' ? 'active' : ''); ?>"><a
                                        class="nav-link" href="<?php echo e(route('front.contact')); ?>"><?php echo e(__('Contact')); ?></a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
                <div class="col-xl-5 col-lg-3">
                    <div class="margin-right-1 d-flex align-items-center justify-content-end h-100">
                        <div class="product-search-one flex-grow-1 global-search touch-screen-view">
                            <form id="searchForm" class="search-form form-inline search-pill-shape"
                                action="<?php echo e(route('front.category', [Request::route('category'),Request::route('subcategory'),Request::route('childcategory')])); ?>"
                                method="GET">

                                <?php if(!empty(request()->input('sort'))): ?>
                                <input type="hidden" name="sort" value="<?php echo e(request()->input('sort')); ?>">
                                <?php endif; ?>
                                <?php if(!empty(request()->input('minprice'))): ?>
                                <input type="hidden" name="minprice" value="<?php echo e(request()->input('minprice')); ?>">
                                <?php endif; ?>
                                <?php if(!empty(request()->input('maxprice'))): ?>
                                <input type="hidden" name="maxprice" value="<?php echo e(request()->input('maxprice')); ?>">
                                <?php endif; ?>
                                <input type="text" id="prod_name" class="col form-control search-field " name="search"
                                    placeholder="Search Product For" value="<?php echo e(request()->input('search')); ?>">
                                <div class=" categori-container select-appearance-none " id="catSelectForm">
                                    <select name="category" class="form-control categoris select2-js-search-init">
                                        <option selected=""><?php echo e(__('All Categories')); ?></option>
                                        <?php $__currentLoopData = $categories->where('status',1); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $data): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                        <option value="<?php echo e($data->slug); ?>" <?php echo e(Request::route('category')==$data->slug ?
                                            'selected' : ''); ?>>
                                            <?php echo e($data->name); ?>

                                        </option>
                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                    </select>
                                </div>
                                <button type="submit" name="submit" class="search-submit"><i
                                        class="flaticon-search flat-mini text-white"></i></button>

                            </form>
                        </div>
                        <div class="autocomplete">
                            <div id="myInputautocomplete-list" class="autocomplete-items"></div>
                        </div>

                        <div class="search-view d-xxl-none">
                            <a href="#" class="search-pop top-quantity d-flex align-items-center text-decoration-none">
                                <i class="flaticon-search flat-mini text-dark mx-auto"></i>
                            </a>
                        </div>
                        <div class="header-cart-1">
                            <?php if(Auth::guard('web')->check()): ?>
                            <a href="<?php echo e(route('user-wishlists')); ?>" class="cart " title="View Wishlist">
                                <div class="cart-icon"><i class="flaticon-like flat-mini mx-auto text-dark"></i> <span
                                        class="header-cart-count " id="wishlist-count"><?php echo e(Auth::guard('web')->user()->wishlistCount()); ?></span></div>
                            </a>
                            <?php else: ?>
                            <a href="<?php echo e(route('user.login')); ?>" class="cart " title="View Wishlist">
                                <div class="cart-icon"><i class="flaticon-like flat-mini mx-auto text-dark"></i> <span
                                        class="header-cart-count" id="wishlist-count"><?php echo e(0); ?></span></div>
                            </a>
                            <?php endif; ?>
                        </div>

                        <div class="header-cart-1">
                            <a href="<?php echo e(route('product.compare')); ?>" class="cart " title="Compare">
                                <div class="cart-icon"><i class="flaticon-shuffle flat-mini mx-auto text-dark"></i>
                                    <span class="header-cart-count " id="compare-count"><?php echo e(Session::has('compare') ?
                                        count(Session::get('compare')->items) : '0'); ?></span>
                                </div>
                            </a>
                        </div>

                        <div class="header-cart-1">
                            <a href="<?php echo e(route('front.cart')); ?>" class="cart has-cart-data" title="View Cart">
                                <div class="cart-icon"><i class="flaticon-shopping-cart flat-mini"></i> <span
                                        class="header-cart-count" id="cart-count1"><?php echo e(Session::has('cart') ?
                                        count(Session::get('cart')->items) : '0'); ?></span></div>
                                <div class="cart-wrap">
                                    <div class="cart-text"><?php echo app('translator')->get('Cart'); ?></div>
                                    <span class="header-cart-count"><?php echo e(Session::has('cart') ?
                                        count(Session::get('cart')->items) : '0'); ?></span>
                                </div>
                            </a>
                            <?php echo $__env->make('load.cart', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="header-sticky bg-white py-10">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-xxl-2 col-xl-2 col-lg-3 col-6 order-lg-1">
                    <div class="d-flex align-items-center h-100 md-py-10">
                        <div class="nav-leftpush-overlay">
                            <nav class="navbar navbar-expand-lg nav-general nav-primary-hover">
                                <button type="button" class="push-nav-toggle d-lg-none border-0">
                                    <i class="flaticon-menu-2 flat-small text-primary"></i>
                                </button>
                                <div class="navbar-slide-push transation-this">
                                    <div
                                        class="login-signup bg-secondary d-flex justify-content-between py-10 px-20 align-items-center">
                                        <a href="<?php echo e(route('user.login')); ?>" class="d-flex align-items-center text-white">
                                            <i class="flaticon-user flat-small me-1"></i>
                                            <span>Login/Signup</span>
                                        </a>
                                        <span class="slide-nav-close"><i
                                                class="flaticon-cancel flat-mini text-white"></i></span>
                                    </div>
                                    <div class="menu-and-category">
                                        <ul class="nav nav-pills wc-tabs" id="menu-and-category" role="tablist">
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link active" id="pills-push-menu-tab"
                                                    data-bs-toggle="pill" href="#pills-push-menu" role="tab"
                                                    aria-controls="pills-push-menu" aria-selected="true">Menu</a>
                                            </li>
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link" id="pills-push-categories-tab" data-bs-toggle="pill"
                                                    href="#pills-push-categories" role="tab"
                                                    aria-controls="pills-push-categories"
                                                    aria-selected="true">Categories</a>
                                            </li>
                                        </ul>
                                        <div class="tab-content" id="menu-and-categoryContent">
                                            <div class="tab-pane fade show active woocommerce-Tabs-panel woocommerce-Tabs-panel--description"
                                                id="pills-push-menu" role="tabpanel"
                                                aria-labelledby="pills-push-menu-tab">
                                                <div class="push-navbar">
                                                    <ul class="navbar-nav">
                                                        <li class="nav-item">
                                                            <a class="nav-link" href="<?php echo e(route('front.index')); ?>"><?php echo e(__('Home')); ?></a>
                                                        </li>
                                                        <li class="nav-item ">
                                                            <a class="nav-link" href="<?php echo e(route('front.category')); ?>"><?php echo e(__('PRODUCT')); ?></a>
                                                        </li>
                                                        <li class="nav-item dropdown">
                                                            <a class="nav-link dropdown-toggle" href="#"><?php echo e(__('Pages')); ?></a>
                                                            <ul class="dropdown-menu">
                                                                <?php $__currentLoopData = $pages->where('header','=',1); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $data): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                                <li><a class="dropdown-item"
                                                                        href="<?php echo e(route('front.vendor',$data->slug)); ?>"><?php echo e($data->title); ?></a></li>
                                                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                                            </ul>
                                                        </li>
                                                        <li class="nav-item">
                                                            <a class="nav-link" href="<?php echo e(route('front.blog')); ?>"><?php echo e(__('Blog')); ?></a>
                                                        </li>

                                                        <li class="nav-item">
                                                            <a class="nav-link" href="<?php echo e(route('front.faq')); ?>"><?php echo e(__('FAQ')); ?></a>
                                                        </li>
                                                        <li class="nav-item"><a class="nav-link"
                                                                href="<?php echo e(route('front.contact')); ?>"><?php echo e(__('Contact')); ?></a></li>
                                                    </ul>

                                                </div>
                                            </div>
                                            <div class="tab-pane fade" id="pills-push-categories" role="tabpanel"
                                                aria-labelledby="pills-push-categories-tab">
                                                <div class="categories-menu">
                                                    <ul class="menu">
                                                        <?php $__currentLoopData = $categories; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $category): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                                        <li class="menu-item-has-children"><a
                                                                href="<?php echo e(route('front.category',$category->slug)); ?>"><?php echo e($category->name); ?></a>
                                                        </li>
                                                        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </nav>
                        </div>
                        <a class="navbar-brand" href="<?php echo e(route('front.index')); ?>"><img class="nav-logo"
                                src="<?php echo e(asset('assets/images/'.$gs->logo)); ?>" alt="Image not found !"></a>
                    </div>
                </div>
                <div class="col-xxl-3 col-xl-4 col-lg-3 col-6 order-lg-3">
                    <div class="margin-right-1 d-flex align-items-center justify-content-end h-100 md-py-10">
                        <div class="sign-in position-relative font-general my-account-dropdown">
                            <a href="my-account.html"
                                class="has-dropdown d-flex align-items-center text-dark text-decoration-none"
                                title="My Account">
                                <i class="flaticon-user-3 flat-mini me-1 mx-auto"></i>
                            </a>
                            <ul class="my-account-popup">
                                <?php if(Auth::guard('web')->check()): ?>
                                <li><a href="<?php echo e(route('user-dashboard')); ?>"><span class="menu-item-text"><?php echo e(('User
                                            Panel')); ?></span></a></li>
                                <?php if(Auth::guard('web')->user()->IsVendor()): ?>
                                <li><a href="<?php echo e(route('vendor.dashboard')); ?>"><span class="menu-item-text"><?php echo e(__('Vendor
                                            Panel')); ?></span></a></li>
                                <?php endif; ?>
                                <li><a href="<?php echo e(route('user-profile')); ?>"><span class="menu-item-text"><?php echo e(__('Edit
                                            Profile')); ?></span></a></li>
                                <li><a href="<?php echo e(route('user-logout')); ?>"><span class="menu-item-text"><?php echo e(__('Logout')); ?></span></a></li>

                                <?php elseif(Auth::guard('rider')->check()): ?>
                                <li><a href="<?php echo e(route('rider-dashboard')); ?>"><span class="menu-item-text"><?php echo e(('User
                                            Panel')); ?></span></a></li>
                                <li><a href="<?php echo e(route('rider-profile')); ?>"><span class="menu-item-text"><?php echo e(__('Edit
                                            Profile')); ?></span></a></li>
                                <li><a href="<?php echo e(route('rider-logout')); ?>"><span class="menu-item-text"><?php echo e(__('Logout')); ?></span></a></li>
                                <?php else: ?>
                                <li><a href="<?php echo e(route('user.login')); ?>"><span class="menu-item-text sign-in"><?php echo e(__('User
                                            Login')); ?></span></a></li>
                                <li><a href="<?php echo e(route('rider.login')); ?>"><span class="menu-item-text sign-in"><?php echo e(__('Rider Login')); ?></span></a></li>
                                <li><a href="<?php echo e(route('user.register')); ?>"><span class="menu-item-text join"><?php echo e(__('Join')); ?></span></a></li>
                                <?php endif; ?>
                            </ul>
                        </div>


                        <?php if(Auth::check()): ?>
                        <div class="wishlist-view">
                            <a href="<?php echo e(route('user-wishlists')); ?>"
                                class="position-relative top-quantity d-flex align-items-center text-white text-decoration-none">
                                <i class="flaticon-like flat-mini text-dark mx-auto"></i>
                            </a>
                        </div>
                        <?php else: ?>
                        <div class="wishlist-view">
                            <a href="<?php echo e(route('user.login')); ?>"
                                class="position-relative top-quantity d-flex align-items-center text-white text-decoration-none">
                                <i class="flaticon-like flat-mini text-dark mx-auto"></i>
                            </a>
                        </div>
                        <?php endif; ?>

                        <div class="refresh-view">
                            <a href="<?php echo e(route('product.compare')); ?>"
                                class="position-relative top-quantity d-flex align-items-center text-dark text-decoration-none">
                                <i class="flaticon-shuffle flat-mini text-dark mx-auto"></i>
                            </a>
                        </div>
                        <div class="header-cart-1">
                            <a href="<?php echo e(route('front.cart')); ?>" class="cart has-cart-data" title="View Cart">
                                <div class="cart-icon"><i class="flaticon-shopping-cart flat-mini"></i> <span
                                        class="header-cart-count" id="cart-count"><?php echo e(Session::has('cart') ?
                                        count(Session::get('cart')->items) : '0'); ?></span></div>
                                <div class="cart-wrap">
                                    <div class="cart-text">Cart</div>
                                    <span class="header-cart-count"><?php echo e(Session::has('cart') ?
                                        count(Session::get('cart')->items) : '0'); ?></span>
                                </div>
                            </a>
                            <?php echo $__env->make('load.cart', \Illuminate\Support\Arr::except(get_defined_vars(), ['__data', '__path']))->render(); ?>
                        </div>
                    </div>
                </div>
                <div class="col-xxl-7 col-xl-6 col-lg-6 col-12 order-lg-2">
                    <div class="product-search-one">

                        <form id="searchForm" class="search-form form-inline search-pill-shape"
                            action="<?php echo e(route('front.category', [Request::route('category'),Request::route('subcategory'),Request::route('childcategory')])); ?>"
                            method="GET">

                            <?php if(!empty(request()->input('sort'))): ?>
                            <input type="hidden" name="sort" value="<?php echo e(request()->input('sort')); ?>">
                            <?php endif; ?>
                            <?php if(!empty(request()->input('minprice'))): ?>
                            <input type="hidden" name="minprice" value="<?php echo e(request()->input('minprice')); ?>">
                            <?php endif; ?>
                            <?php if(!empty(request()->input('maxprice'))): ?>
                            <input type="hidden" name="maxprice" value="<?php echo e(request()->input('maxprice')); ?>">
                            <?php endif; ?>
                            <input type="text" id="prod_name" class="col form-control search-field " name="search"
                                placeholder="Search Product For" value="<?php echo e(request()->input('search')); ?>">
                            <div class=" categori-container select-appearance-none " id="catSelectForm">
                                <select name="category" class="form-control categoris select2-js-search-init">
                                    <option selected=""><?php echo e(__('All Categories')); ?></option>
                                    <?php $__currentLoopData = $categories->where('status',1); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $data): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <option value="<?php echo e($data->slug); ?>" <?php echo e(Request::route('category')==$data->slug ?
                                        'selected' : ''); ?>>
                                        <?php echo e($data->name); ?>

                                    </option>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                </select>
                            </div>
                            <button type="submit" name="submit" class="search-submit"><i
                                    class="flaticon-search flat-mini text-white"></i></button>

                        </form>



                    </div>
                </div>
            </div>
        </div>
    </div>
</header>
<!--==================== Header Section End ====================--><?php /**PATH /Users/vansh/ReactProject/Luna/LunaEcom/adminpanel/project/resources/views/partials/global/common-header.blade.php ENDPATH**/ ?>