<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCandidateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $candidateId = $this->route('candidate')?->id;

        return [
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'max:255', "unique:candidates,email,{$candidateId}"],
            'phone'      => ['nullable', 'string', 'max:50'],
            'position'   => ['required', 'string', 'max:255'],
            'resume_url' => ['nullable', 'url', 'max:2048'],
            'stage'      => ['sometimes', 'in:applied,interview,test,offer,accepted,rejected'],
            'rating'     => ['nullable', 'integer', 'min:1', 'max:5'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'     => 'Candidate name is required.',
            'email.required'    => 'Email address is required.',
            'email.email'       => 'Please provide a valid email address.',
            'email.unique'      => 'A candidate with this email already exists.',
            'position.required' => 'Position is required.',
            'resume_url.url'    => 'Resume URL must be a valid URL.',
            'stage.in'          => 'Invalid stage value.',
            'rating.min'        => 'Rating must be between 1 and 5.',
            'rating.max'        => 'Rating must be between 1 and 5.',
        ];
    }
}
