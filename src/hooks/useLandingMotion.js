import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function useBuildingMotion(scope) {
  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const svg = scope.current
      const scroller = svg.closest('.fire-landing')
      const timeline = gsap.timeline({ scrollTrigger: { trigger: svg, scroller, start: 'top 95%', toggleActions: 'play none none none' } })
      timeline.from(svg.querySelectorAll('.fl-floor'), { y: '+=22', opacity: 0, duration: .9, stagger: .12, ease: 'power3.out' })
      const paths = svg.querySelectorAll('.fl-pipes path')
      paths.forEach(path => {
        const length = path.getTotalLength()
        timeline.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' }, .45)
      })
      timeline.from(svg.querySelectorAll('.fl-pipes circle'), { opacity: 0, scale: 0, transformOrigin: 'center', duration: .4, stagger: .1 }, 1.1)
    })
    return () => media.revert()
  }, { scope })
}

export function useLandingMotion(scope, stage, setStage) {
  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add({ desktop: '(min-width: 701px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
      if (!context.conditions.motion) return
      const root = scope.current
      const select = gsap.utils.selector(root)
      const desktop = context.conditions.desktop
      let cleanupDemo
      let hydrantTour
      let cleanupHydrantHover
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      intro.from('.fl-header', { y: -15, opacity: 0, duration: .65 })
        .from('.fl-hero-copy > *', { y: 28, opacity: 0, duration: .85, stagger: .11 }, .12)
        .from('.fl-hero-product', { y: 65, opacity: 0, duration: 1.25 }, .4)
        .from('.fl-beams i', { opacity: 0, x: 100, duration: 1.6, stagger: .15 }, .1)
        .from('.fl-web-layer', { y: 35, opacity: 0, duration: .9, clearProps: 'transform,opacity' }, .9)
      const hydrantViewport = root.querySelector('.fl-web-layer .fl-hydrant-viewport')
      if (hydrantViewport) {
        const maxHydrantScroll = Math.max(0, hydrantViewport.scrollHeight - hydrantViewport.clientHeight)
        if (maxHydrantScroll > 0) {
          hydrantTour = gsap.timeline({ repeat: -1, repeatDelay: 1.4 })
          hydrantTour.set(hydrantViewport, { scrollTop: 0 })
            .to(hydrantViewport, { scrollTop: maxHydrantScroll * .24, duration: 1.7, ease: 'power2.inOut' }, '+=2.2')
            .to(hydrantViewport, { scrollTop: maxHydrantScroll * .52, duration: 2.1, ease: 'power2.inOut' }, '+=1.6')
            .to(hydrantViewport, { scrollTop: maxHydrantScroll * .78, duration: 1.8, ease: 'power2.inOut' }, '+=2.4')
            .to(hydrantViewport, { scrollTop: maxHydrantScroll, duration: 1.5, ease: 'power2.inOut' }, '+=1.3')
            .to(hydrantViewport, { scrollTop: 0, duration: 1.4, ease: 'power2.inOut' }, '+=2.8')
          const revitLayer = root.querySelector('.fl-revit-layer')
          if (revitLayer) {
            const pauseTour = () => hydrantTour.pause()
            const resumeTour = () => hydrantTour.resume()
            revitLayer.addEventListener('pointerenter', pauseTour)
            revitLayer.addEventListener('pointerleave', resumeTour)
            revitLayer.addEventListener('focusin', pauseTour)
            revitLayer.addEventListener('focusout', resumeTour)
            cleanupHydrantHover = () => {
              revitLayer.removeEventListener('pointerenter', pauseTour)
              revitLayer.removeEventListener('pointerleave', resumeTour)
              revitLayer.removeEventListener('focusin', pauseTour)
              revitLayer.removeEventListener('focusout', resumeTour)
            }
          }
        }
      }
      if (desktop) {
        gsap.to('.fl-revit-layer', { y: -18, ease: 'none', scrollTrigger: { trigger: '.fl-hero-product', scroller: root, start: 'top 75%', end: 'bottom 20%', scrub: 1 } })
        gsap.to('.fl-beams', { y: 90, ease: 'none', scrollTrigger: { trigger: '.fl-hero', scroller: root, start: 'top top', end: 'bottom top', scrub: 1.2 } })
      }
      select('.fl-section-head, .fl-features article, .fl-audience-grid article, .fl-faq > div, .fl-audience > h2, .fl-cta > h2').forEach(element => {
        gsap.from(element, { y: desktop ? 35 : 16, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: element, scroller: root, start: 'top 94%', once: true } })
      })

      if (desktop) {
        let activeDemoStage = 0
        let transitionTween
        const transitionToStage = nextStage => {
          if (nextStage === activeDemoStage) return
          activeDemoStage = nextStage
          const panel = root.querySelector('.fl-demo-stage')
          transitionTween?.kill()
          if (!panel) {
            setStage(nextStage)
            return
          }
          transitionTween = gsap.to(panel, {
            y: -100,
            opacity: 0,
            duration: .38,
            ease: 'power2.in',
            onComplete: () => setStage(nextStage),
          })
        }
        const demo = root.querySelector('.fl-demo')
        let demoFrame
        const updateDemoStage = () => {
          demoFrame = undefined
          if (!demo) return
          const travel = Math.max(1, demo.offsetHeight - root.clientHeight)
          const progress = gsap.utils.clamp(0, 1, -demo.getBoundingClientRect().top / travel)
          const nextStage = progress < .2 ? 0 : progress < .62 ? 1 : 2
          transitionToStage(nextStage)
        }
        const queueDemoUpdate = () => {
          if (demoFrame === undefined) demoFrame = requestAnimationFrame(updateDemoStage)
        }
        root.addEventListener('scroll', queueDemoUpdate, { passive: true })
        updateDemoStage()
        cleanupDemo = () => {
          root.removeEventListener('scroll', queueDemoUpdate)
          if (demoFrame !== undefined) cancelAnimationFrame(demoFrame)
          transitionTween?.kill()
        }
      }
      select('.fl-mark').forEach(mark => {
        const loop = gsap.timeline({ repeat: -1, repeatDelay: .02, paused: true })
        loop.fromTo(mark.children, { y: 216, opacity: 0 }, { y: 0, opacity: 1, duration: .75, stagger: .14, ease: 'power4.out' })
          .to(mark.children, { y: -216, opacity: 0, duration: .45, stagger: .14, ease: 'power2.in' }, 2.25)
        ScrollTrigger.create({ trigger: mark, scroller: root, start: 'top bottom', end: 'bottom top', onToggle: self => self.isActive ? loop.play() : loop.pause() })
      })
      // Refresh once fonts settle; ignore completion after route unmount.
      let mounted = true
      document.fonts.ready.then(() => { if (mounted) ScrollTrigger.refresh() })
      return () => {
        mounted = false
        cleanupDemo?.()
        cleanupHydrantHover?.()
        hydrantTour?.kill()
      }
    })
    return () => media.revert()
  }, { scope })

  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.fl-demo-stage',
        { y: 110, opacity: 0 },
        { y: 0, opacity: 1, duration: .72, ease: 'power3.out' })
      if (stage === 0) {
        const root = scope.current
        const cursor = root.querySelector('.fl-demo-cursor')
        const firstChoice = root.querySelector('.fl-mouse-1')
        const secondChoice = root.querySelector('.fl-mouse-2')
        const config = root.querySelector('.fl-config-mock')
        const viewport = root.querySelector('.fl-safety-viewport')
        if (cursor && firstChoice && secondChoice && config && viewport) {
          const configBox = config.getBoundingClientRect()
          const pointFor = element => {
            const box = element.getBoundingClientRect()
            return { x: box.right - configBox.left - 24, y: box.top - configBox.top + 5 }
          }
          const firstPoint = pointFor(firstChoice)
          const secondRawPoint = pointFor(secondChoice)
          const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight)
          const scrollAmount = Math.min(maxScroll, Math.max(0, secondRawPoint.y - config.clientHeight * .68))
          const secondPoint = { x: secondRawPoint.x, y: secondRawPoint.y - scrollAmount }
          const firstToggle = firstChoice.querySelector('.fl-security-check')
          const secondToggle = secondChoice.querySelector('.fl-security-check')
          const firstKnob = firstToggle.querySelector('b')
          const secondKnob = secondToggle.querySelector('b')
          const mouse = gsap.timeline({ repeat: -1, repeatDelay: .7 })
          mouse.set(cursor, { opacity: 0, x: config.clientWidth - 70, y: 22, scale: 1 })
            .set(viewport, { scrollTop: 0 })
            .set([firstChoice, secondChoice], { borderColor: 'rgba(255,255,255,.1)', backgroundColor: 'transparent' })
            .set([firstToggle, secondToggle], { backgroundColor: '#34343d' })
            .set([firstKnob, secondKnob], { opacity: 0, scale: .5 })
            .to(cursor, { opacity: 1, duration: .2 })
            .to(cursor, { x: firstPoint.x, y: firstPoint.y, duration: .8, ease: 'power3.inOut' })
            .to(cursor, { scale: .76, duration: .1 })
            .to(firstChoice, { borderColor: '#148d73', backgroundColor: 'rgba(20,141,115,.13)', duration: .18 }, '<')
            .to(firstToggle, { backgroundColor: '#159579', duration: .18 }, '<')
            .to(firstKnob, { opacity: 1, scale: 1, duration: .18 }, '<')
            .to(cursor, { scale: 1, duration: .12 })
            .to(cursor, { opacity: 0, duration: .18 }, '+=.35')
            .to(viewport, { scrollTop: scrollAmount, duration: 1.25, ease: 'power3.inOut' }, '<')
            .to(cursor, { x: secondPoint.x, y: secondPoint.y, opacity: 1, duration: .7, ease: 'power3.inOut' }, '+=.15')
            .to(cursor, { scale: .76, duration: .1 })
            .to(secondChoice, { borderColor: '#148d73', backgroundColor: 'rgba(20,141,115,.13)', duration: .18 }, '<')
            .to(secondToggle, { backgroundColor: '#159579', duration: .18 }, '<')
            .to(secondKnob, { opacity: 1, scale: 1, duration: .18 }, '<')
            .to(cursor, { scale: 1, duration: .12 })
            .to(cursor, { opacity: 0, duration: .3 }, '+=1.1')
          return () => mouse.kill()
        }
      }
      if (stage === 2) {
        const stack = scope.current.querySelector('.fl-pdf-stack')
        const firstPage = stack?.querySelector('.fl-pdf-page')
        if (stack && firstPage) {
          const pageStep = firstPage.offsetHeight + 22
          const documentTour = gsap.timeline({ repeat: -1, repeatDelay: 1 })
          documentTour.set(stack, { y: 0 })
            .to(stack, { y: -pageStep, duration: 1, ease: 'power3.inOut' }, '+=2')
            .to(stack, { y: -pageStep * 2, duration: 1, ease: 'power3.inOut' }, '+=2')
            .to(stack, { y: -pageStep * 3, duration: 1, ease: 'power3.inOut' }, '+=2')
            .to(stack, { y: 0, duration: 1.1, ease: 'power3.inOut' }, '+=2')
          return () => documentTour.kill()
        }
      }
    })
    return () => media.revert()
  }, { scope, dependencies: [stage], revertOnUpdate: true })
}
