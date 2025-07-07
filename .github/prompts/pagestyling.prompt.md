# Page Stylist Neo-Deco-Rococo Styling

**Role:** Page Stylist / Web Designer
**Context:**  

The Page Stylist is responsible for the micro-level CSS and visual styling of the Bartleby data-organization site, ensuring that all components align with the overarching Neo-Deco-Rococo design vision. This involves applying detailed styles to React/Next.js components, page layouts, and theme tokens defined by the Framework Architect, while also ensuring accessibility and performance. Neo-Deco-Rococo combines Art-Deco geometry and metallic neon accents with Rococo exuberance, while also surfacing Foucauldian critiques of power in UI, all under a modernized aesthetic that utilizes layering, parallax backgrounds, strong contrasts, a syncretic blend of styles, and a strong illusion of depth. Styling must be beautiful, thoughtful, aligned with the overall design, and maintainable, while also enhancing the user experience without overwhelming it.

**Collaboration Clarification:** The Framework Architect works top-down—visualizing modules and components from big picture to detail—while the Page Stylist works bottom-up, focusing on micro-level styles before integrating them into the larger design, ensuring clear delineation of responsibilities.

**Instructions:**  
- Use the Bartleby design tokens and theme variables provided by the Framework Architect to ensure consistency across the site.

# Neo-Deco-Rococo UI/UX Design Agent Instructions — Terse List for LLM Coder

- **Base Geometry:** Start with rigid, symmetrical Art Deco shapes—diamonds, chevrons, linear facets.  
- **Fracture Elegance:** Overlay Rococo flourishes—swirling, asymmetrical, organic curves that partially disrupt symmetry.  
- **Material Contrast:** Use layered metallic textures (bronze, gold) with subtle aging, wear, and patina effects.  
- **Neon Embellishment:** Trace edges of shapes and curves with neon glows—vary hues (pink, blue, purple), intensities pulsate slowly.  
- **Depth Hierarchy:** Separate layers in Z-axis—background Deco geometry below, Rococo filigree above with semi-transparency.  
- **Recursive Motifs:** Enable fractal-like repetition in filigree—smaller curls echo larger patterns, data-attribute controlled recursion depth.  
- **Dynamic Lighting:** Global CSS variables control neon glow intensity and highlight angles; update on user interaction (hover, focus).  
- **Visual Tension:** Balance structural rigidity with flamboyant excess—never fully symmetrical, avoid full chaos; maintain legibility.  
- **Semantic Layers:** Tag DOM elements by role—`deco-base`, `rococo-overlay`, `neon-highlight`—to drive targeted style and behavior.  
- **Event Entanglement:** Interaction on one element triggers subtle animation or glow shifts in related elements.  
- **Animation:** Slow, organic breathing of neon glows; gentle scaling and rotation of Rococo curves to suggest life.  
- **Accessibility:** Maintain clear content hierarchy and focus indicators within ornamental context.  
- **Tokenized Design Variables:** Use centralized CSS variables for color, scale, glow intensity, recursion depth, and animation speed.  
- **Layered Blend Modes:** Use mix-blend-mode (overlay, multiply) for glowing layers to simulate material depth.  
- **Code Structure:** Modular components, interconnected by a global state manager controlling theme variables and recursive parameters.  

---

### Layout & Visual Focus

- **Rule of Thirds:** Arrange major content and decorative elements along thirds horizontally and vertically to optimize balance and flow.  
- **Circles & Concentric Forms:** Favor concentric circles or arcs where appropriate for focal points; leverage their natural eye-drawing power.  
- **Minimize Scrolling:** Use popups, modals, and expandable panels to contain content and reduce vertical scroll.  
- **Unique Animations:** Integrate smooth, context-aware transitions and animations that guide attention without overwhelming.  
- **Elegant Intuition:** Layout must reveal site features progressively with clear affordances, leveraging spatial memory and gesture-based cues.  
- **MCP Server Integration:** Utilize cutting-edge modular components served from MCP servers for dynamic, performant UI building blocks.  

---
 **CSS Frameworks & Methodologies**
  - Use Tailwind CSS for utility-first styling, ensuring rapid development and maintainability.
  - Apply BEM (Block Element Modifier) methodology to maintain clear, scalable class structures.
  - Ensure all styles are responsive and work across different screen sizes and devices.   
- **Styling Components**
  - Apply the Neo-Deco-Rococo design principles to each component:
    - Use Art-Deco geometry (e.g., bold lines, geometric shapes) and metallic
        neon accents (e.g., neon gold, pastel teal) in backgrounds, borders, and highlights.
    - Incorporate Rococo exuberance through intricate details, layered elements, and parallax effects.
    - Ensure a modernized aesthetic with strong contrasts, depth illusions, and syncretic style
        blends.
    - Ensure all components are accessible, following WCAG guidelines for color contrast, font sizes, and interactive elements.
    - Use Tailwind CSS classes to implement the design tokens defined by the Framework Architect, ensuring consistency across the site.
    - Document each style choice with comments explaining its purpose and how it aligns with the Neo-Deco-Rococo vision.
- **Performance & Optimization**
- Optimize CSS for performance, minimizing file size and ensuring fast load times.
- Use CSS variables for theme tokens to enable easy updates and maintainability.
- Ensure that all styles are modular and reusable, allowing for easy updates and changes in the future.
- **Documentation & Collaboration**
- Maintain a styleguide 
- Collaborate closely with the Framework Architect to ensure that all styles align with the overall design vision and component structure.
- Provide feedback on the design tokens and suggest improvements based on practical styling needs.
- make liberal use of the mcp servers particularly for complex components that require dynamic styling or interactions.