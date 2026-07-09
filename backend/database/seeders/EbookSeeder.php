<?php

namespace Database\Seeders;

use App\Models\Ebook;
use Illuminate\Database\Seeder;

class EbookSeeder extends Seeder
{
    /**
     * Seed the ebooks table.
     */
    public function run(): void
    {
        // Prevent duplicate seeding
        if (Ebook::count() > 0) {
            echo "Ebooks table already seeded, skipping...\n";
            return;
        }

        $ebooks = [
            [
                'title' => 'Laskar Pelangi',
                'author' => 'Andrea Hirata',
                'pages' => 529,
                'poin_per_halaman' => 5,
                'category' => 'Fiksi',
                'grade_level' => '2',
                'is_active' => true,
            ],
            [
                'title' => 'Harry Potter dan Batu Bertuah',
                'author' => 'J.K. Rowling',
                'pages' => 309,
                'poin_per_halaman' => 5,
                'category' => 'Fantasi',
                'grade_level' => '2',
                'is_active' => true,
            ],
            [
                'title' => 'Perahu Kertas',
                'author' => 'Dee Lestari',
                'pages' => 415,
                'poin_per_halaman' => 5,
                'category' => 'Fiksi',
                'grade_level' => '2',
                'is_active' => true,
            ],
            [
                'title' => 'Si Kancil Mencuri Timun',
                'author' => 'Cerita Rakyat Indonesia',
                'pages' => 45,
                'poin_per_halaman' => 10,
                'category' => 'Cerita Rakyat',
                'grade_level' => '1',
                'is_active' => true,
            ],
            [
                'title' => 'Putri Salju dan Tujuh Kurcaci',
                'author' => 'Brothers Grimm',
                'pages' => 78,
                'poin_per_halaman' => 8,
                'category' => 'Dongeng',
                'grade_level' => '1',
                'is_active' => true,
            ],
            [
                'title' => 'Anak Rantau',
                'author' => 'A. Fuadi',
                'pages' => 488,
                'poin_per_halaman' => 5,
                'category' => 'Motivasi',
                'grade_level' => '2',
                'is_active' => true,
            ],
            [
                'title' => 'Filosofi Teras',
                'author' => 'Henry Manampiring',
                'pages' => 200,
                'poin_per_halaman' => 7,
                'category' => 'Filosofi',
                'grade_level' => '3',
                'is_active' => true,
            ],
            [
                'title' => 'Sang Pemimpi',
                'author' => 'Andrea Hirata',
                'pages' => 370,
                'poin_per_halaman' => 5,
                'category' => 'Fiksi',
                'grade_level' => '2',
                'is_active' => true,
            ],
        ];

        foreach ($ebooks as $ebook) {
            Ebook::create($ebook);
        }

        echo "Ebooks seeded successfully! (" . count($ebooks) . " books added)\n";
    }
}
