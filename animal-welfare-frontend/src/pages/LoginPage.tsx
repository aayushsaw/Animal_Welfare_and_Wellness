import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Heart, Loader2 } from 'lucide-react'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'
import { resolveImageUrl } from '@/lib/utils'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(data)
      setAuth(response)
      toast.success(`Welcome back, ${response.username}!`)
      navigate(from, { replace: true })
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid credentials. Please try again.'
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
          src={resolveImageUrl('/assets/hero/adopt-animal-hero.jpg')}
          alt="Happy rescued animal"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute bottom-12 left-12 right-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-sage-400 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-serif text-white font-semibold text-lg">Animal Welfare & Wellness</span>
          </div>
          <p className="text-sage-100 text-lg font-serif leading-relaxed">
            "Every stray dog has a soul that deserves kindness, and a heart that just wants to love."
          </p>
          <p className="text-sage-300 text-sm mt-2">— Pyaar Foundation</p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-cream-100">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 lg:hidden mb-6">
              <div className="w-8 h-8 rounded-full bg-forest-500 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-serif text-forest-700 font-semibold">Animal Welfare</span>
            </Link>
            <h1 className="font-serif text-3xl text-brown-800">Welcome back</h1>
            <p className="mt-1.5 text-brown-500 text-sm">
              Sign in to continue helping animals find their homes.
            </p>
          </div>

          {/* Demo credentials notice */}
          <div className="mb-6 p-3.5 bg-forest-50 border border-forest-200 rounded-xl text-xs text-forest-700">
            <p className="font-semibold mb-1">Demo accounts:</p>
            <p>admin / password123 (Admin)</p>
            <p>aayush / password123 (User)</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-brown-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                data-testid="username-input"
                autoComplete="username"
                placeholder="Enter your username"
                {...register('username')}
                className="w-full px-4 py-3 rounded-xl border border-sage-200 bg-white text-brown-800 placeholder-brown-300 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-all text-sm"
              />
              {errors.username && (
                <p className="mt-1.5 text-xs text-red-500">{errors.username.message}</p>
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
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register('password')}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-sage-200 bg-white text-brown-800 placeholder-brown-300 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brown-400 hover:text-brown-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
              data-testid="login-submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-forest-500 hover:bg-forest-600 disabled:bg-forest-300 text-white font-semibold rounded-xl transition-all shadow-sm text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brown-500">
            New to our community?{' '}
            <Link to="/register" className="text-forest-600 font-semibold hover:text-forest-700 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
