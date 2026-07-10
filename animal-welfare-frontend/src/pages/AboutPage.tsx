import { Heart, ShieldCheck, HelpCircle } from 'lucide-react'
import { resolveImageUrl } from '@/lib/utils'
import { usePageTitle } from '@/lib/usePageTitle'

export function AboutPage() {
  usePageTitle('About Us')
  return (
    <div className="pt-20 min-h-screen bg-cream-100 pb-16">
      {/* Header */}
      <div className="bg-dark-green py-16 text-white text-center">
        <div className="container-max">
          <h1 className="font-serif text-4xl md:text-5xl font-bold">About Our Initiative</h1>
          <p className="mt-4 text-sage-200 max-w-xl mx-auto text-sm md:text-base">
            Connecting helpless strays with loving families across India. We believe every stray dog and cat deserves a second chance.
          </p>
        </div>
      </div>

      {/* Mission / Vision Section */}
      <div className="container-max mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">Our Mission</p>
          <h2 className="font-serif text-3xl text-brown-800 font-bold mb-4">Making stray rescue simple, transparent and community-driven.</h2>
          <p className="text-brown-600 text-sm md:text-base leading-relaxed mb-4">
            Our platform started as a student project called "BhootDaya", focused on highlighting the plight of stray animals and building empathy. Today, it has evolved into a production-grade web application where rescuers can report animals, and families can securely request to adopt them.
          </p>
          <p className="text-brown-600 text-sm md:text-base leading-relaxed">
            By eliminating hardcoded credentials, offline data files, and single-click mock status updates, we've built a secure database model and role-based review system. This ensures our volunteers can verify homes, and every animal's status is tracked accurately.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-md border border-sage-100 h-80 lg:h-96">
          <img
            src={resolveImageUrl('/assets/about/about-us-mission.jpg')}
            alt="Our mission"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-light-sage/40 py-16 mt-16 border-y border-sage-100">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl text-brown-800 font-bold">What Guides Us</h2>
            <p className="text-brown-500 text-sm mt-2 max-w-md mx-auto">We are focused on the safety, health, and dignity of stray animals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-sage-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center text-forest-600 mx-auto mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg text-brown-800 font-semibold mb-2">Empathy First</h3>
              <p className="text-brown-500 text-sm leading-relaxed">
                Strays live under harsh conditions. Empathy forms the base of all listing creations and review guidelines.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-sage-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mx-auto mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg text-brown-800 font-semibold mb-2">Rigorous Verification</h3>
              <p className="text-brown-500 text-sm leading-relaxed">
                Every adoption request is reviewed by a volunteer or admin to verify the new home is safe and welcoming.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-sage-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center text-forest-600 mx-auto mb-4">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg text-brown-800 font-semibold mb-2">No Commisions</h3>
              <p className="text-brown-500 text-sm leading-relaxed">
                We do not charge listings fees or adoption processing fees. This platform exists entirely to serve strays.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The Team / Partners Section */}
      <div className="container-max mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl overflow-hidden shadow-md border border-sage-100 h-80 lg:h-96 order-last lg:order-first">
          <img
            src={resolveImageUrl('/assets/about/about-us-team.jpg')}
            alt="Our volunteer team"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">Our Volunteers</p>
          <h2 className="font-serif text-3xl text-brown-800 font-bold mb-4">A network of rescue partners, foster homes, and veterinarians.</h2>
          <p className="text-brown-600 text-sm md:text-base leading-relaxed mb-4">
            We partner with local animal shelters and veterinarians to coordinate vaccines, rescue treatment, and animal transport. Our volunteer base helps check on animals, moderate animal listings on the app, and conduct adoption home visits.
          </p>
          <p className="text-brown-600 text-sm md:text-base leading-relaxed">
            Interested in volunteering? Create an account, join our community forums, or contact us directly to get certified as a volunteer reviewer.
          </p>
        </div>
      </div>
    </div>
  )
}
