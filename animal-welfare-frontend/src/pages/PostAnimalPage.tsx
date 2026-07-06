import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Upload, Trash2 } from 'lucide-react'
import { animalsApi } from '@/api/animals.api'
import { toast } from 'sonner'

const postSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.enum(['DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER'] as const),
  breed: z.string().max(100).optional(),
  ageYears: z.coerce.number().min(0).max(30).default(0),
  ageMonths: z.coerce.number().min(0).max(11).default(0),
  gender: z.enum(['MALE', 'FEMALE', 'UNKNOWN'] as const),
  healthStatus: z.enum(['HEALTHY', 'VACCINATED', 'NEEDS_CARE', 'INJURED', 'RECOVERING'] as const),
  location: z.string().min(1, 'Location/Area is required').max(200),
  description: z.string().max(2000).optional(),
})

type PostFormData = z.infer<typeof postSchema>

export function PostAnimalPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      category: 'DOG',
      gender: 'UNKNOWN',
      healthStatus: 'HEALTHY',
      ageYears: 0,
      ageMonths: 0,
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages((prev) => [...prev, ...newFiles])

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
      setPreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true)
    try {
      const totalMonths = (data.ageYears * 12) + data.ageMonths
      const payload = {
        name: data.name,
        category: data.category,
        breed: data.breed || undefined,
        ageMonths: totalMonths > 0 ? totalMonths : undefined,
        gender: data.gender,
        healthStatus: data.healthStatus,
        location: data.location,
        description: data.description || undefined,
      }
      // 1. Create animal
      const animal = await animalsApi.create(payload)

      // 2. Upload images one by one if any exist
      if (images.length > 0) {
        for (const file of images) {
          await animalsApi.uploadImage(animal.id, file)
        }
      }

      toast.success('Animal posted successfully!')
      navigate(`/animals/${animal.id}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post animal.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pt-20 min-h-screen bg-cream-100 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-brown-800">Post a Stray Animal</h1>
          <p className="text-brown-500 text-sm mt-2">
            Share details of the animal you found to help connect them with adopters or rescuers.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-sage-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1.5">Animal Name / Temporary Name</label>
              <input
                type="text"
                placeholder="e.g., Bruno, Whiskers"
                {...register('name')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-white text-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1.5">Category / Type</label>
              <select
                {...register('category')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-white text-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              >
                <option value="DOG">Dog</option>
                <option value="CAT">Cat</option>
                <option value="BIRD">Bird</option>
                <option value="RABBIT">Rabbit</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Breed */}
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1.5">Breed / Appearance (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Indie, Golden Retriever, Calico"
                {...register('breed')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-white text-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              />
              {errors.breed && <p className="mt-1 text-xs text-red-500">{errors.breed.message}</p>}
            </div>

            {/* Age input (Years and Months) */}
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1.5">Age (Optional)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    placeholder="Years"
                    {...register('ageYears')}
                    className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-white text-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                  />
                  <span className="text-[10px] text-brown-400 mt-1 block">Years</span>
                  {errors.ageYears && <p className="mt-1 text-xs text-red-500">{errors.ageYears.message}</p>}
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    placeholder="Months"
                    {...register('ageMonths')}
                    className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-white text-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
                  />
                  <span className="text-[10px] text-brown-400 mt-1 block">Months</span>
                  {errors.ageMonths && <p className="mt-1 text-xs text-red-500">{errors.ageMonths.message}</p>}
                </div>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1.5">Gender</label>
              <select
                {...register('gender')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-white text-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="UNKNOWN">Unknown / Don't know</option>
              </select>
            </div>

            {/* Health Status */}
            <div>
              <label className="block text-sm font-medium text-brown-700 mb-1.5">Health Status</label>
              <select
                {...register('healthStatus')}
                className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-white text-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
              >
                <option value="HEALTHY">Healthy</option>
                <option value="VACCINATED">Vaccinated</option>
                <option value="NEEDS_CARE">Needs Medical Care</option>
                <option value="INJURED">Injured</option>
                <option value="RECOVERING">Recovering</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1.5">Rescue Location / Area</label>
            <input
              type="text"
              placeholder="e.g., Kothrud, Pune"
              {...register('location')}
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-white text-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
            />
            {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1.5">Description / Backstory</label>
            <textarea
              placeholder="Share details about the rescue, behavior, or personality..."
              rows={4}
              {...register('description')}
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-white text-brown-800 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400 resize-none"
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-sm font-medium text-brown-700 mb-1.5">Upload Images</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-sage-200 border-dashed rounded-xl hover:border-forest-400 transition-colors cursor-pointer relative bg-cream-50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-1 text-center pointer-events-none">
                <Upload className="mx-auto h-12 w-12 text-sage-400" />
                <div className="flex text-sm text-brown-600">
                  <span className="font-semibold text-forest-600">Click to upload</span>
                  <p className="pl-1">or drag and drop multiple images</p>
                </div>
                <p className="text-xs text-brown-400">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>

            {/* Preview Grid */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                {previews.map((src, index) => (
                  <div key={index} className="relative h-20 rounded-xl overflow-hidden group border border-sage-100 shadow-sm">
                    <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4 border-t border-sage-100">
            <button
              type="button"
              onClick={() => navigate('/animals')}
              className="flex-1 py-3 border border-sage-200 text-brown-600 rounded-xl hover:bg-cream-50 transition-colors text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-forest-500 hover:bg-forest-600 disabled:bg-forest-300 text-white rounded-xl transition-colors text-sm font-semibold"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Posting animal...</>
              ) : (
                'Post Listing'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
