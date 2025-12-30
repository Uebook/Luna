@extends('layouts.admin')

@section('content')
<input type="hidden" id="headerdata" value="{{ __('GIFT CARDS') }}">
<div class="content-area">
    <div class="mr-breadcrumb">
        <div class="row">
            <div class="col-lg-12">
                <h4 class="heading">{{ __("Gift Cards") }}</h4>
                <ul class="links">
                    <li>
                        <a href="{{ route('admin.dashboard') }}">{{ __("Dashboard") }} </a>
                    </li>
                    <li>
                        <a href="{{ route('admin-giftcard-index') }}">{{ __("Gift Cards") }}</a>
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
                        {{ __("Gift Cards Management") }}
                    </h4>
                    <a class="add-btn" href="{{ route('admin-giftcard-create') }}">
                        <i class="fas fa-plus"></i> {{ __("Add New Gift Card") }}
                    </a>
                </div>

                <div class="mr-table allproduct">
                    @include('alerts.admin.form-success')
                    @include('alerts.form-success')
                    <div class="table-responsive">
                        <table id="geniustable" class="table table-hover dt-responsive" cellspacing="0" width="100%">
                            <thead>
                                <tr>
                                    <th>{{ __("Image") }}</th>
                                    <th>{{ __("Title") }}</th>
                                    <th>{{ __("Price / Value") }}</th>
                                    <th>{{ __("Validity Days") }}</th>
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
                <p class="text-center">{{ __("You are about to delete this Gift Card.") }}</p>
                <p class="text-center">{{ __("Do you want to proceed?") }}</p>
            </div>
            <div class="modal-footer justify-content-center">
                <button type="button" class="btn btn-default" data-dismiss="modal">{{ __("Cancel") }}</button>
                <a class="btn btn-danger btn-ok">{{ __("Delete") }}</a>
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
        ajax: '{{ route('admin-giftcard-datatables') }}',
        columns: [
            { data: 'image', name: 'image', searchable: false, orderable: false },
            { data: 'title', name: 'title' },
            { data: 'price_value', name: 'price_value', searchable: false },
            { data: 'validity_days', name: 'validity_days' },
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

    $('#confirm-delete').on('show.bs.modal', function(e) {
        $(this).find('.btn-ok').attr('href', $(e.relatedTarget).data('href'));
    });
</script>
@endsection

