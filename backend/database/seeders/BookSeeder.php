<?php

namespace Database\Seeders;

use App\Models\Book;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    /**
     * Seed the books table.
     */
    public function run(): void
    {
        // Prevent duplicate seeding
        if (Book::count() > 0) {
            echo "Books table already seeded, skipping...\n";
            return;
        }

        $books = [
            [
                'title' => 'Laskar Pelangi',
                'author' => 'Andrea Hirata',
                'pages' => 529,
                'category' => 'Fiksi',
                'description' => 'Petualangan siswa-siswa berbakat di sekolah khusus',
                'is_active' => true,
            ],
            [
                'title' => 'Harry Potter dan Batu Bertuah',
                'author' => 'J.K. Rowling',
                'pages' => 309,
                'category' => 'Fantasi',
                'description' => 'Petualangan seorang penyihir muda di Hogwarts',
                'is_active' => true,
            ],
            [
                'title' => 'Perahu Kertas',
                'author' => 'Dee Lestari',
                'pages' => 415,
                'category' => 'Fiksi',
                'description' => 'Kisah cinta dua seniman muda yang mencari makna hidup',
                'is_active' => true,
            ],
            [
                'title' => 'The Little Prince',
                'author' => 'Antoine de Saint-Exupéry',
                'pages' => 96,
                'category' => 'Fantasi',
                'description' => 'Perjalanan spiritual seorang pangeran kecil dari planet lain',
                'is_active' => true,
            ],
        ];

        foreach ($books as $book) {
            Book::create($book);
        }

        echo "Books seeded successfully!\n";
    }
}
