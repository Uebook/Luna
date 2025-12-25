@extends('layouts.load')
@section('content')
<div class="content-area">
	<div class="mr-breadcrumb">
		<div class="row">
			<div class="col-lg-12">
				<h4 class="heading">{{ __("Edit Celebrity") }} <a class="add-btn" href="{{ route('admin-celebrity-index') }}"><i class="fas fa-arrow-left"></i> {{ __("Back") }}</a></h4>
				<ul class="links">
					<li>
						<a href="{{ route('admin.dashboard') }}">{{ __("Dashboard") }} </a>
					</li>
					<li>
						<a href="{{ route('admin-celebrity-index') }}">{{ __("Celebrities") }}</a>
					</li>
					<li>
						<a href="{{ route('admin-celebrity-edit', $celebrity->id) }}">{{ __("Edit") }}</a>
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
						<div class="gocover" style="background: url({{asset('assets/images/'.$gs->admin_loader)}}) no-repeat scroll center center rgba(45, 45, 45, 0.5);"></div>
						@include('alerts.admin.form-both')
						@include('alerts.admin.form-error') 
						<form id="geniusformdata" action="{{ route('admin-celebrity-update', $celebrity->id) }}" method="POST" enctype="multipart/form-data">
							{{csrf_field()}}
							<input type="hidden" name="_method" value="PUT">

							<div class="row">
								<div class="col-lg-4">
									<div class="left-area">
										<h4 class="heading">{{ __("Name") }} *</h4>
									</div>
								</div>
								<div class="col-lg-7">
									<input type="text" class="input-field" name="name" placeholder="{{ __("Celebrity Name") }}" required="" value="{{ $celebrity->name }}">
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4">
									<div class="left-area">
										<h4 class="heading">{{ __("Email") }} *</h4>
									</div>
								</div>
								<div class="col-lg-7">
									<input type="email" class="input-field" name="email" placeholder="{{ __("Email Address") }}" required="" value="{{ $celebrity->email }}">
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4">
									<div class="left-area">
										<h4 class="heading">{{ __("Phone") }}</h4>
									</div>
								</div>
								<div class="col-lg-7">
									<input type="text" class="input-field" name="phone" placeholder="{{ __("Phone Number") }}" value="{{ $celebrity->phone }}">
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4">
									<div class="left-area">
										<h4 class="heading">{{ __("Password") }}</h4>
										<p class="sub-heading">{{ __("Leave blank to keep current password") }}</p>
									</div>
								</div>
								<div class="col-lg-7">
									<input type="password" class="input-field" name="password" placeholder="{{ __("New Password") }}" minlength="6">
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4">
									<div class="left-area">
										<h4 class="heading">{{ __("Status") }} *</h4>
									</div>
								</div>
								<div class="col-lg-7">
									<select class="input-field" name="status" required="">
										<option value="1" {{ $celebrity->status == 1 ? 'selected' : '' }}>{{ __("Active") }}</option>
										<option value="0" {{ $celebrity->status == 0 ? 'selected' : '' }}>{{ __("Inactive") }}</option>
									</select>
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4">
								</div>
								<div class="col-lg-7">
									<button class="addProductSubmit-btn" type="submit">{{ __("Update Celebrity") }}</button>
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
<script type="text/javascript">
	$("#geniusformdata").on('submit', function(e){
		e.preventDefault();
		$('.gocover').show();
		var form = new FormData(this);
		$.ajax({
			url:$(this).attr('action'),
			method: "POST",
			data:form,
			cache:false,
			contentType: false,
			processData: false,
			success:function(data)
			{
				$('.gocover').hide();
				// Handle JSON response
				if (typeof data === 'object' && data !== null) {
					if (data.errors) {
						$('#geniusformdata').find('.alert-success').hide();
						$('#geniusformdata').find('.alert-danger').removeClass('hide');
						$('#geniusformdata').find('.alert-danger ul').empty();
						for (error in data.errors) {
							$('#geniusformdata').find('.alert-danger ul').append('<li>'+data.errors[error]+'</li>');
						}
					} else if (data.success && data.redirect) {
						$('#geniusformdata').find('.alert-danger').addClass('hide');
						$('#geniusformdata').find('.alert-success').removeClass('hide');
						$('#geniusformdata').find('.alert-success p').html(data.message || 'Celebrity updated successfully.');
						setTimeout(function() {
							window.location.href = data.redirect;
						}, 500);
					}
				} else {
					// Handle string response (legacy format)
					$('#geniusformdata').find('.alert-danger').addClass('hide');
					$('#geniusformdata').find('.alert-success').removeClass('hide');
					$('#geniusformdata').find('.alert-success p').html(data);
					setTimeout(function() {
						window.location.href = '{{ route("admin-celebrity-index") }}';
					}, 1500);
				}
			},
			error: function(xhr, status, error) {
				$('.gocover').hide();
				$('#geniusformdata').find('.alert-success').hide();
				$('#geniusformdata').find('.alert-danger').removeClass('hide');
				$('#geniusformdata').find('.alert-danger ul').empty();
				var errorMsg = 'An error occurred. Please try again.';
				if (xhr.responseJSON && xhr.responseJSON.message) {
					errorMsg = xhr.responseJSON.message;
				} else if (xhr.responseJSON && xhr.responseJSON.errors) {
					for (error in xhr.responseJSON.errors) {
						$('#geniusformdata').find('.alert-danger ul').append('<li>'+xhr.responseJSON.errors[error]+'</li>');
					}
					return;
				}
				$('#geniusformdata').find('.alert-danger ul').append('<li>'+errorMsg+'</li>');
			}
		});
	});
</script>
@endsection

