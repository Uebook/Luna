<?php

namespace App\Http\Controllers\Admin;

use App\{
    Classes\GeniusMailer,
    Models\Story,
    Models\Generalsetting,
    Models\User,
    Models\Category
};
use Illuminate\Http\Request;
use Datatables;
use Illuminate\Support\Facades\Validator;

class StoryController extends AdminBaseController
{

    //*** JSON Request
  public function datatables()
{
    $datas = Story::with(['user', 'category'])->latest('id')->get();

    return Datatables::of($datas)
        ->addColumn('vendor_name', fn($data) => $data->user->name ?? 'N/A')
        ->addColumn('category_name', fn($data) => $data->category->name ?? 'N/A')
        ->addColumn('action', function($data) {
            return '
              <div class="action-list">
                <a data-href="' . route('admin-story-edit', $data->id) . '" class="edit" data-toggle="modal" data-target="#modal1">
                  <i class="fas fa-edit"></i> Edit
                </a>
                <a href="javascript:;" data-href="' . route('admin-story-delete', $data->id) . '" data-toggle="modal" data-target="#confirm-delete" class="delete">
                  <i class="fas fa-trash"></i> Delete
                </a>
              </div>';
        })
        ->toJson();
}


    public function index(){
        return view('admin.story.index');
    }

    

    

public function destroy($id)
{
    $data = Story::findOrFail($id);

    // Delete file if exists
    if ($data->file && str_contains($data->file, url('/'))) {
        $oldPath = str_replace(url('/').'/', public_path('/'), $data->file);
        if (file_exists($oldPath)) {
            @unlink($oldPath);
        }
    }

    $data->delete();

    return response()->json(__('Data Deleted Successfully.'));
}
public function edit($id)
{
        $data = Story::findOrFail($id);
        $categories=Category::where('status',1)->get();
        $users=User::where('is_provider',1)->orderBy('name','asc')->get();
        return view('admin.story.edit',compact('data','categories','users'));
    }
public function update(Request $request, $id)
{
    $data = Story::findOrFail($id);
    $input = $request->except('file');

    // Handle file upload (image or video)
    if ($request->hasFile('file')) {
        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $filename = time() . '_' . uniqid() . '.' . $extension;

        $destination = public_path('assets/images/stories');
        if (!file_exists($destination)) {
            mkdir($destination, 0755, true);
        }

        // Move the uploaded file
        $file->move($destination, $filename);

        // Save the full URL
        $fileUrl = url('assets/images/stories/' . $filename);
        $input['file'] = $fileUrl;
    }

    $data->update($input);

    return response()->json(__('Data Updated Successfully.'));
}
public function create()
{
    $categories = Category::where('status', 1)->get();
    $users = User::where('is_provider', 1)->orderBy('name', 'asc')->get();

    return view('admin.story.create', compact('categories', 'users'));
}


public function store(Request $request)
{
    try {
        $rules = [
            'user_id' => 'required|exists:users,id',
            'category_id' => 'required|exists:categories,id',
            'type' => 'required|string|in:image,video',
            'caption' => 'nullable|string|max:255',
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,mp4,mov,avi|max:20480',
        ];

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()->all()]);
        }

        $input = $request->except('file');

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            $filename = time() . '_' . uniqid() . '.' . $extension;

            $destination = public_path('assets/images/stories');
            if (!file_exists($destination)) {
                mkdir($destination, 0755, true);
            }

            $file->move($destination, $filename);

            $fileUrl = url('assets/images/stories/' . $filename);
            $input['file'] = $fileUrl;
        }

        Story::create($input);

        return response()->json(__('Data Updated Successfully.'));
    } catch (\Throwable $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'line' => $e->getLine(),
            'file' => $e->getFile(),
        ], 500);
    }
}



}
