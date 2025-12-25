@extends('layouts.admin')

@section('content')
<input type="hidden" id="headerdata" value="{{ __('GIFT CARD HISTORY - RECEIVED') }}">
<div class="content-area">
    <div class="mr-breadcrumb">
        <div class="row">
            <div class="col-lg-12">
                <h4 class="heading">{{ __("Gift Cards Received History") }}</h4>
                <ul class="links">
                    <li>
                        <a href="{{ route('admin.dashboard') }}">{{ __("Dashboard") }} </a>
                    </li>
                    <li>
                        <a href="{{ route('admin-giftcard-index') }}">{{ __("Gift Cards") }}</a>
                    </li>
                    <li>
                        <a href="{{ route('admin-giftcard-history-received') }}">{{ __("Received History") }}</a>
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
                        {{ __("All Gift Cards Received/Redeemed") }}
                    </h4>
                    <div class="action-list">
                        <a href="{{ route('admin-giftcard-history-sent') }}" class="btn btn-secondary">
                            <i class="fas fa-paper-plane"></i> {{ __("View Sent History") }}
                        </a>
                    </div>
                </div>

                <div class="mr-table allproduct">
                    @include('alerts.admin.form-success')
                    @include('alerts.form-success')
                    <div class="table-responsive">
                        <table id="geniustable" class="table table-hover dt-responsive" cellspacing="0" width="100%">
                            <thead>
                                <tr>
                                    <th>{{ __("Gift Card") }}</th>
                                    <th>{{ __("Sender") }}</th>
                                    <th>{{ __("Receiver") }}</th>
                                    <th>{{ __("Code") }}</th>
                                    <th>{{ __("Value") }}</th>
                                    <th>{{ __("Dates") }}</th>
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
        ajax: '{{ route('admin-giftcard-history-received-datatables') }}',
        columns: [
            { data: 'gift_card_info', name: 'gift_card_info', searchable: false, orderable: false },
            { data: 'sender_info', name: 'sender_info', searchable: false, orderable: false },
            { data: 'receiver_info', name: 'receiver_info', searchable: false, orderable: false },
            { data: 'code', name: 'code' },
            { data: 'value', name: 'value', searchable: false },
            { data: 'dates', name: 'dates', searchable: false, orderable: false },
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

