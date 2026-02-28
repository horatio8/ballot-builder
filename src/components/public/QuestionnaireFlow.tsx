'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'

interface PolicyOption {
  id: string
  optionText: string
  description: string | null
}

interface PolicyQuestion {
  id: string
  questionText: string
  description: string | null
  options: PolicyOption[]
}

interface PolicyCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  questions: PolicyQuestion[]
}

interface Electorate {
  id: string
  name: string
}

interface Props {
  electionId: string
  electionName: string
  categories: PolicyCategory[]
  electorates: Electorate[]
}

export function QuestionnaireFlow({ electionId, electionName, categories, electorates }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0 = electorate selection, 1+ = category steps
  const [electorateId, setElectorateId] = useState('')
  const [selections, setSelections] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  const totalSteps = categories.length + 1 // +1 for electorate
  const progress = ((step + 1) / totalSteps) * 100

  const toggleOption = useCallback((optionId: string) => {
    setSelections((prev) => ({
      ...prev,
      [optionId]: !prev[optionId],
    }))
  }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/public/submit-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionId,
          electorateId,
          selections,
        }),
      })
      const data = await res.json()
      if (data.sessionId) {
        localStorage.setItem('ballotSessionId', data.sessionId)
        localStorage.setItem('ballotElectorateId', electorateId)
        router.push('/results')
      }
    } catch (err) {
      console.error('Submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>{step === 0 ? 'Your Electorate' : categories[step - 1]?.name}</span>
            <span>
              {step + 1} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Electorate Selection (step 0) */}
        {step === 0 && (
          <div className="animate-in fade-in">
            <div className="text-center mb-8">
              <MapPin className="w-12 h-12 mx-auto text-primary mb-4" />
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">
                Find your electorate
              </h1>
              <p className="text-gray-600">
                Select the electorate where you&apos;re enrolled to vote. This helps us match you with your local candidates.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <label htmlFor="electorate" className="block text-sm font-medium text-gray-700 mb-2">
                Your electorate
              </label>
              <select
                id="electorate"
                value={electorateId}
                onChange={(e) => setElectorateId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="">Select your electorate...</option>
                {electorates.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Policy Questions (steps 1+) */}
        {step > 0 && step <= categories.length && (
          <div className="animate-in fade-in" key={step}>
            {(() => {
              const category = categories[step - 1]
              return (
                <>
                  <div className="text-center mb-8">
                    {category.icon && <div className="text-4xl mb-3">{category.icon}</div>}
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-gray-600">{category.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2 italic">
                      Imagine you&apos;re in charge. What would you do?
                    </p>
                  </div>

                  <div className="space-y-8">
                    {category.questions.map((question) => (
                      <div key={question.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {question.questionText}
                        </h3>
                        {question.description && (
                          <p className="text-sm text-gray-500 mb-4">{question.description}</p>
                        )}
                        <div className="space-y-3">
                          {question.options.map((option) => {
                            const selected = !!selections[option.id]
                            return (
                              <button
                                key={option.id}
                                onClick={() => toggleOption(option.id)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                  selected
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                      selected
                                        ? 'bg-primary border-primary text-white'
                                        : 'border-gray-300'
                                    }`}
                                  >
                                    {selected && <Check className="w-4 h-4" />}
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-900">
                                      {option.optionText}
                                    </span>
                                    {option.description && (
                                      <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step < categories.length ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && !electorateId}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full text-sm font-semibold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Calculating...' : 'See My Results'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
