<?php

namespace App\Http\Controllers\Api;

/**
 * @deprecated Gunakan \App\Services\StorageHelper langsung.
 * File ini hanya alias backward-compatibility agar controller lama
 * yang belum di-update tidak break. Akan dihapus di iterasi berikutnya.
 */
class StorageHelper extends \App\Services\StorageHelper
{
    // Semua method diwarisi dari App\Services\StorageHelper
}
