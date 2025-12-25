@extends('layouts.admin')

@section('content')
<input type="hidden" id="headerdata" value="{{ __('LIVE STREAM') }}">
<div class="content-area">
	<div class="mr-breadcrumb">
		<div class="row">
			<div class="col-lg-12">
				<h4 class="heading">{{ __("Live Streams") }}</h4>
				<ul class="links">
					<li>
						<a href="{{ route('admin.dashboard') }}">{{ __("Dashboard") }} </a>
					</li>
					<li>
						<a href="{{ route('admin-livestream-index') }}">{{ __("Live Streams") }}</a>
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
						{{ __("Live Streams Management") }}
					</h4>
					<a class="add-btn" href="{{ route('admin-livestream-create') }}">
						<i class="fas fa-plus"></i> {{ __("Start New Stream") }}
					</a>
				</div>

				<div class="mr-table allproduct">
					@include('alerts.admin.form-success')
					@include('alerts.form-success')
					<div class="table-responsive">
						<table id="geniustable" class="table table-hover dt-responsive" cellspacing="0" width="100%">
							<thead>
								<tr>
									<th>{{ __("Title") }}</th>
									<th>{{ __("Broadcaster") }}</th>
									<th>{{ __("Status") }}</th>
									<th>{{ __("Viewers") }}</th>
									<th>{{ __("Likes") }}</th>
									<th>{{ __("Products") }}</th>
									<th>{{ __("Started At") }}</th>
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

@endsection

@section('scripts')
<script type="text/javascript">
	var table = $('#geniustable').DataTable({
		ordering: false,
		processing: true,
		serverSide: true,
		ajax: '{{ route('admin-livestream-datatables') }}',
		columns: [
			{ data: 'title', name: 'title' },
			{ data: 'user_id', name: 'user_id' },
			{ data: 'status', name: 'status' },
			{ data: 'viewer_count', name: 'viewer_count' },
			{ data: 'likes_count', name: 'likes_count' },
			{ data: 'products_count', name: 'products_count' },
			{ data: 'started_at', name: 'started_at' },
			{ data: 'action', searchable: false, orderable: false }
		],
		language: {
			processing: '<img src="{{asset('assets/images/'.$gs->admin_loader)}}">'
		},
		drawCallback: function(settings) {
			$('.select').niceSelect();
		}
	});
</script>
@endsection


