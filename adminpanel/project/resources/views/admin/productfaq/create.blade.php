@extends('layouts.load')
@section('content')
<div class="content-area">
	<div class="add-product-content1">
		<div class="row">
			<div class="col-lg-12">
				<div class="product-description">
					<div class="body-area">
						@include('alerts.admin.form-error') 
						<form id="geniusformdata" action="{{ route('admin-product-faq-store') }}" method="POST" enctype="multipart/form-data">
							{{csrf_field()}}

							<div class="row">
								<div class="col-lg-4">
									<div class="left-area">
										<h4 class="heading">{{ __("Product") }} *</h4>
									</div>
								</div>
								<div class="col-lg-7">
									<select name="product_id" required="" class="input-field">
										<option value="">{{ __("Select Product") }}</option>
										@foreach($products as $product)
											<option value="{{ $product->id }}" {{ old('product_id') == $product->id ? 'selected' : '' }}>
												{{ $product->name }}
											</option>
										@endforeach
									</select>
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4">
									<div class="left-area">
										<h4 class="heading">{{ __("Question") }} *</h4>
									</div>
								</div>
								<div class="col-lg-7">
									<input type="text" class="input-field" name="question" placeholder="{{ __("Question") }}" required="" value="{{ old('question') }}" maxlength="500">
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4">
									<div class="left-area">
										<h4 class="heading">{{ __("Answer") }} *</h4>
									</div>
								</div>
								<div class="col-lg-7">
									<textarea class="input-field" name="answer" placeholder="{{ __("Answer") }}" required="" rows="5" maxlength="2000">{{ old('answer') }}</textarea>
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4">
									<div class="left-area">
										<h4 class="heading">{{ __("Status") }} *</h4>
									</div>
								</div>
								<div class="col-lg-7">
									<select name="status" required="">
										<option value="1" {{ old('status') == '1' ? 'selected' : '' }}>{{ __("Active") }}</option>
										<option value="0" {{ old('status') == '0' ? 'selected' : '' }}>{{ __("Inactive") }}</option>
									</select>
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4">
								</div>
								<div class="col-lg-7">
									<button class="addProductSubmit-btn" type="submit">{{ __("Create FAQ") }}</button>
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



