<!doctype html>
<html lang="en" dir="ltr">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>{{ $gs->title ?? 'Products' }} - Celebrity Dashboard</title>
	<link href="{{asset('assets/admin/css/bootstrap.min.css')}}" rel="stylesheet" />
	<link rel="stylesheet" href="{{asset('assets/admin/css/fontawesome.css')}}">
	<link href="{{asset('assets/admin/css/style.css')}}" rel="stylesheet"/>
	<link href="{{asset('assets/admin/css/custom.css')}}" rel="stylesheet"/>
</head>
<body>
	<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
		<div class="container-fluid">
			<a class="navbar-brand" href="{{ route('celebrity.dashboard') }}">{{ __('Celebrity Dashboard') }}</a>
			<div class="navbar-nav ms-auto">
				<a class="nav-link" href="{{ route('celebrity.dashboard') }}">{{ __('Dashboard') }}</a>
				<a class="nav-link" href="{{ route('celebrity.products.create') }}">{{ __('Add Product') }}</a>
				<a class="nav-link" href="{{ route('celebrity.logout') }}">{{ __('Logout') }}</a>
			</div>
		</div>
	</nav>

	<div class="content-area mt-4">
		<div class="container">
			<div class="row">
				<div class="col-lg-12">
					<div class="heading-area">
						<h4 class="title">{{ __('My Products') }}</h4>
						<a class="add-btn" href="{{ route('celebrity.products.create') }}">
							<i class="fas fa-plus"></i> {{ __('Add New Product') }}
						</a>
					</div>

					@include('alerts.form-success')

					<div class="mr-table allproduct">
						<div class="table-responsive">
							<table id="geniustable" class="table table-hover dt-responsive" cellspacing="0" width="100%">
								<thead>
									<tr>
										<th>{{ __('Name') }}</th>
										<th>{{ __('Price') }}</th>
										<th>{{ __('Stock') }}</th>
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

	<script src="{{asset('assets/admin/js/vendors/jquery-1.12.4.min.js')}}"></script>
	<script src="{{asset('assets/admin/js/vendors/bootstrap.min.js')}}"></script>
	<script>
		var table = $('#geniustable').DataTable({
			ordering: false,
			processing: true,
			serverSide: true,
			ajax: '{{ route('celebrity.products.datatables') }}',
			columns: [
				{ data: 'name', name: 'name' },
				{ data: 'price', name: 'price' },
				{ data: 'stock', name: 'stock' },
				{ data: 'status', name: 'status' },
				{ data: 'action', searchable: false, orderable: false }
			],
			language: {
				processing: '<img src="{{asset('assets/images/'.$gs->admin_loader)}}">'
			}
		});
	</script>
</body>
</html>


