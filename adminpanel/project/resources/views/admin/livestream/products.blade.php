@extends('master')
@section('title', __('Manage Stream Products'))
@section('content')
<div class="page-content">
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">{{ __('Manage Products for Stream') }}: {{ $stream->title }}</h4>
                        <a href="{{ route('admin-livestream-show', $stream->id) }}" class="btn btn-primary btn-sm">{{ __('Back') }}</a>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h5>{{ __('Current Products') }}</h5>
                                <div class="table-responsive">
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>{{ __('Product') }}</th>
                                                <th>{{ __('Featured') }}</th>
                                                <th>{{ __('Order') }}</th>
                                                <th>{{ __('Action') }}</th>
                                            </tr>
                                        </thead>
                                        <tbody id="current-products">
                                            @forelse($stream->products as $sp)
                                                <tr data-product-id="{{ $sp->product_id }}">
                                                    <td>{{ $sp->product->name ?? 'N/A' }}</td>
                                                    <td>
                                                        <input type="checkbox" class="featured-checkbox" 
                                                               data-product-id="{{ $sp->product_id }}"
                                                               {{ $sp->is_featured ? 'checked' : '' }}>
                                                    </td>
                                                    <td>
                                                        <input type="number" class="form-control order-input" 
                                                               value="{{ $sp->display_order }}"
                                                               data-product-id="{{ $sp->product_id }}"
                                                               style="width: 80px;">
                                                    </td>
                                                    <td>
                                                        <button class="btn btn-danger btn-sm remove-product" 
                                                                data-product-id="{{ $sp->product_id }}">
                                                            {{ __('Remove') }}
                                                        </button>
                                                    </td>
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
                            <div class="col-md-6">
                                <h5>{{ __('Add Products') }}</h5>
                                <div class="form-group">
                                    <input type="text" id="product-search" class="form-control" 
                                           placeholder="{{ __('Search products...') }}">
                                </div>
                                <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>{{ __('Product') }}</th>
                                                <th>{{ __('Price') }}</th>
                                                <th>{{ __('Action') }}</th>
                                            </tr>
                                        </thead>
                                        <tbody id="available-products">
                                            <tr>
                                                <td colspan="3" class="text-center">{{ __('Search for products to add') }}</td>
                                            </tr>
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

<script>
$(document).ready(function() {
    const streamId = {{ $stream->id }};
    
    // Search products
    $('#product-search').on('keyup', debounce(function() {
        const search = $(this).val();
        if (search.length >= 2) {
            loadAvailableProducts(search);
        }
    }, 500));
    
    function loadAvailableProducts(search = '') {
        $.ajax({
            url: '{{ route('admin-livestream-products-available', $stream->id) }}',
            type: 'GET',
            data: { search: search },
            success: function(response) {
                if (response.success) {
                    let html = '';
                    if (response.products.length > 0) {
                        response.products.forEach(product => {
                            html += `
                                <tr>
                                    <td>${product.name}</td>
                                    <td>$${product.price}</td>
                                    <td>
                                        <button class="btn btn-success btn-sm add-product" 
                                                data-product-id="${product.id}">
                                            {{ __('Add') }}
                                        </button>
                                    </td>
                                </tr>
                            `;
                        });
                    } else {
                        html = '<tr><td colspan="3" class="text-center">{{ __('No products found') }}</td></tr>';
                    }
                    $('#available-products').html(html);
                }
            }
        });
    }
    
    // Add product
    $(document).on('click', '.add-product', function() {
        const productId = $(this).data('product-id');
        $.ajax({
            url: '{{ route('admin-livestream-products-add', $stream->id) }}',
            type: 'POST',
            data: {
                product_id: productId,
                _token: '{{ csrf_token() }}'
            },
            success: function(response) {
                if (response.success) {
                    location.reload();
                } else {
                    alert(response.message || 'Error adding product');
                }
            }
        });
    });
    
    // Remove product
    $(document).on('click', '.remove-product', function() {
        if (!confirm('Are you sure?')) return;
        const productId = $(this).data('product-id');
        $.ajax({
            url: `/admin/livestream/${streamId}/products/${productId}/remove`,
            type: 'POST',
            data: {
                _token: '{{ csrf_token() }}'
            },
            success: function(response) {
                if (response.success) {
                    location.reload();
                }
            }
        });
    });
    
    // Update order
    $(document).on('change', '.order-input', function() {
        const productId = $(this).data('product-id');
        const order = $(this).val();
        $.ajax({
            url: '{{ route('admin-livestream-products-update', $stream->id) }}',
            type: 'POST',
            data: {
                product_id: productId,
                display_order: order,
                _token: '{{ csrf_token() }}'
            }
        });
    });
    
    // Update featured
    $(document).on('change', '.featured-checkbox', function() {
        const productId = $(this).data('product-id');
        const featured = $(this).is(':checked') ? 1 : 0;
        $.ajax({
            url: '{{ route('admin-livestream-products-update', $stream->id) }}',
            type: 'POST',
            data: {
                product_id: productId,
                is_featured: featured,
                _token: '{{ csrf_token() }}'
            }
        });
    });
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
</script>
@endsection



