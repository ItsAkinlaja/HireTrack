import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createCandidate, updateCandidate } from '@/api/candidates';
import { STAGES, STAGE_LABELS } from '@/lib/utils';
import type { Candidate } from '@/types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StarRating } from '@/components/ui/star-rating';
import { Spinner } from '@/components/ui/spinner';

// ─── Validation schema ────────────────────────────────────────────────────────

const schema = z.object({
  name:       z.string().min(1, 'Full name is required').max(255),
  email:      z.string().min(1, 'Email is required').email('Enter a valid email address'),
  phone:      z.string().max(50).optional().or(z.literal('')),
  position:   z.string().min(1, 'Position is required').max(255),
  resume_url: z.string().url('Must be a valid URL').max(2048).optional().or(z.literal('')),
  stage:      z.enum(['applied', 'interview', 'test', 'offer', 'accepted', 'rejected']),
  rating:     z.number().int().min(1).max(5).nullable(),
});

type FormValues = z.infer<typeof schema>;

// ─── Component ────────────────────────────────────────────────────────────────

interface CandidateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate?: Candidate | null;
  defaultStage?: string;
}

export function CandidateForm({ open, onOpenChange, candidate, defaultStage }: CandidateFormProps) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(candidate);

  const {
    register, handleSubmit, control, reset, setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:       '',
      email:      '',
      phone:      '',
      position:   '',
      resume_url: '',
      stage:      (defaultStage as FormValues['stage']) || 'applied',
      rating:     null,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (candidate) {
        reset({
          name:       candidate.name,
          email:      candidate.email,
          phone:      candidate.phone ?? '',
          position:   candidate.position,
          resume_url: candidate.resume_url ?? '',
          stage:      candidate.stage,
          rating:     candidate.rating ?? null,
        });
      } else {
        reset({
          name: '', email: '', phone: '', position: '', resume_url: '',
          stage: (defaultStage as FormValues['stage']) || 'applied',
          rating: null,
        });
      }
    }
  }, [open, candidate, defaultStage, reset]);

  const createMutation = useMutation({
    mutationFn: createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Candidate added successfully');
      onOpenChange(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to add candidate';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Candidate>) => updateCandidate(candidate!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate', candidate!.id] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Candidate updated successfully');
      onOpenChange(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update candidate';
      toast.error(msg);
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      phone:      values.phone || null,
      resume_url: values.resume_url || null,
    };
    if (isEdit) {
      updateMutation.mutate(payload as Partial<Candidate>);
    } else {
      createMutation.mutate(payload as Partial<Candidate>);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Candidate' : 'Add New Candidate'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the candidate\'s information.' : 'Fill in the details to add a new candidate to the pipeline.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-2 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
            <Input id="name" placeholder="e.g. Jane Smith" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
            <Input id="email" type="email" placeholder="jane@example.com" {...register('email')} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Phone + Position row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1-555-0100" {...register('phone')} />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="position">Position <span className="text-red-500">*</span></Label>
              <Input id="position" placeholder="e.g. Frontend Engineer" {...register('position')} />
              {errors.position && <p className="text-xs text-red-500">{errors.position.message}</p>}
            </div>
          </div>

          {/* Resume URL */}
          <div className="space-y-1.5">
            <Label htmlFor="resume_url">Resume URL</Label>
            <Input id="resume_url" placeholder="https://..." {...register('resume_url')} />
            {errors.resume_url && <p className="text-xs text-red-500">{errors.resume_url.message}</p>}
          </div>

          {/* Stage + Rating row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Controller
                control={control}
                name="stage"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => (
                        <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <Controller
                control={control}
                name="rating"
                render={({ field }) => (
                  <div className="flex items-center h-9">
                    <StarRating
                      value={field.value}
                      onChange={(r) => field.onChange(field.value === r ? null : r)}
                    />
                    {field.value && (
                      <button
                        type="button"
                        className="ml-2 text-xs text-gray-400 hover:text-gray-600"
                        onClick={() => field.onChange(null)}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
            {isPending && <Spinner size="sm" className="text-white" />}
            {isEdit ? 'Save Changes' : 'Add Candidate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
