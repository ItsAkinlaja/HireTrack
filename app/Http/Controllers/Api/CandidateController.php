<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCandidateRequest;
use App\Http\Requests\UpdateCandidateRequest;
use App\Http\Requests\UpdateCandidateStageRequest;
use App\Http\Resources\ActivityResource;
use App\Http\Resources\CandidateResource;
use App\Models\Candidate;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CandidateController extends Controller
{
    /**
     * GET /api/candidates
     * Supports: search, stage, rating, sort_by, sort_dir
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Candidate::query();

        // Search by name, email, or position
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
            });
        }

        // Filter by stage
        if ($stage = $request->input('stage')) {
            $query->where('stage', $stage);
        }

        // Filter by rating
        if ($rating = $request->input('rating')) {
            $query->where('rating', (int) $rating);
        }

        // Sorting
        $sortBy  = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $allowedSorts = ['created_at', 'rating', 'name'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $candidates = $query->get();

        return CandidateResource::collection($candidates);
    }

    /**
     * POST /api/candidates
     */
    public function store(StoreCandidateRequest $request): CandidateResource
    {
        $candidate = Candidate::create($request->validated());

        ActivityLogger::candidateCreated($candidate->id);

        return new CandidateResource($candidate);
    }

    /**
     * GET /api/candidates/{candidate}
     */
    public function show(Candidate $candidate): CandidateResource
    {
        $candidate->load(['notes', 'activities']);

        return new CandidateResource($candidate);
    }

    /**
     * PUT /api/candidates/{candidate}
     */
    public function update(UpdateCandidateRequest $request, Candidate $candidate): CandidateResource
    {
        $oldStage = $candidate->stage;

        $candidate->update($request->validated());

        // Log stage change if it changed
        if (isset($request->validated()['stage']) && $oldStage !== $candidate->stage) {
            ActivityLogger::stageChanged($candidate->id, $oldStage, $candidate->stage);
        } else {
            ActivityLogger::candidateUpdated($candidate->id);
        }

        return new CandidateResource($candidate);
    }

    /**
     * DELETE /api/candidates/{candidate}
     */
    public function destroy(Candidate $candidate): JsonResponse
    {
        $candidate->delete();

        return response()->json(['message' => 'Candidate deleted successfully.']);
    }

    /**
     * PATCH /api/candidates/{candidate}/stage
     */
    public function updateStage(UpdateCandidateStageRequest $request, Candidate $candidate): CandidateResource
    {
        $oldStage = $candidate->stage;
        $newStage = $request->validated()['stage'];

        if ($oldStage !== $newStage) {
            $candidate->update(['stage' => $newStage]);
            ActivityLogger::stageChanged($candidate->id, $oldStage, $newStage);
        }

        return new CandidateResource($candidate);
    }

    /**
     * GET /api/candidates/{candidate}/activities
     */
    public function activities(Candidate $candidate): AnonymousResourceCollection
    {
        $activities = $candidate->activities()->latest()->get();

        return ActivityResource::collection($activities);
    }
}
