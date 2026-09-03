import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { login } from '@/api/auth';
import { cn } from '@/lib/utils';

const LOGO = 'https://central.theforgebrand.shop/wp-content/uploads/2026/09/ChatGPT_Image_Sep_3__2026__08_22_43_AM-removebg-preview-e1788420541800.png';
const BG   = 'https://central.theforgebrand.shop/wp-content/uploads/2026/09/ChatGPT-Image-Sep-3-2026-12_55_15-AM.png';

const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginValues = z.infer<typeof loginSchema>;

interface AuthPageProps {
  onAuthenticated: (token: string, user: { id: number; name: string; email: string }) => void;
}

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError]   = useState('');
  const [loading, setLoading]           = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    setServerError('');
    setLoading(true);
    try {
      const { token, user } = await login(values.email, values.password);
      localStorage.setItem('ht_token', token);
      localStorage.setItem('ht_user', JSON.stringify(user));
      onAuthenticated(token, user);
    } catch (err: any) {
      setServerError(
        err?.response?.data?.errors?.email?.[0] ||
        err?.response?.data?.message ||
        'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center overflow-hidden">

      {/* Background — full cover */}
      <img src={BG} alt="" aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center select-none pointer-events-none"
        draggable={false}
      />

      {/* Cream gradient wash — wider, softer fade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(238,232,226,0.85) 0%, rgba(238,232,226,0.65) 38%, rgba(238,232,226,0.20) 58%, transparent 75%)',
        }}
      />

      {/* ── Form area — wider, better centred on left half ── */}
      <div className="relative z-10 w-full flex justify-start">
        {/* This wrapper defines how far from the left edge */}
        <div className="w-full max-w-md xl:max-w-lg px-8 sm:px-0 sm:ml-14 md:ml-20 lg:ml-24 xl:ml-28">

          {/* Logo — large, prominent, top of form */}
          <div className="mb-10">
            <img
              src={LOGO}
              alt="HireTrack"
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>

          {/* Heading */}
          <div className="mb-8 space-y-2">
            <h1 className="text-5xl sm:text-6xl font-bold leading-none tracking-tight text-gray-900">
              Welcome<br />back.
            </h1>
            <p className="text-base font-medium" style={{ color: '#B27E55' }}>
              Sign in to your hiring dashboard.
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="flex items-start gap-2.5 text-sm px-4 py-3 rounded-2xl border mb-5"
              style={{ background: 'rgba(178,126,85,0.10)', borderColor: '#B27E55', color: '#7a4f1e' }}>
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#B27E55' }} />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest block" style={{ color: '#575E44' }} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full h-14 rounded-2xl px-5 text-base font-medium text-gray-900 bg-white/65 backdrop-blur-sm border-2 placeholder:text-gray-400 focus:outline-none transition-all"
                style={{ borderColor: errors.email ? '#ef4444' : '#B27E55' }}
                onFocus={e  => { if (!errors.email) e.currentTarget.style.borderColor = '#575E44'; }}
                onBlur={e   => { if (!errors.email) e.currentTarget.style.borderColor = '#B27E55'; }}
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-600 pl-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest block" style={{ color: '#575E44' }} htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-14 rounded-2xl px-5 pr-14 text-base font-medium text-gray-900 bg-white/65 backdrop-blur-sm border-2 placeholder:text-gray-400 focus:outline-none transition-all"
                  style={{ borderColor: errors.password ? '#ef4444' : '#B27E55' }}
                  onFocus={e  => { if (!errors.password) e.currentTarget.style.borderColor = '#575E44'; }}
                  onBlur={e   => { if (!errors.password) e.currentTarget.style.borderColor = '#B27E55'; }}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#B27E55' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 pl-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full h-14 rounded-2xl text-base font-bold tracking-wide mt-2',
                'text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
                loading && 'opacity-70 cursor-not-allowed'
              )}
              style={{ backgroundColor: '#575E44', boxShadow: '0 4px 24px rgba(87,94,68,0.28)' }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4a5139'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#575E44'; }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-xs mt-8" style={{ color: '#B27E55' }}>
            © {new Date().getFullYear()} HireTrack · All rights reserved
          </p>

        </div>
      </div>
    </div>
  );
}
