<!doctype html>
<html lang="en" dir="ltr">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="csrf-token" content="{{ csrf_token() }}">
	<title>{{ $gs->title ?? 'Celebrity Dashboard' }}</title>
	<link href="{{asset('assets/admin/css/bootstrap.min.css')}}" rel="stylesheet" />
	<link rel="stylesheet" href="{{asset('assets/admin/css/fontawesome.css')}}">
	<link rel="stylesheet" href="{{asset('assets/admin/css/icofont.min.css')}}">
	<link href="{{asset('assets/admin/css/style.css')}}" rel="stylesheet"/>
	<link href="{{asset('assets/admin/css/custom.css')}}" rel="stylesheet"/>
</head>
<body>
	<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
		<div class="container-fluid">
			<a class="navbar-brand" href="{{ route('celebrity.dashboard') }}">{{ __('Celebrity Dashboard') }}</a>
			<div class="navbar-nav ms-auto">
				<a class="nav-link" href="{{ route('celebrity.products.index') }}">{{ __('Products') }}</a>
				<a class="nav-link" href="{{ route('celebrity.logout') }}">{{ __('Logout') }}</a>
			</div>
		</div>
	</nav>

	<div class="container mt-4">
		<div class="row">
			<div class="col-md-3">
				<div class="card bg-primary text-white">
					<div class="card-body">
						<h5 class="card-title">{{ __('Total Sales') }}</h5>
						<h2>${{ number_format($totalSales, 2) }}</h2>
					</div>
				</div>
			</div>
			<div class="col-md-3">
				<div class="card bg-success text-white">
					<div class="card-body">
						<h5 class="card-title">{{ __('Total Orders') }}</h5>
						<h2>{{ $totalOrders }}</h2>
					</div>
				</div>
			</div>
			<div class="col-md-3">
				<div class="card bg-info text-white">
					<div class="card-body">
						<h5 class="card-title">{{ __('Total Products') }}</h5>
						<h2>{{ $totalProducts }}</h2>
					</div>
				</div>
			</div>
			<div class="col-md-3">
				<div class="card bg-warning text-white">
					<div class="card-body">
						<h5 class="card-title">{{ __('Active Streams') }}</h5>
						<h2>{{ $activeStreams }}</h2>
					</div>
				</div>
			</div>
		</div>

		<div class="row mt-4">
			<div class="col-lg-12">
				<div class="card">
					<div class="card-header">
						<h4>{{ __('Recent Orders') }}</h4>
					</div>
					<div class="card-body">
						@if($recentOrders->count() > 0)
							<table class="table table-striped">
								<thead>
									<tr>
										<th>{{ __('Order ID') }}</th>
										<th>{{ __('Total') }}</th>
										<th>{{ __('Status') }}</th>
										<th>{{ __('Date') }}</th>
									</tr>
								</thead>
								<tbody>
									@foreach($recentOrders as $order)
										<tr>
											<td>#{{ $order->order_number }}</td>
											<td>${{ number_format($order->pay_amount, 2) }}</td>
											<td>
												<span class="badge badge-{{ $order->status == 'completed' ? 'success' : 'warning' }}">
													{{ ucfirst($order->status) }}
												</span>
											</td>
											<td>{{ $order->created_at->format('Y-m-d') }}</td>
										</tr>
									@endforeach
								</tbody>
							</table>
						@else
							<p class="text-center">{{ __('No orders found') }}</p>
						@endif
					</div>
				</div>
			</div>
		</div>
	</div>

	<script src="{{asset('assets/admin/js/vendors/jquery-1.12.4.min.js')}}"></script>
	<script src="{{asset('assets/admin/js/vendors/bootstrap.min.js')}}"></script>
</body>
</html>


