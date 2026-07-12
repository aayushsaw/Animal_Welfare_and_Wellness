import { Link } from 'react-router-dom'
import {
  Heart,
  ShieldCheck,
  Users,
  Globe,
  Megaphone,
  BookOpen,
  Home,
  HandHeart,
  Leaf,
  Eye,
  Star,
  ArrowRight,
  PawPrint,
} from 'lucide-react'
import { resolveImageUrl } from '@/lib/utils'
import { usePageTitle } from '@/lib/usePageTitle'

function ValueCard({
  icon,
  title,
  description,
  accent = 'forest',
}: {
  icon: React.ReactNode
  title: string
  description: string
  accent?: 'forest' | 'orange'
}) {
  const ring =
    accent === 'orange'
      ? 'bg-orange-100 text-orange-600'
      : 'bg-forest-100 text-forest-600'
  return (
    <div className="bg-white p-6 rounded-2xl border border-sage-100 shadow-sm text-center hover:shadow-md transition-shadow">
      <div
        className={['w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4', ring].join(' ')}
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="font-serif text-lg text-brown-800 font-semibold mb-2">{title}</h3>
      <p className="text-brown-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function ImpactCard({
  emoji,
  title,
  description,
}: {
  emoji: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-sage-100 shadow-sm p-7 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <span className="text-3xl" aria-hidden="true">{emoji}</span>
      <h3 className="font-serif text-xl text-brown-800 font-semibold">{title}</h3>
      <p className="text-brown-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function WhatWeDoItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4 items-start">
      <div
        className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center text-forest-600 flex-shrink-0 mt-0.5"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-brown-800 text-sm mb-0.5">{title}</p>
        <p className="text-brown-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export function AboutPage() {
  usePageTitle('About Us')

  return (
    <div className="pt-20 min-h-screen bg-cream-100 pb-16">

      {/* Hero Banner */}
      <header className="bg-dark-green py-16 text-white text-center">
        <div className="container-max">
          <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Our Story
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-balance">
            A Platform Built for Animals,
            <br className="hidden md:block" /> by People Who Care
          </h1>
          <p className="mt-5 text-sage-200 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            Animal Welfare &amp; Wellness connects rescuers, volunteers, adopters, and animal lovers
            to help stray and abandoned animals find the safe, loving homes they deserve.
          </p>
        </div>
      </header>

      {/* Mission and Vision */}
      <section aria-labelledby="mission-heading" className="container-max mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">
            Our Mission
          </p>
          <h2 id="mission-heading" className="font-serif text-3xl text-brown-800 font-bold mb-5">
            Making rescue simple, transparent, and community-driven.
          </h2>
          <p className="text-brown-600 text-sm md:text-base leading-relaxed mb-4">
            Every day, thousands of animals are abandoned on streets with no shelter, food, or care.
            Most of the time, the people who want to help — kind strangers, local volunteers,
            animal lovers — have no clear way to do so. Rescue efforts remain scattered across
            social media, WhatsApp groups, and word of mouth.
          </p>
          <p className="text-brown-600 text-sm md:text-base leading-relaxed mb-4">
            We built this platform to change that. A single, structured place where a stray sighted
            in your neighbourhood can be reported, cared for, and adopted — with full transparency
            at every step.
          </p>
          <p className="text-brown-600 text-sm md:text-base leading-relaxed">
            <strong className="font-semibold text-brown-800">Our vision</strong> is a compassionate
            community where every animal, regardless of breed or condition, has access to care,
            shelter, and a genuine opportunity to be adopted into a loving family.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-md border border-sage-100 h-80 lg:h-96">
          <img
            src={resolveImageUrl('/assets/about/about-us-mission.jpg')}
            alt="A rescued dog resting in a caring shelter"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* What We Do */}
      <section
        aria-labelledby="what-we-do-heading"
        className="container-max mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
      >
        <div className="rounded-2xl overflow-hidden shadow-md border border-sage-100 h-80 lg:h-96 order-last lg:order-first">
          <img
            src={resolveImageUrl('/assets/about/about-us-team.jpg')}
            alt="Volunteers working together to help rescued animals"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">
            What We Do
          </p>
          <h2 id="what-we-do-heading" className="font-serif text-3xl text-brown-800 font-bold mb-7">
            Six ways we support animal welfare every day.
          </h2>
          <div className="flex flex-col gap-5">
            <WhatWeDoItem
              icon={<PawPrint className="w-5 h-5" />}
              title="Rescue Support"
              description="Help rescuers document stray and injured animals with photos, location, and health status so they can receive immediate attention."
            />
            <WhatWeDoItem
              icon={<Home className="w-5 h-5" />}
              title="Animal Adoption"
              description="Connect rescued animals with verified, responsible adopters through a structured application and review process."
            />
            <WhatWeDoItem
              icon={<Globe className="w-5 h-5" />}
              title="Community Reporting"
              description="Empower community members to report animals in distress directly from the platform, making the rescue network denser and faster."
            />
            <WhatWeDoItem
              icon={<Users className="w-5 h-5" />}
              title="Volunteer Collaboration"
              description="Coordinate with local NGOs, foster families, and certified volunteers who moderate listings and conduct home visits."
            />
            <WhatWeDoItem
              icon={<Megaphone className="w-5 h-5" />}
              title="Animal Welfare Awareness"
              description="Publish news and resources to educate communities about animal rights, responsible ownership, and local welfare drives."
            />
            <WhatWeDoItem
              icon={<BookOpen className="w-5 h-5" />}
              title="Responsible Pet Ownership"
              description="Encourage adopters to commit to vaccinations, neutering, and long-term care through our pre-adoption guidance materials."
            />
          </div>
        </div>
      </section>

      {/* Why This Platform */}
      <section
        aria-labelledby="why-heading"
        className="bg-light-sage/40 border-y border-sage-100 mt-16 py-16"
      >
        <div className="container-max max-w-3xl mx-auto text-center">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">
            Why We Exist
          </p>
          <h2 id="why-heading" className="font-serif text-3xl text-brown-800 font-bold mb-5">
            One place instead of scattered posts.
          </h2>
          <p className="text-brown-600 text-sm md:text-base leading-relaxed mb-4">
            Before platforms like this, rescue efforts depended entirely on viral Facebook posts,
            overloaded WhatsApp groups, and whoever happened to see a tweet in time. Animals were
            adopted without proper vetting. Rescuers had no way to track what happened after they
            handed off an animal. Volunteers worked in isolation with no coordination.
          </p>
          <p className="text-brown-600 text-sm md:text-base leading-relaxed">
            This platform changes that by creating a single, accountable system. Every listing is
            reviewed. Every adoption request goes through a verified workflow. Every status update
            is recorded. And every community member — rescuer, adopter, or volunteer — plays a
            defined role with clear responsibilities.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section aria-labelledby="values-heading" className="container-max mt-16">
        <div className="text-center mb-10">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">
            Core Values
          </p>
          <h2 id="values-heading" className="font-serif text-3xl text-brown-800 font-bold">
            What guides every decision we make.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ValueCard
            icon={<Heart className="w-6 h-6" />}
            title="Compassion"
            description="Every decision starts with the animal's wellbeing — not convenience, not popularity."
          />
          <ValueCard
            icon={<Eye className="w-6 h-6" />}
            title="Transparency"
            description="All listings, adoption decisions, and status changes are recorded and visible to the community."
            accent="orange"
          />
          <ValueCard
            icon={<Users className="w-6 h-6" />}
            title="Community"
            description="Real change is collective. We build tools that make it easier for people to act together."
          />
          <ValueCard
            icon={<HandHeart className="w-6 h-6" />}
            title="Responsibility"
            description="Adopters commit to lifelong care. Volunteers commit to fair review. We hold everyone accountable."
            accent="orange"
          />
          <ValueCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Trust"
            description="A verified adoption workflow and role-based access ensure no listing is processed without proper oversight."
          />
          <ValueCard
            icon={<Leaf className="w-6 h-6" />}
            title="Animal First"
            description="When in doubt about any policy, process, or feature — the animal's safety and dignity take priority."
            accent="orange"
          />
        </div>
      </section>

      {/* Impact Cards */}
      <section aria-labelledby="impact-heading" className="container-max mt-20">
        <div className="text-center mb-10">
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">
            Our Impact
          </p>
          <h2 id="impact-heading" className="font-serif text-3xl text-brown-800 font-bold">
            Together We Can Make a Difference
          </h2>
          <p className="text-brown-500 text-sm mt-2 max-w-lg mx-auto">
            Every role on this platform contributes to a larger mission. Here is what we accomplish together.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ImpactCard
            emoji="&#x1F43E;"
            title="Rescue Animals"
            description="Help abandoned and injured animals receive prompt care, medical attention, and safe shelter."
          />
          <ImpactCard
            emoji="&#x1F3E1;"
            title="Find Forever Homes"
            description="Connect rescued animals with responsible, verified adopters who are ready to commit."
          />
          <ImpactCard
            emoji="&#x1F91D;"
            title="Volunteer Together"
            description="Join local volunteers and NGOs in a coordinated effort to improve animal welfare at scale."
          />
          <ImpactCard
            emoji="&#x2764;&#xFE0F;"
            title="Build Compassion"
            description="Create awareness and encourage responsible pet ownership across the community."
          />
        </div>
      </section>

      {/* Call to Action */}
      <section
        aria-labelledby="cta-heading"
        className="mt-20 bg-dark-green rounded-3xl mx-4 sm:mx-6 lg:mx-8 max-w-7xl xl:mx-auto"
      >
        <div className="container-max py-14 text-center">
          <div
            className="w-14 h-14 bg-sage-400/20 border border-sage-400/30 rounded-full flex items-center justify-center mx-auto mb-5"
            aria-hidden="true"
          >
            <Star className="w-7 h-7 text-sage-300" />
          </div>
          <h2 id="cta-heading" className="font-serif text-3xl md:text-4xl text-white font-bold text-balance">
            Ready to Help?
          </h2>
          <p className="mt-4 text-sage-200 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Whether you want to adopt, rescue, volunteer, or simply raise awareness — every
            contribution makes a real difference in an animal's life.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              to="/animals"
              className="flex items-center gap-2 px-7 py-3.5 bg-orange-400 hover:bg-orange-300 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm md:text-base"
            >
              <PawPrint className="w-5 h-5" aria-hidden="true" />
              Browse Animals
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 px-7 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl border border-white/30 transition-all text-sm md:text-base backdrop-blur-sm"
            >
              Become a Volunteer
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
