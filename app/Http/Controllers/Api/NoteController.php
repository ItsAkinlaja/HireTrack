<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNoteRequest;
use App\Http\Resources\NoteResource;
use App\Models\Candidate;
use App\Models\Note;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NoteController extends Controller
{
    /**
     * GET /api/candidates/{candidate}/notes
     */
    public function index(Candidate $candidate): AnonymousResourceCollection
    {
        $notes = $candidate->notes()->latest()->get();

        return NoteResource::collection($notes);
    }

    /**
     * POST /api/candidates/{candidate}/notes
     */
    public function store(StoreNoteRequest $request, Candidate $candidate): NoteResource
    {
        $note = $candidate->notes()->create($request->validated());

        ActivityLogger::noteAdded($candidate->id);

        return new NoteResource($note);
    }

    /**
     * DELETE /api/notes/{note}
     */
    public function destroy(Note $note): JsonResponse
    {
        $candidateId = $note->candidate_id;
        $note->delete();

        ActivityLogger::noteDeleted($candidateId);

        return response()->json(['message' => 'Note deleted successfully.']);
    }
}
