@extends('layouts.admin')

@section('content')
<input type="hidden" id="headerdata" value="{{ __("CELEBRITY") }}">
<div class="content-area">
	<div class="mr-breadcrumb">
		<div class="row">
			<div class="col-lg-12">
				<h4 class="heading">{{ __("Celebrities") }}</h4>
				<ul class="links">
					<li>
						<a href="{{ route('admin.dashboard') }}">{{ __("Dashboard") }} </a>
					</li>
					<li>
						<a href="javascript:;">{{ __("Celebrities") }}</a>
					</li>
					<li>
						<a href="{{ route('admin-celebrity-index') }}">{{ __("Celebrities List") }}</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
	<div class="product-area">
		<div class="row">
			<div class="col-lg-12">
				<div class="heading-area">
					<h4 class="title">
						{{ __("Celebrities Management") }}
					</h4>
					<a class="add-btn" href="{{ route('admin-celebrity-create') }}">
						<i class="fas fa-plus"></i> {{ __("Add New Celebrity") }}
					</a>
				</div>

				<div class="mr-table allproduct">
					@include('alerts.admin.form-success')
					@include('alerts.form-success')
					<div class="table-responsive">
						<table id="geniustable" class="table table-hover dt-responsive" cellspacing="0" width="100%">
							<thead>
								<tr>
									<th>{{ __("Name") }}</th>
									<th>{{ __("Email") }}</th>
									<th>{{ __("Phone") }}</th>
									<th>{{ __("Products") }}</th>
									<th>{{ __("Status") }}</th>
									<th>{{ __("Options") }}</th>
								</tr>
							</thead>
						</table>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

{{-- DELETE MODAL --}}
<div class="modal fade" id="confirm-delete" tabindex="-1" role="dialog" aria-labelledby="modal1" aria-hidden="true">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header d-block text-center">
				<h4 class="modal-title d-inline-block">{{ __("Confirm Delete") }}</h4>
				<button type="button" class="close" data-dismiss="modal" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
			</div>
			<div class="modal-body">
				<p class="text-center">{{__("You are about to delete this Celebrity. Every informtation under this celebrity will be deleted.")}}</p>
				<p class="text-center">{{ __("Do you want to proceed?") }}</p>
			</div>
			<div class="modal-footer justify-content-center">
				<button type="button" class="btn btn-default" data-dismiss="modal">{{ __("Cancel") }}</button>
				<form action="" class="d-inline delete-form" method="POST">
					<input type="hidden" name="_method" value="delete" />
					<input type="hidden" name="_token" value="{{ csrf_token() }}" />
					<button type="submit" class="btn btn-danger">{{ __("Delete") }}</button>
				</form>
			</div>
		</div>
	</div>
</div>
{{-- DELETE MODAL ENDS --}}

@endsection

@section('scripts')
<script type="text/javascript">
	var table = $('#geniustable').DataTable({
		ordering: false,
		processing: true,
		serverSide: true,
		ajax: '{{ route('admin-celebrity-datatables') }}',
		columns: [
			{ data: 'name', name: 'name' },
			{ data: 'email', name: 'email' },
			{ data: 'phone', name: 'phone' },
			{ data: 'products_count', name: 'products_count' },
			{ data: 'status', name: 'status' },
			{ data: 'action', searchable: false, orderable: false }
		],
		language: {
			processing: '<img src="{{asset('assets/images/'.$gs->admin_loader)}}">'
		},
		drawCallback: function(settings) {
			$('.select').niceSelect();
		}
	});

	$(function() {
		$(".btn-area").append('<div class="col-sm-4 table-contents">' +
			'<a class="add-btn" href="{{ route('admin-celebrity-create') }}" id="add-data">' +
			'<i class="fas fa-plus"></i> {{ __("Add New Celebrity") }}' +
			'</a>' +
			'</div>');
	});
</script>
@endsection



