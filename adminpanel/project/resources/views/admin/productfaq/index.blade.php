@extends('layouts.admin')

@section('content')
<input type="hidden" id="headerdata" value="{{ __('PRODUCT FAQ') }}">
<div class="content-area">
	<div class="mr-breadcrumb">
		<div class="row">
			<div class="col-lg-12">
				<h4 class="heading">{{ __('Product FAQs (Chatbot)') }}</h4>
				<ul class="links">
					<li>
						<a href="{{ route('admin.dashboard') }}">{{ __('Dashboard') }} </a>
					</li>
					<li>
						<a href="javascript:;">{{ __('Products') }}</a>
					</li>
					<li>
						<a href="{{ route('admin-product-faq-index') }}">{{ __('Product FAQs') }}</a>
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
						{{ __('Product FAQs Management') }}
					</h4>
					<a class="add-btn" href="{{ route('admin-product-faq-create') }}">
						<i class="fas fa-plus"></i> {{ __('Add New FAQ') }}
					</a>
				</div>

				<div class="mr-table allproduct">
					@include('alerts.admin.form-success')
					@include('alerts.form-success')
					<div class="table-responsive">
						<table id="geniustable" class="table table-hover dt-responsive" cellspacing="0" width="100%">
							<thead>
								<tr>
									<th>{{ __('Product') }}</th>
									<th>{{ __('Question') }}</th>
									<th>{{ __('Answer') }}</th>
									<th>{{ __('Status') }}</th>
									<th>{{ __('Options') }}</th>
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
				<p class="text-center">{{__("You are about to delete this Product FAQ.")}}</p>
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
		ajax: '{{ route('admin-product-faq-datatables') }}',
		columns: [
			{ data: 'product_id', name: 'product_id' },
			{ data: 'question', name: 'question' },
			{ data: 'answer', name: 'answer' },
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
			'<a class="add-btn" href="{{ route('admin-product-faq-create') }}" id="add-data">' +
			'<i class="fas fa-plus"></i> {{ __("Add New FAQ") }}' +
			'</a>' +
			'</div>');
	});
</script>
@endsection



