<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'candidate_id' => $this->candidate_id,
            'type'         => $this->type,
            'description'  => $this->description,
            'meta'         => $this->meta,
            'created_at'   => $this->created_at?->toISOString(),
        ];
    }
}
