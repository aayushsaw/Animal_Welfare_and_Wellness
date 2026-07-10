import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Heart, Loader2 } from 'lucide-react'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'
import { resolveImageUrl } from '@/lib/utils'
import { usePageTitle } from '@/lib/usePageTitle'

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores'),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72),
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
  usePageTitle('Join Our Community')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const response = await authApi.register(data)
      setAuth(response)
      toast.success('Account created! Welcome to the community 🐾')
      navigate('/')
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={resolveImageUrl('/assets/welfare/animal-welfare-campaign-1.jpg')}
          alt="Animal welfare campaign"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute bottom-12 left-12 right-12">
          <h2 className="font-serif text-white text-2xl font-semibold leading-snug">
            Join thousands of volunteers making a difference for stray animals.
          </h2>
          <p className="text-sage-200 text-sm mt-3">
            Post rescues · Adopt animals · Review requests · Change lives
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-cream-100 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 lg:hidden mb-6">
              <div className="w-8 h-8 rounded-full bg-forest-500 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-serif text-forest-700 font-semibold">Animal Welfare</span>
            </Link>
            <h1 className="font-serif text-3xl text-brown-800">Create your account</h1>
            <p className="mt-1.5 text-brown-500 text-sm">
              Join our community and start helping animals today.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-brown-700 mb-1.5">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  data-testid="firstname-input"
                  autoComplete="given-name"
                  placeholder="Aayush"
                  {...register('firstName')}
                  className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-white text-brown-800 placeholder-brown-300 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-all text-sm"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-brown-700 mb-1.5">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  data-testid="lastname-input"
                  autoComplete="family-name"
                  placeholder="Saw"
                  {...register('lastName')}
                  className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-white text-brown-800 placeholder-brown-300 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-all text-sm"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-brown-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                data-testid="username-input"
                autoComplete="username"
                placeholder="aayush_saw"
                {...register('username')}
                className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-white text-brown-800 placeholder-brown-300 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-all text-sm"
              />
              {errors.username && (
                <p className="mt-1.5 text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brown-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                data-testid="email-input"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-white text-brown-800 placeholder-brown-300 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-all text-sm"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brown-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  data-testid="password-input"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  {...register('password')}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-sage-200 bg-white text-brown-800 placeholder-brown-300 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown-400 hover:text-brown-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              data-testid="register-submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-forest-500 hover:bg-forest-600 disabled:bg-forest-300 text-white font-semibold rounded-xl transition-all shadow-sm text-sm mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brown-500">
            Already have an account?{' '}
            <Link to="/login" className="text-forest-600 font-semibold hover:text-forest-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
