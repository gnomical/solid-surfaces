import { JourneySection } from "../components/JourneySection"

type IntroSectionProps = {
  onContinue: () => void
}

export function IntroSection(props: IntroSectionProps) {
  return (
    <JourneySection onContinue={props.onContinue}>
      <h1>Surface Kit</h1>
      <p>
        Building UIs with headers, sidebars, drawers, and panels shouldn’t 
        mean wrestling with layout every time something changes.
      </p>
      <p>
        But it does.
      </p>
      <p>
        Surfaces pile up. Animations fight each other. Responsive behavior 
        gets bolted on later. And your main content is constantly at risk of breaking.
      </p>
      <p>
        <strong>Surface Kit</strong> introduces a different model:
      </p>
      <blockquote>Layout is a system of edge-attached surfaces negotiating 
        space together.</blockquote>
      <p>
        Each surface declares where it lives, how it participates in the 
        layout, and when it appears. Surface Kit handles everything else.
      </p>
      <p>This is a guided tour of that system.</p>
    </JourneySection>
  )
}


