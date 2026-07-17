import HeroSection from './_components/HeroSection'
import ProofBar from './_components/ProofBar'
import PartnerStrip from './_components/PartnerStrip'
import WhatYouGetSection from './_components/WhatYouGetSection'
import AutonomySection from './_components/AutonomySection'
import WhoQualifiesSection from './_components/WhoQualifiesSection'
import ScarcitySection from './_components/ScarcitySection'
import StepsSection from './_components/StepsSection'
import LandingFooter from './_components/LandingFooter'
import BottomCTA from './_components/BottomCTA'
import PageViewTracker from './_components/PageViewTracker'

export default function LandingPage() {
  return (
    <>
      <PageViewTracker />
      {/* <Ticker /> */}
      <HeroSection />
      <ProofBar />
      <PartnerStrip />
      <WhatYouGetSection />
      <AutonomySection />
      <WhoQualifiesSection />
      <ScarcitySection />
      <StepsSection />
      <LandingFooter />
      <BottomCTA />
    </>
  )
}

