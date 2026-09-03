<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Candidate;
use App\Models\Note;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class CandidateSeeder extends Seeder
{
    public function run(): void
    {
        $candidates = [
            // Applied
            [
                'name' => 'Tobiloba Adeyemi', 'email' => 'tobiloba.adeyemi@example.com',
                'phone' => '+234-803-456-7890', 'position' => 'Frontend Engineer',
                'resume_url' => 'https://example.com/resumes/tobiloba-adeyemi.pdf',
                'stage' => 'applied', 'rating' => 3,
                'notes' => ['Strong portfolio with React projects. Follow up next week.'],
                'days_ago' => 2,
            ],
            [
                'name' => 'Emeka Okonkwo', 'email' => 'emeka.okonkwo@example.com',
                'phone' => '+234-806-123-4567', 'position' => 'Backend Engineer',
                'resume_url' => null,
                'stage' => 'applied', 'rating' => null,
                'notes' => [],
                'days_ago' => 1,
            ],
            [
                'name' => 'Ngozi Eze', 'email' => 'ngozi.eze@example.com',
                'phone' => '+234-810-987-6543', 'position' => 'Product Designer',
                'resume_url' => 'https://example.com/resumes/ngozi-eze.pdf',
                'stage' => 'applied', 'rating' => 4,
                'notes' => ['Excellent Figma portfolio. Very clean design sensibility.'],
                'days_ago' => 3,
            ],
            // Interview
            [
                'name' => 'Chukwuemeka Nwosu', 'email' => 'chukwuemeka.nwosu@example.com',
                'phone' => '+234-815-234-5678', 'position' => 'Full Stack Developer',
                'resume_url' => 'https://example.com/resumes/chukwuemeka-nwosu.pdf',
                'stage' => 'interview', 'rating' => 4,
                'notes' => ['Very articulate. Strong Node.js and Laravel knowledge.', 'Passed initial phone screen — schedule technical round.'],
                'days_ago' => 7,
            ],
            [
                'name' => 'Adaeze Okafor', 'email' => 'adaeze.okafor@example.com',
                'phone' => '+234-802-345-6789', 'position' => 'DevOps Engineer',
                'resume_url' => null,
                'stage' => 'interview', 'rating' => 3,
                'notes' => ['Good AWS experience. Needs more Kubernetes depth.'],
                'days_ago' => 5,
            ],
            // Test
            [
                'name' => 'Oluwaseun Balogun', 'email' => 'oluwaseun.balogun@example.com',
                'phone' => '+234-818-765-4321', 'position' => 'Senior Backend Engineer',
                'resume_url' => 'https://example.com/resumes/oluwaseun-balogun.pdf',
                'stage' => 'test', 'rating' => 5,
                'notes' => ['Best candidate so far. Outstanding system design answers.', 'Technical interview was exceptional — fast-track this one.'],
                'days_ago' => 12,
            ],
            [
                'name' => 'Ifeanyi Okeke', 'email' => 'ifeanyi.okeke@example.com',
                'phone' => '+234-808-654-3210', 'position' => 'Frontend Engineer',
                'resume_url' => 'https://example.com/resumes/ifeanyi-okeke.pdf',
                'stage' => 'test', 'rating' => 4,
                'notes' => ['Solid React and TypeScript skills. Take-home assignment sent.'],
                'days_ago' => 9,
            ],
            // Offer
            [
                'name' => 'Amara Obiora', 'email' => 'amara.obiora@example.com',
                'phone' => '+234-813-456-7891', 'position' => 'Engineering Manager',
                'resume_url' => 'https://example.com/resumes/amara-obiora.pdf',
                'stage' => 'offer', 'rating' => 5,
                'notes' => ['Exceptional leadership experience.', 'Great culture fit. Reference checks all cleared.', 'Offer letter sent Monday — awaiting response.'],
                'days_ago' => 20,
            ],
            [
                'name' => 'Babatunde Fashola', 'email' => 'babatunde.fashola@example.com',
                'phone' => '+234-805-321-0987', 'position' => 'Data Engineer',
                'resume_url' => null,
                'stage' => 'offer', 'rating' => 4,
                'notes' => ['Excellent SQL and pipeline experience. Currently negotiating salary.'],
                'days_ago' => 15,
            ],
            // Accepted
            [
                'name' => 'Chidinma Uchenna', 'email' => 'chidinma.uchenna@example.com',
                'phone' => '+234-819-876-5432', 'position' => 'Product Manager',
                'resume_url' => 'https://example.com/resumes/chidinma-uchenna.pdf',
                'stage' => 'accepted', 'rating' => 5,
                'notes' => ['Outstanding candidate. Start date confirmed for next month.'],
                'days_ago' => 30,
            ],
            [
                'name' => 'Rotimi Adeleke', 'email' => 'rotimi.adeleke@example.com',
                'phone' => '+234-811-234-5678', 'position' => 'Backend Engineer',
                'resume_url' => 'https://example.com/resumes/rotimi-adeleke.pdf',
                'stage' => 'accepted', 'rating' => 4,
                'notes' => ['Strong Go and Python skills. Joining the platform team next sprint.'],
                'days_ago' => 25,
            ],
            // Rejected
            [
                'name' => 'Segun Abiodun', 'email' => 'segun.abiodun@example.com',
                'phone' => null, 'position' => 'Mobile Developer',
                'resume_url' => null,
                'stage' => 'rejected', 'rating' => 2,
                'notes' => ['Limited Flutter experience. Not the right fit at this stage.'],
                'days_ago' => 14,
            ],
            [
                'name' => 'Blessing Nwachukwu', 'email' => 'blessing.nwachukwu@example.com',
                'phone' => '+234-803-987-6543', 'position' => 'UX Researcher',
                'resume_url' => 'https://example.com/resumes/blessing-nwachukwu.pdf',
                'stage' => 'rejected', 'rating' => 3,
                'notes' => ['Solid research background but seeking a more senior role than we currently have.'],
                'days_ago' => 18,
            ],
        ];

        foreach ($candidates as $data) {
            $createdAt = Carbon::now()->subDays($data['days_ago']);

            $candidate = Candidate::create([
                'name'       => $data['name'],
                'email'      => $data['email'],
                'phone'      => $data['phone'],
                'position'   => $data['position'],
                'resume_url' => $data['resume_url'],
                'stage'      => $data['stage'],
                'rating'     => $data['rating'],
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Initial activity
            Activity::create([
                'candidate_id' => $candidate->id,
                'type'         => 'created',
                'description'  => 'Candidate profile created',
                'created_at'   => $createdAt,
                'updated_at'   => $createdAt,
            ]);

            // Stage transition activity (if not still in applied)
            if ($data['stage'] !== 'applied') {
                $transitionAt = $createdAt->copy()->addDays(3);
                Activity::create([
                    'candidate_id' => $candidate->id,
                    'type'         => 'stage_changed',
                    'description'  => "Stage changed from applied to {$data['stage']}",
                    'meta'         => ['from' => 'applied', 'to' => $data['stage']],
                    'created_at'   => $transitionAt,
                    'updated_at'   => $transitionAt,
                ]);
            }

            // Notes + note_added activities
            foreach ($data['notes'] as $i => $content) {
                $noteAt = $createdAt->copy()->addDays($i + 1);

                Note::create([
                    'candidate_id' => $candidate->id,
                    'content'      => $content,
                    'created_at'   => $noteAt,
                    'updated_at'   => $noteAt,
                ]);

                Activity::create([
                    'candidate_id' => $candidate->id,
                    'type'         => 'note_added',
                    'description'  => 'Note added',
                    'created_at'   => $noteAt,
                    'updated_at'   => $noteAt,
                ]);
            }
        }
    }
}
