@extends('layouts.admin')

@section('content')
<input type="hidden" id="headerdata" value="{{ __('GIFT CARD DETAILS') }}">
<div class="content-area">
    <div class="mr-breadcrumb">
        <div class="row">
            <div class="col-lg-12">
                <h4 class="heading">{{ __("Gift Card Purchase Details") }}</h4>
                <ul class="links">
                    <li>
                        <a href="{{ route('admin.dashboard') }}">{{ __("Dashboard") }} </a>
                    </li>
                    <li>
                        <a href="{{ route('admin-giftcard-index') }}">{{ __("Gift Cards") }}</a>
                    </li>
                    <li>
                        <a href="{{ route('admin-giftcard-history-sent') }}">{{ __("Sent History") }}</a>
                    </li>
                    <li>
                        <a href="javascript:;">{{ __("Details") }}</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
    <div class="product-area">
        <div class="row">
            <div class="col-lg-12">
                <div class="mr-table allproduct">
                    @include('alerts.admin.form-success')
                    @include('alerts.form-success')
                    
                    <div class="card">
                        <div class="card-header">
                            <h4 class="card-title">{{ __("Gift Card Information") }}</h4>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h5>{{ __("Gift Card Details") }}</h5>
                                    <table class="table table-bordered">
                                        <tr>
                                            <th width="40%">{{ __("Gift Card") }}</th>
                                            <td>
                                                @if($purchase->gift_card_image)
                                                    <img src="{{ asset('assets/images/giftcards/' . $purchase->gift_card_image) }}" alt="Gift Card" width="80" height="80" style="object-fit: cover; border-radius: 8px; margin-right: 10px;">
                                                @endif
                                                <strong>{{ $purchase->gift_card_title ?? 'N/A' }}</strong>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>{{ __("Code") }}</th>
                                            <td><code style="font-size: 16px; padding: 5px 10px; background: #f5f5f5;">{{ $purchase->code }}</code></td>
                                        </tr>
                                        <tr>
                                            <th>{{ __("Value") }}</th>
                                            <td><strong>BHD {{ number_format($purchase->value, 3) }}</strong></td>
                                        </tr>
                                        <tr>
                                            <th>{{ __("Remaining Value") }}</th>
                                            <td><strong>BHD {{ number_format($purchase->remaining_value, 3) }}</strong></td>
                                        </tr>
                                        <tr>
                                            <th>{{ __("Status") }}</th>
                                            <td>
                                                @if($purchase->status == 'used')
                                                    <span class="badge badge-success">{{ __("Used") }}</span>
                                                @elseif($purchase->status == 'expired')
                                                    <span class="badge badge-danger">{{ __("Expired") }}</span>
                                                @else
                                                    <span class="badge badge-info">{{ __("Active") }}</span>
                                                @endif
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                                <div class="col-md-6">
                                    <h5>{{ __("Sender Information") }}</h5>
                                    <table class="table table-bordered">
                                        <tr>
                                            <th width="40%">{{ __("Name") }}</th>
                                            <td>{{ $purchase->sender_name ?? 'N/A' }}</td>
                                        </tr>
                                        <tr>
                                            <th>{{ __("Email") }}</th>
                                            <td>{{ $purchase->sender_email ?? 'N/A' }}</td>
                                        </tr>
                                        <tr>
                                            <th>{{ __("Phone") }}</th>
                                            <td>{{ $purchase->sender_phone ?? 'N/A' }}</td>
                                        </tr>
                                    </table>

                                    <h5 style="margin-top: 20px;">{{ __("Recipient Information") }}</h5>
                                    <table class="table table-bordered">
                                        <tr>
                                            <th width="40%">{{ __("Name") }}</th>
                                            <td>{{ $purchase->recipient_name ?? 'Self' }}</td>
                                        </tr>
                                        @if($purchase->recipient_email)
                                        <tr>
                                            <th>{{ __("Email") }}</th>
                                            <td>{{ $purchase->recipient_email }}</td>
                                        </tr>
                                        @endif
                                        @if(isset($purchase->recipient_phone) && $purchase->recipient_phone)
                                        <tr>
                                            <th>{{ __("Phone") }}</th>
                                            <td>{{ $purchase->recipient_phone }}</td>
                                        </tr>
                                        @endif
                                        @if($purchase->message)
                                        <tr>
                                            <th>{{ __("Message") }}</th>
                                            <td>{{ $purchase->message }}</td>
                                        </tr>
                                        @endif
                                    </table>
                                </div>
                            </div>

                            @if(isset($purchase->redeemed_by_user_id) && $purchase->redeemed_by_user_id)
                            <div class="row" style="margin-top: 20px;">
                                <div class="col-md-12">
                                    <h5>{{ __("Redeemed By") }}</h5>
                                    <table class="table table-bordered">
                                        <tr>
                                            <th width="20%">{{ __("Name") }}</th>
                                            <td>{{ $purchase->receiver_name ?? 'N/A' }}</td>
                                        </tr>
                                        <tr>
                                            <th>{{ __("Email") }}</th>
                                            <td>{{ $purchase->receiver_email ?? 'N/A' }}</td>
                                        </tr>
                                        <tr>
                                            <th>{{ __("Phone") }}</th>
                                            <td>{{ $purchase->receiver_phone ?? 'N/A' }}</td>
                                        </tr>
                                        <tr>
                                            <th>{{ __("Redeemed At") }}</th>
                                            <td>{{ (isset($purchase->redeemed_at) && $purchase->redeemed_at) ? date('Y-m-d H:i:s', strtotime($purchase->redeemed_at)) : 'N/A' }}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                            @endif

                            <div class="row" style="margin-top: 20px;">
                                <div class="col-md-12">
                                    <h5>{{ __("Timeline") }}</h5>
                                    <table class="table table-bordered">
                                        <tr>
                                            <th width="20%">{{ __("Purchased At") }}</th>
                                            <td>{{ date('Y-m-d H:i:s', strtotime($purchase->created_at)) }}</td>
                                        </tr>
                                        @if(isset($purchase->expires_at) && $purchase->expires_at)
                                        <tr>
                                            <th>{{ __("Expires At") }}</th>
                                            <td>{{ date('Y-m-d H:i:s', strtotime($purchase->expires_at)) }}</td>
                                        </tr>
                                        @endif
                                        @if(isset($purchase->redeemed_at) && $purchase->redeemed_at)
                                        <tr>
                                            <th>{{ __("Redeemed At") }}</th>
                                            <td>{{ date('Y-m-d H:i:s', strtotime($purchase->redeemed_at)) }}</td>
                                        </tr>
                                        @endif
                                    </table>
                                </div>
                            </div>

                            <div class="row" style="margin-top: 20px;">
                                <div class="col-md-12">
                                    <a href="{{ route('admin-giftcard-history-sent') }}" class="btn btn-primary">
                                        <i class="fas fa-arrow-left"></i> {{ __("Back to History") }}
                                    </a>
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

