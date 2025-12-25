@extends('master')
@section('title', __('Stream Details'))
@section('content')
<div class="page-content">
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">{{ __('Stream Details') }}</h4>
                        <a href="{{ route('admin-livestream-index') }}" class="btn btn-primary btn-sm">{{ __('Back') }}</a>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h5>{{ __('Stream Information') }}</h5>
                                <table class="table table-bordered">
                                    <tr>
                                        <th>{{ __('Title') }}</th>
                                        <td>{{ $stream->title }}</td>
                                    </tr>
                                    <tr>
                                        <th>{{ __('Description') }}</th>
                                        <td>{{ $stream->description ?? 'N/A' }}</td>
                                    </tr>
                                    <tr>
                                        <th>{{ __('Broadcaster') }}</th>
                                        <td>{{ $stream->user->name ?? 'N/A' }}</td>
                                    </tr>
                                    <tr>
                                        <th>{{ __('Channel Name') }}</th>
                                        <td>{{ $stream->channel_name }}</td>
                                    </tr>
                                    <tr>
                                        <th>{{ __('Status') }}</th>
                                        <td>
                                            @if($stream->status == 'live')
                                                <span class="badge badge-success">{{ __('Live') }}</span>
                                            @elseif($stream->status == 'ended')
                                                <span class="badge badge-danger">{{ __('Ended') }}</span>
                                            @else
                                                <span class="badge badge-warning">{{ __('Scheduled') }}</span>
                                            @endif
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>{{ __('Viewer Count') }}</th>
                                        <td>{{ $stream->viewer_count }}</td>
                                    </tr>
                                    <tr>
                                        <th>{{ __('Likes Count') }}</th>
                                        <td>{{ $stream->likes_count }}</td>
                                    </tr>
                                    <tr>
                                        <th>{{ __('Started At') }}</th>
                                        <td>{{ $stream->started_at ? $stream->started_at->format('Y-m-d H:i:s') : 'N/A' }}</td>
                                    </tr>
                                    <tr>
                                        <th>{{ __('Ended At') }}</th>
                                        <td>{{ $stream->ended_at ? $stream->ended_at->format('Y-m-d H:i:s') : 'N/A' }}</td>
                                    </tr>
                                </table>
                                
                                @if($stream->status == 'live')
                                    <a href="{{ route('admin-livestream-end', $stream->id) }}" class="btn btn-danger" onclick="return confirm('Are you sure?')">
                                        {{ __('End Stream') }}
                                    </a>
                                @endif
                            </div>
                            <div class="col-md-6">
                                <h5>{{ __('Products in Stream') }} ({{ $stream->products->count() }})</h5>
                                <a href="{{ route('admin-livestream-products', $stream->id) }}" class="btn btn-info btn-sm mb-3">
                                    {{ __('Manage Products') }}
                                </a>
                                <div class="table-responsive">
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>{{ __('Product') }}</th>
                                                <th>{{ __('Price') }}</th>
                                                <th>{{ __('Featured') }}</th>
                                                <th>{{ __('Order') }}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @forelse($stream->products as $sp)
                                                <tr>
                                                    <td>{{ $sp->product->name ?? 'N/A' }}</td>
                                                    <td>${{ $sp->product->price ?? '0.00' }}</td>
                                                    <td>
                                                        @if($sp->is_featured)
                                                            <span class="badge badge-success">{{ __('Yes') }}</span>
                                                        @else
                                                            <span class="badge badge-secondary">{{ __('No') }}</span>
                                                        @endif
                                                    </td>
                                                    <td>{{ $sp->display_order }}</td>
                                                </tr>
                                            @empty
                                                <tr>
                                                    <td colspan="4" class="text-center">{{ __('No products added') }}</td>
                                                </tr>
                                            @endforelse
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection




