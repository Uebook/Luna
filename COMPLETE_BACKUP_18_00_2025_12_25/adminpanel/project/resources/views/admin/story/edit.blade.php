@extends('layouts.load')

@section('content')

<div class="content-area">
  <div class="add-product-content1">
    <div class="row">
      <div class="col-lg-12">
        <div class="product-description">
          <div class="body-area">

            @include('alerts.admin.form-error')

            <form id="geniusformdata" action="{{ route('admin-story-update', $data->id) }}" method="POST" enctype="multipart/form-data">
              @csrf

              {{-- Type --}}
              <div class="row">
                <div class="col-lg-4">
                  <div class="left-area">
                    <h4 class="heading">Type *</h4>
                  </div>
                </div>
                <div class="col-lg-7">
                  <select class="input-field" name="type" id="story-type" required>
                    <option value="image" {{ $data->type == 'image' ? 'selected' : '' }}>Image</option>
                    <option value="video" {{ $data->type == 'video' ? 'selected' : '' }}>Video</option>
                  </select>
                </div>
              </div>

              {{-- Category --}}
              <div class="row">
                <div class="col-lg-4">
                  <div class="left-area">
                    <h4 class="heading">Category *</h4>
                  </div>
                </div>
                <div class="col-lg-7">
                  <select class="input-field" name="category_id" required>
                    <option value="">Select Category</option>
                    @foreach($categories as $category)
                      <option value="{{ $category->id }}" {{ $data->category_id == $category->id ? 'selected' : '' }}>
                        {{ $category->name }}
                      </option>
                    @endforeach
                  </select>
                </div>
              </div>

              {{-- User --}}
              <div class="row">
                <div class="col-lg-4">
                  <div class="left-area">
                    <h4 class="heading">User *</h4>
                  </div>
                </div>
                <div class="col-lg-7">
                  <select class="input-field" name="user_id" required>
                    <option value="">Select User</option>
                    @foreach($users as $user)
                      <option value="{{ $user->id }}" {{ $data->user_id == $user->id ? 'selected' : '' }}>
                        {{ $user->name }}
                      </option>
                    @endforeach
                  </select>
                </div>
              </div>

              {{-- Caption --}}
              <div class="row">
                <div class="col-lg-4">
                  <div class="left-area">
                    <h4 class="heading">Caption</h4>
                    <p class="sub-heading">(In Any Language)</p>
                  </div>
                </div>
                <div class="col-lg-7">
                  <input type="text" class="input-field" name="caption" placeholder="Enter caption" value="{{ $data->caption }}">
                </div>
              </div>

              {{-- File Upload --}}
              <div class="row">
                <div class="col-lg-4">
                  <div class="left-area">
                    <h4 class="heading">Upload File *</h4>
                    <p class="sub-heading">(Image or Video based on Type)</p>
                  </div>
                </div>
                <div class="col-lg-7">

                  {{-- Show current file --}}
                  @if($data->file)
                    <div class="mb-3">
                      @if($data->type == 'image')
                        <img src="{{ $data->file ?? '' }}" alt="Story Image" width="120" class="mb-2">
                      @elseif($data->type == 'video')
                        <video width="200" controls class="mb-2">
                          <source src="{{ $data->file ?? '' }}" type="video/mp4">
                          Your browser does not support the video tag.
                        </video>
                      @endif
                    </div>
                  @endif

                  <input type="file" class="input-field" name="file" accept="image/*,video/*">
                </div>
              </div>

              {{-- Status --}}
              <div class="row">
                <div class="col-lg-4">
                  <div class="left-area">
                    <h4 class="heading">Status *</h4>
                  </div>
                </div>
                <div class="col-lg-7">
                  <select class="input-field" name="status" required>
                    <option value="1" {{ $data->status == 1 ? 'selected' : '' }}>Active</option>
                    <option value="0" {{ $data->status == 0 ? 'selected' : '' }}>Inactive</option>
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
