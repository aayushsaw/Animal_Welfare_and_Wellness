import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Heart, Search, Shield, Users, ArrowRight, MapPin } from 'lucide-react'
import { animalsApi } from '@/api/animals.api'
import { AnimalCard } from '@/components/animals/AnimalCard'
import { NewsBanner } from '@/components/news/NewsBanner'
import { resolveImageUrl } from '@/lib/utils'

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-sage-400 mb-1">{icon}</div>
      <span className="text-3xl font-bold text-white font-serif">{value}</span>
      <span className="text-sage-200 text-sm">{label}</span>
    </div>
  )
}

export function HomePage() {
  const { data: animals } = useQuery({
    queryKey: ['animals', 'recent'],
    queryFn: () => animalsApi.getAll({ page: 0, size: 6 }),
    staleTime: 2 * 60 * 1000,
  })

  const { data: stats } = useQuery({
    queryKey: ['animals', 'stats'],
    queryFn: animalsApi.getStats,
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div className="flex flex-col">

      {/* ── Hero Section ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={resolveImageUrl('/assets/hero/stray-dog-hero.jpg')}
            alt="A stray dog waiting for a home"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>

        {/* Content */}
        <div className="relative container-max pt-24 pb-20 w-full">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage-400/20 border border-sage-400/30 text-sage-200 text-sm font-medium mb-6">
              <Heart className="w-4 h-4 fill-sage-400 text-sage-400" />
              Animal Welfare & Wellness Community
            </span>

            <h1 className="font-serif text-white text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance">
              Every Animal Deserves a{' '}
              <span className="text-sage-300">Loving Home</span>
            </h1>

            <p className="mt-6 text-sage-100 text-lg md:text-xl leading-relaxed max-w-xl">
              Connect stray animals with caring families. Browse animals in need,
              post rescues, and be part of a community that makes a real difference.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/animals"
                className="flex items-center gap-2 px-7 py-3.5 bg-orange-400 hover:bg-orange-300 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 text-base"
              >
                <Search className="w-5 h-5" />
                Find a Companion
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-7 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl border border-white/30 transition-all text-base backdrop-blur-sm"
              >
                Join Community
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sage-200 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Serving Pune, Maharashtra — and growing</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60 animate-bounce">
          <div className="w-0.5 h-8 bg-white/40 rounded-full" />
          <span className="text-xs">Scroll</span>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────────────────── */}
      <section className="bg-dark-green py-12">
        <div className="container-max">
          <div className="grid grid-cols-3 gap-8 md:gap-12 max-w-2xl mx-auto text-center">
            <StatCard
              icon={<Heart className="w-6 h-6" />}
              value={stats?.total?.toString() ?? '...'}
              label="Animals Helped"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              value={stats?.adopted?.toString() ?? '...'}
              label="Adopted"
            />
            <StatCard
              icon={<Shield className="w-6 h-6" />}
              value={stats?.available?.toString() ?? '...'}
              label="Awaiting Homes"
            />
          </div>
        </div>
      </section>

      {/* ── Recently Added Animals ────────────────────────────────────────────── */}
      <section className="section-padding bg-cream-100">
        <div className="container-max">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">
                Available Now
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-brown-800">
                Animals Looking for a Home
              </h2>
              <p className="mt-2 text-brown-500 max-w-lg">
                These animals were recently rescued and are waiting for their forever family.
              </p>
            </div>
            <Link
              to="/animals"
              className="hidden md:flex items-center gap-1.5 text-forest-600 font-semibold hover:text-forest-700 transition-colors text-sm"
            >
              View all animals
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {animals?.content.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {animals.content.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          ) : (
            /* Loading skeletons — aspect ratio matches real card to prevent layout shift */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-sage-100 shadow-sm">
                  <div className="animate-pulse bg-cream-200 w-full" style={{ aspectRatio: '4/3' }} />
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between gap-2">
                      <div className="skeleton h-4 w-2/3" />
                      <div className="skeleton h-4 w-10" />
                    </div>
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-3 w-1/3" />
                    <div className="border-t border-sage-100 pt-3 flex justify-between">
                      <div className="skeleton h-3 w-1/3" />
                      <div className="skeleton h-3 w-1/5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/animals"
              className="inline-flex items-center gap-2 px-6 py-3 bg-forest-500 text-white rounded-xl font-semibold hover:bg-forest-600 transition-colors"
            >
              See all animals
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mission Strip ─────────────────────────────────────────────────────── */}
      <section className="bg-light-sage py-14">
        <div className="container-max">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="w-7 h-7 text-forest-500" />,
                title: 'Find & Rescue',
                desc: 'Spot a stray? Post their photo and details so our community can help find them a home.',
              },
              {
                icon: <Heart className="w-7 h-7 text-orange-400" />,
                title: 'Adopt with Love',
                desc: 'Browse animals by type, location, and health. Submit an adoption request in minutes.',
              },
              {
                icon: <Shield className="w-7 h-7 text-forest-500" />,
                title: 'Verified Welfare',
                desc: 'Every adoption is reviewed by our volunteer team to ensure animals go to safe homes.',
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-start p-6 bg-white rounded-2xl border border-sage-100 shadow-sm">
                <div className="mb-4">{item.icon}</div>
                <h3 className="font-serif text-lg text-brown-800 font-semibold mb-2">{item.title}</h3>
                <p className="text-brown-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── News Carousel ─────────────────────────────────────────────────────── */}
      <section className="section-padding bg-cream-100">
        <div className="container-max">
          <div className="mb-8">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">
              Welfare Stories
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-brown-800">
              From Our Community
            </h2>
          </div>
          <NewsBanner />
          <div className="mt-6 text-right">
            <Link
              to="/news"
              className="inline-flex items-center gap-1.5 text-forest-600 font-semibold hover:text-forest-700 text-sm transition-colors"
            >
              All welfare news
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-forest-500 py-16">
        <div className="absolute inset-0 opacity-10">
          <img
            src={resolveImageUrl('/assets/hero/adopt-animal-hero.jpg')}
            alt=""
            aria-hidden
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container-max text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-white font-bold text-balance">
            Ready to Make a Difference?
          </h2>
          <p className="mt-3 text-sage-200 max-w-xl mx-auto">
            Join our growing community of rescuers, adopters, and animal welfare volunteers.
            Together we can find every stray a safe, loving home.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-white text-forest-700 font-semibold rounded-xl hover:bg-cream-100 transition-colors shadow-sm"
            >
              Create Free Account
            </Link>
            <Link
              to="/animals"
              className="px-8 py-3.5 bg-transparent text-white font-semibold rounded-xl border border-white/40 hover:bg-white/10 transition-colors"
            >
              Browse Animals
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
