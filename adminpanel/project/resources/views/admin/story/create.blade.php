@extends('layouts.load')

@section('content')
<div class="content-area">
  <div class="add-product-content1">
    <div class="row">
      <div class="col-lg-12">
        <div class="product-description">
          <div class="body-area">
            @include('alerts.admin.form-error')

            <form id="geniusformdata" action="{{ route('admin-story-store') }}" method="POST" enctype="multipart/form-data">
              @csrf

              {{-- Type --}}
              <div class="row">
                <div class="col-lg-4"><div class="left-area"><h4 class="heading">Type *</h4></div></div>
                <div class="col-lg-7">
                  <select class="input-field" name="type" id="story-type" required>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              {{-- Category --}}
              <div class="row">
                <div class="col-lg-4"><div class="left-area"><h4 class="heading">Category *</h4></div></div>
                <div class="col-lg-7">
                  <select class="input-field" name="category_id" required>
                    <option value="">Select Category</option>
                    @foreach($categories as $category)
                      <option value="{{ $category->id }}">{{ $category->name }}</option>
                    @endforeach
                  </select>
                </div>
              </div>

              {{-- User --}}
              <div class="row">
                <div class="col-lg-4"><div class="left-area"><h4 class="heading">User *</h4></div></div>
                <div class="col-lg-7">
                  <select class="input-field" name="user_id" required>
                    <option value="">Select User</option>
                    @foreach($users as $user)
                      <option value="{{ $user->id }}">{{ $user->name }}</option>
                    @endforeach
                  </select>
                </div>
              </div>

              {{-- Caption --}}
              <div class="row">
                <div class="col-lg-4"><div class="left-area"><h4 class="heading">Caption</h4></div></div>
                <div class="col-lg-7">
                  <input type="text" class="input-field" name="caption" placeholder="Enter caption">
                </div>
              </div>

              {{-- File Upload --}}
              <div class="row">
                <div class="col-lg-4"><div class="left-area"><h4 class="heading">Upload File *</h4></div></div>
                <div class="col-lg-7">
                  <input type="file" class="input-field" name="file" accept="image/*,video/*" required>
                </div>
              </div>

              {{-- Status --}}
              <div class="row">
                <div class="col-lg-4"><div class="left-area"><h4 class="heading">Status *</h4></div></div>
                <div class="col-lg-7">
                  <select class="input-field" name="status" required>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>

              {{-- Submit --}}
              <div class="row">
                <div class="col-lg-4"></div>
                <div class="col-lg-7">
                  <button class="addProductSubmit-btn" type="submit">Save</button>
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
