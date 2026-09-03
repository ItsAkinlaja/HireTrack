<?php

namespace App\Services;

use App\Models\Activity;

class ActivityLogger
{
    public static function log(int $candidateId, string $type, string $description, ?array $meta = null): void
    {
        Activity::create([
            'candidate_id' => $candidateId,
            'type'         => $type,
            'description'  => $description,
            'meta'         => $meta,
        ]);
    }

    public static function candidateCreated(int $candidateId): void
    {
        self::log($candidateId, 'created', 'Candidate profile created');
    }

    public static function candidateUpdated(int $candidateId): void
    {
        self::log($candidateId, 'updated', 'Candidate profile updated');
    }

    public static function stageChanged(int $candidateId, string $from, string $to): void
    {
        self::log(
            $candidateId,
            'stage_changed',
            "Stage changed from {$from} to {$to}",
            ['from' => $from, 'to' => $to]
        );
    }

    public static function noteAdded(int $candidateId): void
    {
        self::log($candidateId, 'note_added', 'Note added');
    }

    public static function noteDeleted(int $candidateId): void
    {
        self::log($candidateId, 'note_deleted', 'Note deleted');
    }
}
