<?php

namespace App\Providers;

use App\Models\Currency;
use App\Models\Font;
use App\Models\Language;
use Illuminate\Pagination\LengthAwarePaginator;use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot()
    {

        Cache::flush();
        Paginator::useBootstrap();
        view()->composer('*', function ($settings) {

            try {
                $settings->with('gs', cache()->remember('generalsettings', now()->addDay(), function () {
                    return DB::table('generalsettings')->first();
                }));

                $settings->with('ps', cache()->remember('pagesettings', now()->addDay(), function () {
                    return DB::table('pagesettings')->first();
                }));

                $settings->with('seo', cache()->remember('seotools', now()->addDay(), function () {
                    return DB::table('seotools')->first();
                }));
                $settings->with('socialsetting', cache()->remember('socialsettings', now()->addDay(), function () {
                    return DB::table('socialsettings')->first();
                }));

                $settings->with('default_font', cache()->remember('default_font', now()->addDay(), function () {
                    return Font::whereIsDefault(1)->first();
                }));

                if (Session::has('currency')) {
                    $settings->with('curr', Currency::find(Session::get('currency')));
                } else {
                    $settings->with('curr', Currency::where('is_default', '=', 1)->first());
                }

                if (Session::has('language')) {
                    $settings->with('langg', Language::find(Session::get('language')));
                } else {
                    $settings->with('langg', Language::where('is_default', '=', 1)->first());
                }

                $settings->with('footer_blogs', DB::table('blogs')->orderby('id', 'desc')->limit(3)->get());
            } catch (\Exception $e) {
                $actual_path = str_replace('project', '', base_path());
                if (is_dir($actual_path . '/install')) {
                    echo '<meta http-equiv="refresh" content="0; url=' . url('/install') . '" />';
                }
            }
        });
    }

    public function register()
    {
        Collection::macro('paginate', function ($perPage, $total = null, $page = null, $pageName = 'page') {
            $page = $page ?: LengthAwarePaginator::resolveCurrentPage($pageName);
            return new LengthAwarePaginator(
                $this->forPage($page, $perPage),
                $total ?: $this->count(),
                $perPage,
                $page,
                [
                    'path' => LengthAwarePaginator::resolveCurrentPath(),
                    'pageName' => $pageName,
                ]
            );
        });
    }
}
