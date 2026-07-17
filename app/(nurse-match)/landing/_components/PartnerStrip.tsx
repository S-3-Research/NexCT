import Image from 'next/image'

export default function PartnerStrip() {
  return (
    <div className="bg-white px-5 sm:px-6 py-1 sm:py-1">
      <div className="max-w-xs mx-auto h-px bg-[#e8eef2] mb-2 sm:mb-2" aria-hidden="true" />
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 sm:gap-4">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b7c8d] whitespace-nowrap">
          In partnership with
        </span>
        {/* <div className="h-10 sm:h-10 w-px bg-[#e8eef2]" aria-hidden="true" /> */}
        <a href="https://www.nhhri.org/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
          <Image
            src="/images/sponsors/nhhri-logo-blue.png"
            alt="NHHRI — National Hispanic Health Research Institute"
            width={320}
            height={80}
            className="h-14 sm:h-20 w-auto object-contain opacity-90"
          />
        </a>
      </div>
    </div>
  )
}
