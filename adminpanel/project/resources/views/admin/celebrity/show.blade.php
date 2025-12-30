@extends('layouts.admin')

@section('content')
<div class="content-area">
	<div class="mr-breadcrumb">
		<div class="row">
			<div class="col-lg-12">
				<h4 class="heading">{{ __("Celebrity Details") }} <a class="add-btn" href="{{ url()->previous() }}"><i class="fas fa-arrow-left"></i> {{ __("Back") }}</a></h4>
				<ul class="links">
					<li>
						<a href="{{ route('admin.dashboard') }}">{{ __("Dashboard") }} </a>
					</li>
					<li>
						<a href="{{ route('admin-celebrity-index') }}">{{ __("Celebrities") }}</a>
					</li>
					<li>
						<a href="{{ route('admin-celebrity-show', $celebrity->id) }}">{{ __("Details") }}</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
	<div class="add-product-content1 customar-details-area">
		<div class="row">
			<div class="col-lg-12">
				<div class="product-description">
					<div class="body-area">
						<div class="row">
							<div class="col-md-4">
								<div class="user-image">
									<img src="{{ $celebrity->photo ? asset('assets/images/users/'.$celebrity->photo):asset('assets/images/noimage.png')}}" alt="{{ __("No Image") }}">
									<a href="{{ route('admin-celebrity-edit', $celebrity->id) }}" class="mybtn1">{{ __("Edit Celebrity") }}</a>
								</div>
							</div>
							<div class="col-md-4">
								<div class="table-responsive show-table">
									<table class="table">
										<tr>
											<th>{{ __("Celebrity ID#") }}</th>
											<td>{{ $celebrity->id }}</td>
										</tr>
										<tr>
											<th>{{ __("Name") }}</th>
											<td>{{ $celebrity->name }}</td>
										</tr>
										<tr>
											<th>{{ __("Email") }}</th>
											<td>{{ $celebrity->email }}</td>
										</tr>
										<tr>
											<th>{{ __("Phone") }}</th>
											<td>{{ $celebrity->phone ?? 'N/A' }}</td>
										</tr>
										<tr>
											<th>{{ __("Status") }}</th>
											<td>
												@if($celebrity->status == 1)
													<span class="badge badge-success">{{ __("Active") }}</span>
												@else
													<span class="badge badge-danger">{{ __("Inactive") }}</span>
												@endif
											</td>
										</tr>
										<tr>
											<th>{{ __("Total Products") }}</th>
											<td>{{ $products->count() }}</td>
										</tr>
										<tr>
											<th>{{ __("Total Sales") }}</th>
											<td>${{ number_format($totalSales, 2) }}</td>
										</tr>
										<tr>
											<th>{{ __("Registered Date") }}</th>
											<td>{{ $celebrity->created_at->format('Y-m-d H:i:s') }}</td>
										</tr>
									</table>
								</div>
							</div>
						</div>

						<div class="row mt-4">
							<div class="col-lg-12">
								<h4 class="heading">{{ __("Celebrity Products") }}</h4>
								<div class="mr-table allproduct">
									<div class="table-responsive">
										<table class="table table-hover">
											<thead>
												<tr>
													<th>{{ __("Product") }}</th>
													<th>{{ __("Price") }}</th>
													<th>{{ __("Stock") }}</th>
													<th>{{ __("Status") }}</th>
												</tr>
											</thead>
											<tbody>
												@forelse($products as $product)
													<tr>
														<td>{{ $product->name }}</td>
														<td>${{ number_format($product->price, 2) }}</td>
														<td>{{ $product->stock ?? 'Unlimited' }}</td>
														<td>
															@if($product->status == 1)
																<span class="badge badge-success">{{ __("Active") }}</span>
															@else
																<span class="badge badge-danger">{{ __("Inactive") }}</span>
															@endif
														</td>
													</tr>
												@empty
													<tr>
														<td colspan="4" class="text-center">{{ __("No products found") }}</td>
													</tr>
												@endforelse
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
</div>
@endsection


