<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PointTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'reading_activity_id',
        'redemption_id',
        'points',
        'type',
        'description',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function readingActivity()
    {
        return $this->belongsTo(ReadingActivity::class);
    }

    public function redemption()
    {
        return $this->belongsTo(Redemption::class);
    }
}
