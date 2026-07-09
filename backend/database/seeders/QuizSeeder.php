<?php

namespace Database\Seeders;

use App\Models\Ebook;
use App\Models\QuizQuestion;
use App\Models\User;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    /**
     * Seed the quiz_questions table.
     */
    public function run(): void
    {
        // Prevent duplicate seeding
        if (QuizQuestion::count() > 0) {
            echo "Quiz questions already seeded, skipping...\n";
            return;
        }

        // Get teacher user for created_by
        $teacher = User::where('role', 'guru')->first();
        if (!$teacher) {
            echo "No teacher found, skipping quiz seeding...\n";
            return;
        }

        // Get ebooks
        $ebooks = Ebook::all();
        if ($ebooks->isEmpty()) {
            echo "No ebooks found, please seed ebooks first...\n";
            return;
        }

        // Quiz data for each ebook
        $quizzes = [
            // Laskar Pelangi (Ebook ID 1)
            1 => [
                [
                    'question' => 'Siapakah nama tokoh utama dalam novel Laskar Pelangi?',
                    'option_a' => 'Ikal',
                    'option_b' => 'Belum Jelas',
                    'option_c' => 'Samson',
                    'option_d' => 'Mahar',
                    'correct_answer' => 'a',
                ],
                [
                    'question' => 'Di mana latar belakang cerita Laskar Pelangi?',
                    'option_a' => 'Jakarta',
                    'option_b' => 'Pulau Belitung',
                    'option_c' => 'Surabaya',
                    'option_d' => 'Bandung',
                    'correct_answer' => 'b',
                ],
                [
                    'question' => 'Berapa banyak siswa dalam Laskar Pelangi?',
                    'option_a' => '5 siswa',
                    'option_b' => '7 siswa',
                    'option_c' => '10 siswa',
                    'option_d' => '12 siswa',
                    'correct_answer' => 'b',
                ],
                [
                    'question' => 'Siapakah guru mereka yang paling berpengaruh?',
                    'option_a' => 'Pak Musiman',
                    'option_b' => 'Bu Ching',
                    'option_c' => 'Pak Harfan',
                    'option_d' => 'Pak Bejo',
                    'correct_answer' => 'c',
                ],
                [
                    'question' => 'Apa pekerjaan ayah Ikal?',
                    'option_a' => 'Nelayan',
                    'option_b' => 'Petani',
                    'option_c' => 'Guru',
                    'option_d' => 'Pekerja tambang',
                    'correct_answer' => 'a',
                ],
            ],
            // Harry Potter dan Batu Bertuah (Ebook ID 2)
            2 => [
                [
                    'question' => 'Berapa tahun umur Harry Potter pada awal cerita?',
                    'option_a' => '10 tahun',
                    'option_b' => '11 tahun',
                    'option_c' => '12 tahun',
                    'option_d' => '13 tahun',
                    'correct_answer' => 'b',
                ],
                [
                    'question' => 'Siapakah penyihir jahat yang dicari Harry?',
                    'option_a' => 'Lord Voldemort',
                    'option_b' => 'Albus Dumbledore',
                    'option_c' => 'Severus Snape',
                    'option_d' => 'Gilderoy Lockhart',
                    'correct_answer' => 'a',
                ],
                [
                    'question' => 'Di mana Sekolah Sihir Hogwarts berada?',
                    'option_a' => 'Inggris',
                    'option_b' => 'Skotlandia',
                    'option_c' => 'Wales',
                    'option_d' => 'Irlandia',
                    'correct_answer' => 'b',
                ],
                [
                    'question' => 'Siapakah sahabat terbaik Harry Potter?',
                    'option_a' => 'Draco Malfoy',
                    'option_b' => 'Ron Weasley',
                    'option_c' => 'Cedric Diggory',
                    'option_d' => 'Oliver Wood',
                    'correct_answer' => 'b',
                ],
                [
                    'question' => 'Apakah jenis makhluk hidup yang menjaga Hogwarts?',
                    'option_a' => 'Naga',
                    'option_b' => 'Phoenix',
                    'option_c' => 'Hippogriff',
                    'option_d' => 'Thestral',
                    'correct_answer' => 'a',
                ],
            ],
            // Perahu Kertas (Ebook ID 3)
            3 => [
                [
                    'question' => 'Siapakah tokoh utama dalam novel Perahu Kertas?',
                    'option_a' => 'Kesia dan Kara',
                    'option_b' => 'Rani dan Rara',
                    'option_c' => 'Kugy dan Kara',
                    'option_d' => 'Lala dan Adi',
                    'correct_answer' => 'c',
                ],
                [
                    'question' => 'Apa profesi Kugy dalam cerita?',
                    'option_a' => 'Penari',
                    'option_b' => 'Penyair',
                    'option_c' => 'Penyanyi',
                    'option_d' => 'Pelukis',
                    'correct_answer' => 'b',
                ],
                [
                    'question' => 'Apa yang Kara pelajari di sekolah?',
                    'option_a' => 'Seni Rupa',
                    'option_b' => 'Arsitektur',
                    'option_c' => 'Desain Grafis',
                    'option_d' => 'Ilmu Komputer',
                    'correct_answer' => 'c',
                ],
            ],
            // Si Kancil Mencuri Timun (Ebook ID 4)
            4 => [
                [
                    'question' => 'Siapakah tokoh utama dalam cerita Si Kancil Mencuri Timun?',
                    'option_a' => 'Gajah',
                    'option_b' => 'Kancil',
                    'option_c' => 'Harimau',
                    'option_d' => 'Monyet',
                    'correct_answer' => 'b',
                ],
                [
                    'question' => 'Apa yang ingin diambil Kancil?',
                    'option_a' => 'Mangga',
                    'option_b' => 'Pisang',
                    'option_c' => 'Timun',
                    'option_d' => 'Jagung',
                    'correct_answer' => 'c',
                ],
                [
                    'question' => 'Bagaimana cara Kancil mendapatkan timun tersebut?',
                    'option_a' => 'Dengan berkelahi',
                    'option_b' => 'Dengan trik dan tipu daya',
                    'option_c' => 'Dengan meminta kepada pemiliknya',
                    'option_d' => 'Dengan berlari cepat',
                    'correct_answer' => 'b',
                ],
            ],
            // Putri Salju dan Tujuh Kurcaci (Ebook ID 5)
            5 => [
                [
                    'question' => 'Berapa jumlah kurcaci dalam cerita Putri Salju?',
                    'option_a' => '5 kurcaci',
                    'option_b' => '6 kurcaci',
                    'option_c' => '7 kurcaci',
                    'option_d' => '8 kurcaci',
                    'correct_answer' => 'c',
                ],
                [
                    'question' => 'Apa yang digunakan Ratu Jahat untuk membunuh Putri Salju?',
                    'option_a' => 'Racun',
                    'option_b' => 'Apel beracun',
                    'option_c' => 'Belati',
                    'option_d' => 'Mantra jahat',
                    'correct_answer' => 'b',
                ],
                [
                    'question' => 'Siapakah yang akhirnya menyelamatkan Putri Salju?',
                    'option_a' => 'Pangeran',
                    'option_b' => 'Raksasa baik',
                    'option_c' => 'Penyihir baik',
                    'option_d' => 'Raja',
                    'correct_answer' => 'a',
                ],
            ],
            // Anak Rantau (Ebook ID 6)
            6 => [
                [
                    'question' => 'Dari mana asal tokoh utama dalam Anak Rantau?',
                    'option_a' => 'Jawa',
                    'option_b' => 'Sumatera',
                    'option_c' => 'Kalimantan',
                    'option_d' => 'Bali',
                    'correct_answer' => 'b',
                ],
                [
                    'question' => 'Apa tujuan utama tokoh dalam merantau?',
                    'option_a' => 'Menghindari masalah',
                    'option_b' => 'Mencari kekayaan',
                    'option_c' => 'Mengejar ilmu dan impian',
                    'option_d' => 'Berlibur',
                    'correct_answer' => 'c',
                ],
                [
                    'question' => 'Berapa banyak fondasi yang dibangun oleh tokoh?',
                    'option_a' => 'Satu',
                    'option_b' => 'Dua',
                    'option_c' => 'Tiga',
                    'option_d' => 'Empat',
                    'correct_answer' => 'c',
                ],
            ],
            // Filosofi Teras (Ebook ID 7)
            7 => [
                [
                    'question' => 'Apa yang menjadi fokus utama buku Filosofi Teras?',
                    'option_a' => 'Sejarah',
                    'option_b' => 'Filsafat Stoik',
                    'option_c' => 'Agama',
                    'option_d' => 'Sains',
                    'correct_answer' => 'b',
                ],
                [
                    'question' => 'Siapakah penulis buku Filosofi Teras?',
                    'option_a' => 'Rene Descartes',
                    'option_b' => 'Henry Manampiring',
                    'option_c' => 'Aristoteles',
                    'option_d' => 'Plato',
                    'correct_answer' => 'b',
                ],
                [
                    'question' => 'Apa pesan utama dari Stoicisme?',
                    'option_a' => 'Mengejar kesenangan',
                    'option_b' => 'Melepaskan emosi negatif dan fokus pada hal yang dapat dikontrol',
                    'option_c' => 'Mengasingkan diri dari masyarakat',
                    'option_d' => 'Menghindari tanggung jawab',
                    'correct_answer' => 'b',
                ],
            ],
            // Sang Pemimpi (Ebook ID 8)
            8 => [
                [
                    'question' => 'Siapakah tokoh utama dalam Sang Pemimpi?',
                    'option_a' => 'Ikal',
                    'option_b' => 'Arai',
                    'option_c' => 'Samson',
                    'option_d' => 'Mahar',
                    'correct_answer' => 'a',
                ],
                [
                    'question' => 'Apa yang menjadi impian utama tokoh?',
                    'option_a' => 'Menjadi dokter',
                    'option_b' => 'Menjadi penulis',
                    'option_c' => 'Keliling dunia',
                    'option_d' => 'Menjadi guru',
                    'correct_answer' => 'c',
                ],
                [
                    'question' => 'Di negara mana tokoh melanjutkan sekolah?',
                    'option_a' => 'Amerika',
                    'option_b' => 'Eropa',
                    'option_c' => 'Australia',
                    'option_d' => 'Jepang',
                    'correct_answer' => 'c',
                ],
            ],
        ];

        // Create quiz questions
        $totalCreated = 0;
        foreach ($quizzes as $ebookId => $questions) {
            foreach ($questions as $question) {
                // Check if ebook exists
                if (!Ebook::find($ebookId)) {
                    continue;
                }

                QuizQuestion::create([
                    'ebook_id' => $ebookId,
                    'created_by' => $teacher->id,
                    'question' => $question['question'],
                    'option_a' => $question['option_a'],
                    'option_b' => $question['option_b'],
                    'option_c' => $question['option_c'],
                    'option_d' => $question['option_d'],
                    'correct_answer' => $question['correct_answer'],
                ]);
                $totalCreated++;
            }
        }

        echo "Quiz questions seeded successfully! (" . $totalCreated . " questions added)\n";
    }
}
