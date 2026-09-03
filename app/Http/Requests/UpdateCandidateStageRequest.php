<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCandidateStageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stage' => ['required', 'in:applied,interview,test,offer,accepted,rejected'],
        ];
    }

    public function messages(): array
    {
        return [
            'stage.required' => 'Stage is required.',
            'stage.in'       => 'Invalid stage. Must be one of: applied, interview, test, offer, accepted, rejected.',
        ];
    }
}
