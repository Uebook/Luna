@extends('layouts.load')

@section('content')
<div class="content-area">
    <div class="mr-breadcrumb">
        <div class="row">
            <div class="col-lg-12">
                <h4 class="heading">{{ __("Add New Gift Card") }} <a class="add-btn" href="{{ route('admin-giftcard-index') }}"><i class="fas fa-arrow-left"></i> {{ __("Back") }}</a></h4>
                <ul class="links">
                    <li>
                        <a href="{{ route('admin.dashboard') }}">{{ __("Dashboard") }} </a>
                    </li>
                    <li>
                        <a href="{{ route('admin-giftcard-index') }}">{{ __("Gift Cards") }}</a>
                    </li>
                    <li>
                        <a href="{{ route('admin-giftcard-create') }}">{{ __("Add New") }}</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div class="add-product-content1">
        <div class="row">
            <div class="col-lg-12">
                <div class="product-description">
                    <div class="body-area">
                        @include('alerts.admin.form-error')
                        <form id="giftcard-form" action="{{ route('admin-giftcard-store') }}" method="POST" enctype="multipart/form-data">
                            {{csrf_field()}}
                            
                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="left-area">
                                        <h4 class="heading">{{ __("Title") }} *</h4>
                                    </div>
                                </div>
                                <div class="col-lg-7">
                                    <input type="text" class="input-field" name="title" placeholder="{{ __("Enter Gift Card Title") }}" value="" required>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="left-area">
                                        <h4 class="heading">{{ __("Description") }}</h4>
                                    </div>
                                </div>
                                <div class="col-lg-7">
                                    <textarea class="input-field" name="description" rows="4" placeholder="{{ __("Enter Description") }}"></textarea>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="left-area">
                                        <h4 class="heading">{{ __("Image") }}</h4>
                                    </div>
                                </div>
                                <div class="col-lg-7">
                                    <div class="img-upload">
                                        <div id="image-preview" class="img-preview" style="background: url({{ asset('assets/images/noimage.png') }});">
                                            <label for="image-upload" class="img-label" id="image-label"><i class="icofont-upload-alt"></i></label>
                                            <input type="file" name="image" class="img-upload" id="image-upload" accept="image/*">
                                        </div>
                                        <p class="text">{{ __("Image Size Should Be 800x800 or Square") }}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="left-area">
                                        <h4 class="heading">{{ __("Price (KWD)") }} *</h4>
                                    </div>
                                </div>
                                <div class="col-lg-7">
                                    <input type="number" class="input-field" name="price" step="0.01" min="0" placeholder="{{ __("Enter Price") }}" value="" required>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="left-area">
                                        <h4 class="heading">{{ __("Value (KWD)") }} *</h4>
                                    </div>
                                </div>
                                <div class="col-lg-7">
                                    <input type="number" class="input-field" name="value" step="0.01" min="0" placeholder="{{ __("Enter Gift Card Value") }}" value="" required>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="left-area">
                                        <h4 class="heading">{{ __("Discount Percentage") }}</h4>
                                    </div>
                                </div>
                                <div class="col-lg-7">
                                    <input type="number" class="input-field" name="discount_percentage" step="0.01" min="0" max="100" placeholder="{{ __("Enter Discount %") }}" value="">
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="left-area">
                                        <h4 class="heading">{{ __("Validity Days") }}</h4>
                                    </div>
                                </div>
                                <div class="col-lg-7">
                                    <input type="number" class="input-field" name="validity_days" min="1" placeholder="{{ __("Enter Validity Days") }}" value="">
                                    <p class="text">{{ __("Leave empty for no expiration") }}</p>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="left-area">
                                        <h4 class="heading">{{ __("Sort Order") }}</h4>
                                    </div>
                                </div>
                                <div class="col-lg-7">
                                    <input type="number" class="input-field" name="sort_order" min="0" placeholder="{{ __("Enter Sort Order") }}" value="0">
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="left-area">
                                        <h4 class="heading">{{ __("Status") }} *</h4>
                                    </div>
                                </div>
                                <div class="col-lg-7">
                                    <select name="status" class="input-field" required>
                                        <option value="1">{{ __("Active") }}</option>
                                        <option value="0">{{ __("Inactive") }}</option>
                                    </select>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-lg-4">
                                </div>
                                <div class="col-lg-7">
                                    <button class="addProductSubmit-btn" type="submit">{{ __("Create Gift Card") }}</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection

@section('scripts')
<script>
$(document).ready(function() {
    // Image preview
    $("#image-upload").change(function(){
        readURL(this);
    });

    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $("#image-preview").css('background-image', 'url(' + e.target.result + ')');
                $("#image-label").hide();
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    // Form submission
    $('#giftcard-form').on('submit', function(e) {
        e.preventDefault();
        var formData = new FormData(this);
        
        $.ajax({
            url: $(this).attr('action'),
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    window.location.href = '{{ route('admin-giftcard-index') }}';
                } else {
                    alert(response.message || 'Error creating gift card');
                }
            },
            error: function(xhr) {
                var errors = xhr.responseJSON?.errors || [];
                alert(errors.length > 0 ? errors[0] : 'Error creating gift card');
            }
        });
    });
});
</script>
@endsection


