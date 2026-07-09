<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Book::where('is_active', true);

        // Filter by grade level if provided
        if ($request->has('grade_level')) {
            $query->where('grade_level', $request->grade_level);
        }

        // Filter by genre if provided
        if ($request->has('genre')) {
            $query->where('genre', $request->genre);
        }

        // Search by title or author
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%");
            });
        }

        $books = $query->paginate(15);

        return response()->json([
            'data' => $books->items(),
            'pagination' => [
                'current_page' => $books->currentPage(),
                'per_page' => $books->perPage(),
                'total' => $books->total(),
                'last_page' => $books->lastPage(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'isbn' => 'nullable|string|unique:books',
            'publisher' => 'nullable|string',
            'published_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'pages' => 'required|integer|min:1',
            'genre' => 'required|string',
            'grade_level' => 'required|in:1,2,3,all',
            'description' => 'nullable|string',
            'cover_image_url' => 'nullable|url',
        ]);

        $book = Book::create($validated + ['is_active' => true]);

        return response()->json([
            'message' => 'Book created successfully',
            'data' => $book,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $book = Book::where('is_active', true)->findOrFail($id);

        return response()->json([
            'data' => $book,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'author' => 'sometimes|string|max:255',
            'isbn' => 'sometimes|string|unique:books,isbn,' . $id,
            'publisher' => 'sometimes|string',
            'published_year' => 'sometimes|integer|min:1900|max:' . date('Y'),
            'pages' => 'sometimes|integer|min:1',
            'genre' => 'sometimes|string',
            'grade_level' => 'sometimes|in:sd,smp,sma',
            'description' => 'sometimes|string',
            'cover_image_url' => 'sometimes|url',
            'is_active' => 'sometimes|boolean',
        ]);

        $book->update($validated);

        return response()->json([
            'message' => 'Book updated successfully',
            'data' => $book,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $book = Book::findOrFail($id);
        $book->update(['is_active' => false]);

        return response()->json([
            'message' => 'Book deactivated successfully',
        ]);
    }
}

