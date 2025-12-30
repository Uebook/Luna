@extends('layouts.load')
@section('content')
<div class="content-area">
	<div class="mr-breadcrumb">
		<div class="row">
			<div class="col-lg-12">
				<h4 class="heading">{{ __("Start New Live Stream") }} <a class="add-btn" href="{{ route('admin-livestream-index') }}"><i class="fas fa-arrow-left"></i> {{ __("Back") }}</a></h4>
				<ul class="links">
					<li>
						<a href="{{ route('admin.dashboard') }}">{{ __("Dashboard") }} </a>
					</li>
					<li>
						<a href="{{ route('admin-livestream-index') }}">{{ __("Live Streams") }}</a>
					</li>
					<li>
						<a href="{{ route('admin-livestream-create') }}">{{ __("Start New Stream") }}</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
	<div class="add-product-content1 add-product-content2">
		<div class="row">
			<div class="col-lg-12">
				<div class="product-description">
					<div class="body-area">
						<div class="gocover" style="background: url({{asset('assets/images/'.$gs->admin_loader)}}) no-repeat scroll center center rgba(45, 45, 45, 0.5);"></div>
						@include('alerts.admin.form-both')
						@include('alerts.admin.form-error') 
						<form id="geniusformdata" action="{{ route('admin-livestream-store') }}" method="POST" enctype="multipart/form-data">
							{{csrf_field()}}

							<div class="row">
								<div class="col-lg-4">
									<div class="left-area">
										<h4 class="heading">{{ __("Celebrity/Vendor") }} *</h4>
										<p class="sub-heading">{{ __("Select the celebrity or vendor to start the stream") }}</p>
									</div>
								</div>
								<div class="col-lg-7">
									<select class="input-field" name="user_id" required="">
										<option value="">{{ __("Select Celebrity/Vendor") }}</option>
										@foreach($users as $user)
											<option value="{{ $user->id }}" {{ old('user_id') == $user->id ? 'selected' : '' }}>
												{{ $user->name }} ({{ $user->email }})
											</option>
										@endforeach
									</select>
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4">
									<div class="left-area">
										<h4 class="heading">{{ __("Stream Title") }} *</h4>
										<p class="sub-heading">{{ __("Enter a title for the live stream") }}</p>
									</div>
								</div>
								<div class="col-lg-7">
									<input type="text" class="input-field" name="title" placeholder="{{ __("Stream Title") }}" required="" value="{{ old('title') }}" maxlength="255">
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4">
									<div class="left-area">
										<h4 class="heading">{{ __("Description") }}</h4>
										<p class="sub-heading">{{ __("Optional description for the stream") }}</p>
									</div>
								</div>
								<div class="col-lg-7">
									<textarea class="input-field" name="description" placeholder="{{ __("Stream Description") }}" rows="5">{{ old('description') }}</textarea>
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4">
									<div class="left-area">
										<h4 class="heading">{{ __("Channel Name") }}</h4>
										<p class="sub-heading">{{ __("Leave blank to auto-generate") }}</p>
									</div>
								</div>
								<div class="col-lg-7">
									<input type="text" class="input-field" name="channel_name" placeholder="{{ __("Channel Name (auto-generated if empty)") }}" value="{{ old('channel_name') }}">
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4">
									<div class="left-area">
										<h4 class="heading">{{ __("Start Now") }}</h4>
										<p class="sub-heading">{{ __("Check to start stream immediately") }}</p>
									</div>
								</div>
								<div class="col-lg-7">
									<div class="checkbox-wrapper">
										<input type="checkbox" name="start_now" id="start_now" value="1" {{ old('start_now') ? 'checked' : 'checked' }}>
										<label for="start_now">{{ __("Start stream immediately") }}</label>
									</div>
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4">
								</div>
								<div class="col-lg-7">
									<button class="addProductSubmit-btn" type="submit">{{ __("Start Live Stream") }}</button>
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
				if ((data.errors)) {
					$('#geniusformdata').find('.alert-success').hide();
					$('#geniusformdata').find('.alert-danger').removeClass('hide');
					for (error in data.errors) {
						$('#geniusformdata').find('.alert-danger ul').append('<li>'+data.errors[error]+'</li>');
					}
				} else {
					$('#geniusformdata').find('.alert-danger').addClass('hide');
					$('#geniusformdata').find('.alert-success').removeClass('hide');
					$('#geniusformdata').find('.alert-success p').html(data.message || 'Stream created successfully!');
					setTimeout(function() {
						window.location.href = data.redirect || '{{ route('admin-livestream-index') }}';
					}, 1500);
				}
			},
			error: function(xhr) {
				$('.gocover').hide();
				var errors = xhr.responseJSON && xhr.responseJSON.errors ? xhr.responseJSON.errors : {};
				$('#geniusformdata').find('.alert-success').hide();
				$('#geniusformdata').find('.alert-danger').removeClass('hide');
				$('#geniusformdata').find('.alert-danger ul').html('');
				for (error in errors) {
					$('#geniusformdata').find('.alert-danger ul').append('<li>'+errors[error][0]+'</li>');
				}
			}
		});
	});
</script>
@endsection


