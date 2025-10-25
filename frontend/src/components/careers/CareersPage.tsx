import { useState, useEffect } from 'react'
import {
  Briefcase,
  ArrowLeft,
  Award,
  Lightbulb,
  CheckCircle,
  Mail,
  MapPin,
  Clock,
  Euro,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import logoSvg from '../../assets/logo.svg'

interface Job {
  _id: string
  title: string
  location: string
  type: string
  salary?: string
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CareersPageProps {
  onBack: () => void
}

export default function CareersPage({ onBack }: CareersPageProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`)
      const data = await response.json()
      if (data.success) {
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleJob = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId)
  }
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <button
              onClick={onBack}
              className="flex items-center hover:opacity-80 transition-opacity duration-200"
              aria-label="Torna alla home"
            >
              <img src={logoSvg} alt="TaxFlow" className="h-10 sm:h-12 w-auto" />
            </button>
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Torna alla home</span>
            </button>
          </div>
        </div>
      </header>

      {/* Job Openings Section */}
      <section className="flex-1 py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Lavora con noi
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Unisciti al nostro team e contribuisci a rivoluzionare il mondo della consulenza fiscale
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : jobs.length === 0 ? (
            /* Empty State - No Jobs */
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-12 sm:p-16 text-center">
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                    <Briefcase className="w-12 h-12 text-gray-400" />
                  </div>

                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Nessun annuncio disponibile
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Al momento non ci sono posizioni aperte, ma siamo sempre alla ricerca di <span className="font-semibold text-gray-900">talenti eccezionali</span> che condividano la nostra visione.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-8">
                    <Lightbulb className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-700 mb-6 text-lg">
                      <strong className="text-gray-900">Candidatura spontanea?</strong><br />
                      Inviaci il tuo CV e raccontaci perché vorresti far parte di TaxFlow
                    </p>

                    <a
                      href="mailto:careers@taxflow.it"
                      className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-2xl hover:bg-blue-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-2xl"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Invia la tua candidatura</span>
                    </a>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Contattaci via email</p>
                    <a href="mailto:careers@taxflow.it" className="text-blue-600 hover:text-blue-700 font-semibold text-lg">
                      careers@taxflow.it
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Job Listings */
            <div className="space-y-6">
              {jobs.map((job) => (
                <div key={job._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{job.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.type}
                          </span>
                          {job.salary && (
                            <span className="inline-flex items-center gap-1">
                              <Euro className="w-4 h-4" />
                              {job.salary}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 leading-relaxed">{job.description}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => toggleJob(job._id)}
                        className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <span>Dettagli</span>
                        {expandedJob === job._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      <a
                        href={`mailto:careers@taxflow.it?subject=Candidatura per ${job.title}`}
                        className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl text-center"
                      >
                        Candidati ora
                      </a>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedJob === job._id && (
                    <div className="border-t border-gray-200 bg-gray-50 p-8 space-y-6">
                      {job.requirements.length > 0 && (
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-3">Requisiti</h4>
                          <ul className="space-y-2">
                            {job.requirements.map((req, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-700">
                                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {job.responsibilities.length > 0 && (
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-3">Responsabilità</h4>
                          <ul className="space-y-2">
                            {job.responsibilities.map((resp, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-700">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {job.benefits.length > 0 && (
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-3">Benefit</h4>
                          <ul className="space-y-2">
                            {job.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-700">
                                <Award className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-200">
                        <a
                          href={`mailto:careers@taxflow.it?subject=Candidatura per ${job.title}`}
                          className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <Mail className="w-5 h-5" />
                          <span>Invia candidatura</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <img src={logoSvg} alt="TaxFlow" className="h-12 w-auto brightness-0 invert mb-4 mx-auto md:mx-0" />
              <p className="text-gray-400 text-lg">Il tuo partner per il successo fiscale</p>
            </div>
            <div className="text-center md:text-right space-y-2">
              <p className="text-gray-400 text-sm">
                © 2025 TaxFlow S.r.l. Tutti i diritti riservati.
              </p>
              <div className="flex items-center justify-center md:justify-end gap-6 text-sm">
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </button>
                <span className="text-gray-600">•</span>
                <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
                  Termini e Condizioni
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
