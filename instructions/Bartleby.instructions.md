---
applyTo: '**/*.py, **/**.js, **/**.ts, **/**.jsx, **/**.tsx, **/**.json, **/**.yaml, **/**.md'
---
# Bartleby Application – Structured Outline  
*AI-powered “organize, summarize, analyze” database-builder for researchers, lawyers, entrepreneurs.*

---

## 1. **One-Line Pitch**
Bartleby is an AI-powered, "organize, summarize, analyze" database-builder aimed equally at researchers, lawyers, and entrepreneurs. It provides a one-click-and-done experience, highly adaptable to users’ needs.

---

## 2. **Deployment & Tech Stack**

- **Initial Deployment:** Free tier, hosted on Render (backend) & Vercel (frontend).
- **CORS:** All API endpoints must set appropriate CORS headers for cross-origin operation.
- **Frontend:** React (with Tailwind CSS or equivalent).
- **Backend:** Node.js/Express + SQL (e.g., Postgres).
- **AI Integration:** OpenAI GPT endpoints for extraction, summarization, classification.
- **Storage:** Cloud storage for user files (Vercel Blob, AWS S3, or equivalent).
- **Search:** Vector search for full-text document database.

---

## 3. **UI/UX Partition Layout**

### **A. Top Partition: “Rolodex” & Layout Switcher**
- **Rolodex** of layouts:  
  - Switch between table, grid, node-graph, document browser.
  - Each layout compatible with the tech/data model below.
  - Preview and select “Finishes” (different visualizations and end-use options).
- **Downloadable Masonry Grid:**  
  - Visual cards for items; supports image previews, inline actions.

### **B. Middle Partition: Processing Zone**
- **Upload/Paste/Instructions Box:**  
  - Unified input for files (drag-drop, button) and URLs (parsed from text).
  - Instruction field—AI prompt customization per batch or item.
- **Waiting Room:**  
  - Below input:  
    - Box displaying files “awaiting processing” as semi-transparent text.
    - Each item shows filename, type, basic status.
  - Script parses for URL uploads in instruction field and adds to queue.
  - Processing visualized with progress indicators.

### **C. Bottom Partition: Results Table**
- **Tabbed Table:**  
  - Tabs for “All”, “Documents”, “Images”, “Audio” (user-customizable/addable).
  - Table columns: Title, Type, Hashtags, Emoticons, Color (file type), Relevancy Score, etc.
  - **Sequential ordering & grouping by likeness:**  
    - A-Z by Title/Filename by default; custom groupings by source, type, user-defined.
  - Grouping = classification (e.g., primary/secondary, user outline, item type).
- **Principles:**  
  - No endless scrolling; partitions auto-resize to focus on selection.
  - Table always occupies at least 75% of the visible area when selected.

---

## 4. **Key Functional Requirements**

- **AI-Powered Extraction:**  
  - OpenAI response must include:  
    - Hashtags, emoticons, file-type color, relevancy score.
    - Structured metadata for each item.
- **Document Browser:**  
  - Read/view documents with zoom/full-screen modes.
  - Highlight, annotate, and jump-to-section.
- **Knowledge Graph:**  
  - Node-based visualization of entities, relationships, observations from metadata.
  - Interactive—click to expand, filter, or re-group.

- **Search & Download:**  
  - Vectorized, full-text search on all content and metadata.
  - Downloadable structured data (CSV, JSON, grid view).
- **CSS Adaptation:**  
  - Theme and layout auto-adjust to project description/context.
  - Library of themes; real-time adaptation.
- **Plugin-Ready:**  
  - Rolodex includes area for third-party plugin “Finishes” (future expansion).

---

## 5. **Adaptive UI/UX Features**

- **No Endless Scroll:**  
  - Table paginates or uses intelligent infinite scroll with jump navigation.
- **Responsive Partitioning:**  
  - Active partition grows to 75% width/height, others minimize but stay visible.
- **Custom Grouping:**  
  - User can create/save grouping presets; switch between group/classification modes.

---

## 6. **Technical Notes**

- **All API requests must support CORS.**
- **Database must support full-text vector search and relational joins for grouping.**
- **Theme selection engine parses project description for keywords; applies matching or generated CSS.**
- **File storage, upload, and processing must provide user feedback at each stage (pending, processing, ready, error).**

---

## 7. **Future/Extensible Features**

- 3rd-party plugin integration (“Finishes”)
- Advanced analytics: usage stats, workflow suggestions
- Mobile/tablet UI adaptation

---

## 8. **Success Criteria**

- Seamless one-click upload-to-table workflow.
- Live, context-aware theming.
- All layouts available via top “Rolodex” and downloadable as needed.
- Search, grouping, and document browsing fluid and responsive.
- No forced endless scroll; responsive resizing of partitions.
- Supports free-tier hosting with minimal friction. 
- Backend server hosted by **render** controlled via render.yaml and **vercel** hosted frontend controlled via vercel.json.
---

**End of Outline**
```
