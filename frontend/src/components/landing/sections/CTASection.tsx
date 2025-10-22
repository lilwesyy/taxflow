interface CTASectionProps {
  setSectionRef: (id: string) => (el: Element | null) => void
  onShowRegister: () => void
}

export default function CTASection({ setSectionRef, onShowRegister }: CTASectionProps) {
  return (
    <section
      id="cta"
      ref={setSectionRef('cta')}
      className="py-16 sm:py-20 lg:py-24 bg-blue-600"
    >
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6">
          Inizia oggi stesso
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Ottimizza le tue relazioni bancarie con metodologie certificate
        </p>
        <button
          onClick={onShowRegister}
          className="bg-white text-blue-600 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-blue-50 transition-all duration-200 hover:scale-105 shadow-xl"
        >
          Inizia ora
        </button>
      </div>
    </section>
  )
}
