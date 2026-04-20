```markdown
# Design System Document: Celestial Singularity

## 1. Overview & Creative North Star: "The Celestial Singularity"
This design system is built to bridge the gap between high-science quantum computing and the fluid intelligence of AI. The Creative North Star is **"The Celestial Singularity"**—a vision of a high-end digital observatory where data flows like starlight.

To move beyond generic tech templates, we embrace an **Editorial Asymmetry**. We intentionally break the rigid 12-column grid with overlapping elements, oversized typography that bleeds off-canvas, and depth created through luminosity rather than line-work. This isn't just a landing page; it is a premium cinematic experience that feels both authoritative and ethereal.

---

## 2. Colors: Luminosity & Depth
The palette utilizes the vastness of deep space (`#0c1324`) contrasted against high-energy neon emissions.

### Surface Hierarchy & Nesting
Depth is achieved through the physical stacking of tones. We do not use borders to define space.
*   **Base Layer:** Use `surface` (#0c1324) for the main canvas.
*   **Sub-sections:** Transition to `surface_container_low` (#151b2d) to define new content areas.
*   **Feature Modules:** Nest `surface_container_highest` (#2e3447) inside lower-tier containers to pull focus.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts or subtle tonal transitions. If a section needs to end, let the color shift do the talking.

### The "Glass & Gradient" Rule
To create the "Professional Space Elegance," use Glassmorphism for floating UI elements:
*   **Material:** Use `surface_variant` (#2e3447) at 40-60% opacity with a `20px` backdrop-blur.
*   **Gradients:** Main CTAs must use a linear gradient from `primary` (#00dbe7) to `primary_container` (#001b1d) at a 135-degree angle to simulate light-speed motion.

---

## 3. Typography: The Modern Monolith
The contrast between the geometric **Space Grotesk** and the humanist **Manrope** creates a balance of "High-Tech" and "High-Trust."

*   **Display & Headlines (Space Grotesk):** These are your architectural anchors. Use `display-lg` (3.5rem) with a `-0.02em` letter-spacing for a tight, editorial look. Headlines should feel like massive planetary bodies around which the body text orbits.
*   **Body & Titles (Manrope):** Use these for the "Human" element. `body-lg` (1rem) provides a clean, professional reading experience.
*   **Labels (Manrope):** All-caps `label-md` with `0.1em` tracking should be used for metadata and small categorizations to evoke a "NASA-spec" instrumentation feel.

---

## 4. Elevation & Depth: Tonal Layering
We reject the standard "Drop Shadow" in favor of atmospheric perspective.

*   **The Layering Principle:** Achieve lift by placing a `surface_container_lowest` (#070d1f) card on a `surface_container_low` (#151b2d) section. This creates a "recessed" effect that feels integrated into the interface.
*   **Ambient Glows:** When an element must "float" (like a primary CTA), use a shadow with a 32px blur, 0% spread, and a 10% opacity color-matched to `primary` (#00dbe7). This mimics the way a neon light casts a glow on a dark surface.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use the `outline_variant` (#45464d) at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons: Kinetic Energy
*   **Primary:** Pill-shaped (`full` roundedness scale). Gradient fill (Primary to Primary Container). Text color `on_primary`. 
*   **Secondary:** Ghost style. No background, `outline` token at 20% opacity. On hover, transition to a subtle `surface_bright` fill.
*   **Tertiary:** Text-only with a `primary` underlines that expand from center-out on hover.

### Cards: The Floating Pane
*   **Rule:** Forbid all divider lines.
*   **Construction:** Use `surface_container_high` (#23293c) with `xl` (0.75rem) corner radius. 
*   **Interaction:** On hover, the background should shift to `surface_container_highest` (#2e3447) and the `primary` glow should intensify.

### Input Fields: Monolith Inputs
*   **Style:** Minimalist. A bottom-only `outline_variant` stroke. When active, the stroke transitions to a `primary` neon glow with a subtle `primary_container` inner shadow to suggest depth.

### Quantum Progress Indicators
*   **Custom Component:** Instead of standard spinners, use a series of staggered `primary` and `secondary` dots that pulse with a "wave-function" easing (sinusoidal) to represent quantum uncertainty.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use extreme vertical white space (80px, 120px, 160px) to let the high-end typography breathe.
*   **Do** overlap an image of a quantum processor or AI node across two background color shifts to tie the sections together visually.
*   **Do** use `primary_fixed_dim` (#00dbe7) for small, glowing data points to guide the eye.

### Don't:
*   **Don't** use 100% white (#ffffff). Use `on_surface` (#dce1fb) for a softer, more sophisticated "off-white" that feels premium.
*   **Don't** use standard Material Design "Card Shadows." If the background shift isn't enough, your layout isn't intentional enough.
*   **Don't** use sharp corners. Everything should have at least a `DEFAULT` (0.25rem) radius to maintain the "classy elegance" feel.

---

## Director's Final Note
Junior designers often fear the dark. In this system, the darkness is your canvas. Use the `surface` tones to create a sense of infinite scale, and use the `primary` cyan as if it were the only light source in the room. If it looks like a template, you haven't used enough white space. If it looks flat, you haven't used enough tonal nesting. Build for the future.```