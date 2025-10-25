import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Briefcase, MapPin, Clock, Euro, X, AlertCircle } from 'lucide-react'
import Modal from '../../../common/Modal'

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

export default function GestioneAnnunci() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    benefits: [''],
    isActive: true
  })

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/jobs/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const url = editingJob
        ? `${API_URL}/jobs/${editingJob._id}`
        : `${API_URL}/jobs`

      const method = editingJob ? 'PUT' : 'POST'

      // Filter out empty strings from arrays
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(r => r.trim() !== ''),
        responsibilities: formData.responsibilities.filter(r => r.trim() !== ''),
        benefits: formData.benefits.filter(b => b.trim() !== '')
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cleanedData)
      })

      const data = await response.json()

      if (data.success) {
        await fetchJobs()
        closeModal()
      } else {
        setError(data.message || 'Errore durante il salvataggio')
      }
    } catch (error) {
      console.error('Error saving job:', error)
      setError('Errore durante il salvataggio')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo annuncio?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.success) {
        fetchJobs()
      } else {
        alert(data.message || 'Errore durante l\'eliminazione')
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Errore durante l\'eliminazione')
    }
  }

  const toggleActive = async (job: Job) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/jobs/${job._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !job.isActive })
      })

      const data = await response.json()

      if (data.success) {
        fetchJobs()
      }
    } catch (error) {
      console.error('Error toggling job status:', error)
    }
  }

  const openModal = (job?: Job) => {
    if (job) {
      setEditingJob(job)
      setFormData({
        title: job.title,
        location: job.location,
        type: job.type,
        salary: job.salary || '',
        description: job.description,
        requirements: job.requirements.length > 0 ? job.requirements : [''],
        responsibilities: job.responsibilities.length > 0 ? job.responsibilities : [''],
        benefits: job.benefits.length > 0 ? job.benefits : [''],
        isActive: job.isActive
      })
    } else {
      setEditingJob(null)
      setFormData({
        title: '',
        location: '',
        type: 'Full-time',
        salary: '',
        description: '',
        requirements: [''],
        responsibilities: [''],
        benefits: [''],
        isActive: true
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingJob(null)
    setError(null)
  }

  const addArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const updateArrayItem = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-end">
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-lg font-semibold"
        >
          <Plus className="w-5 h-5" />
          Nuovo Annuncio
        </button>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center animate-fade-in">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun annuncio</h3>
          <p className="text-gray-600 mb-6">Inizia creando il tuo primo annuncio di lavoro</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-lg font-semibold"
          >
            <Plus className="w-5 h-5" />
            Crea Annuncio
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job, index) => (
            <div
              key={job._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          job.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {job.isActive ? 'Attivo' : 'Disattivo'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </span>
                        {job.salary && (
                          <span className="flex items-center gap-1">
                            <Euro className="w-4 h-4" />
                            {job.salary}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 line-clamp-2">{job.description}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(job)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-110"
                    title={job.isActive ? 'Disattiva' : 'Attiva'}
                  >
                    {job.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => openModal(job)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                    title="Modifica"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                    title="Elimina"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingJob ? 'Modifica Annuncio' : 'Nuovo Annuncio'}
        maxWidth="4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900">Errore</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Titolo *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="es. Sviluppatore Full Stack"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Località *</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="es. Milano / Remote"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo Contratto *</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contratto">Contratto</option>
                      <option value="Stage">Stage</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Retribuzione</label>
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="es. €30.000 - €45.000"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Descrizione *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrivi la posizione..."
                  />
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Requisiti</label>
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="es. Esperienza con React"
                      />
                      {formData.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('requirements', index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('requirements')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Aggiungi requisito
                  </button>
                </div>

                {/* Responsibilities */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Responsabilità</label>
                  {formData.responsibilities.map((resp, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={resp}
                        onChange={(e) => updateArrayItem('responsibilities', index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="es. Sviluppare nuove funzionalità"
                      />
                      {formData.responsibilities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('responsibilities', index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('responsibilities')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Aggiungi responsabilità
                  </button>
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Benefit</label>
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => updateArrayItem('benefits', index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="es. Smart working"
                      />
                      {formData.benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('benefits', index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('benefits')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Aggiungi benefit
                  </button>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Pubblica annuncio (visibile sulla pagina Lavora con noi)
                  </label>
                </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Salvataggio...</span>
                </>
              ) : (
                <span>{editingJob ? 'Salva Modifiche' : 'Crea Annuncio'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
