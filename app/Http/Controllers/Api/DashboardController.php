<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Models\Activity;
use App\Models\Candidate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard/stats
     */
    public function stats(): JsonResponse
    {
        $stages = ['applied', 'interview', 'test', 'offer', 'accepted', 'rejected'];

        $counts = Candidate::query()
            ->selectRaw('stage, COUNT(*) as count')
            ->groupBy('stage')
            ->pluck('count', 'stage')
            ->toArray();

        $stats = [];
        foreach ($stages as $stage) {
            $stats[$stage] = $counts[$stage] ?? 0;
        }

        $stats['total'] = array_sum($stats);

        return response()->json(['data' => $stats]);
    }

    /**
     * GET /api/dashboard/recent-activity
     * Returns the 15 most recent activity records across all candidates,
     * with the candidate name included.
     */
    public function recentActivity(): JsonResponse
    {
        $activities = Activity::with('candidate:id,name')
            ->latest()
            ->limit(15)
            ->get()
            ->map(fn($a) => [
                'id'             => $a->id,
                'candidate_id'   => $a->candidate_id,
                'candidate_name' => $a->candidate?->name ?? 'Unknown',
                'type'           => $a->type,
                'description'    => $a->description,
                'meta'           => $a->meta,
                'created_at'     => $a->created_at?->toISOString(),
            ]);

        return response()->json(['data' => $activities]);
    }
}
