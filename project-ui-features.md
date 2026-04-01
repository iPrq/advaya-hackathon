# Ageis: Project UI & Feature Specification

This document details all the technical capabilities, API integrations, and components currently implemented in the **Ageis** medical companion app. Use this guide to design and develop a completely new User Interface.

## 1. Core Architecture
- **Frontend Stack**: Next.js 16 (App Router), React, Tailwind CSS, Framer Motion, Lucide React (Icons).
- **Mobile Container**: Capacitor (Exports the Next.js static build into native iOS/Android WebViews).
- **Camera Plugin**: `@capacitor/camera` and `@ionic/pwa-elements` (for web fallback).
- **Intelligence Layer**: A standalone Python FastAPI backend running locally (`http://localhost:8000`), using the Gemini 1.5 Flash Vision model via the `@google/genai` SDK.

## 2. Feature Workflows

### A. The Dashboard (Scanner UI)
This is the initial screen. It should feature:
- A prominent **"Scan Medical Document"** CTA button.
- A **HIPAA Compliant** or Privacy badge for trust.
- **Action**: When clicked, the button triggers `scanDocument()`. This uses the native device camera (or uploads a file via the PWA fallback on the web). It extracts the image as a pure `base64String` and pushes it to the backend.
- **Error State**: A mechanism to display network errors or API errors gracefully if the image analysis fails.

### B. The Loading State
- **Trigger**: Activates immediately once the photo is captured and sent over HTTP to the backend.
- **UI Needs**: Because LLM vision models take 3 to 10 seconds to analyze high-density documents, a premium loading indicator is required (e.g., an animated scanning graphic, pulsing skeletons, or a comforting "Analyzing Data Safely" message).

### C. The Results View (The AI Timeline)
This is the core value proposition of the app. The backend returns a complex JSON payload (`ParsedReport`) which the UI must visualize. 
The payload always contains three specific arrays:

#### 1. "Crucial Safety Rules" (`report.safetyGuardrails`)
- **Data Shape**: Array of strings (`{ rule: string }[]`).
- **UI Requirement**: Must be styled as high-priority, critical alerts (e.g., red banners, warning icons). These are life-saving warnings like *"Do not mix with alcohol"* or *"Take on an empty stomach."*

#### 2. "Daily Schedule" (`report.medicationSchedule`)
- **Data Shape**: Array of objects:
  ```json
  {
    "medicineName": "Amoxicillin",
    "dosage": "500mg",
    "timeOfDay": "Morning and Evening",
    "instructions": "Take with food"
  }
  ```
- **UI Requirement**: Needs to be a vertical timeline, a list of cards, or an agenda view. Since the data is grouped by time or medicine, the design should emphasize the `timeOfDay` and `medicineName` for easy parsing by an elderly or confused patient.

#### 3. "Locations & Protocol" (`report.locations`)
- **Data Shape**: Array of objects:
  ```json
  {
    "action": "Physical Therapy",
    "location": "Clinical Setting"
  }
  ```
- **UI Requirement**: Secondary information blocks showing *where* things are supposed to happen (e.g., "At Home" vs "At the Hospital"). Best represented with map icons.

### D. System Actions
- **"Scan New Document"**: A sticky or floating action button in the Results UI that resets the `report` state back to `null`, allowing the user to take a new photo.

## 3. UI/UX Design Constraints (Crucial)
1. **Capacitor Mobile Native Feel**: The app runs on phones. Avoid hover states as primary interactions since they don't exist on touch screens. Ensure tap targets (buttons) are at least `44x44px`.
2. **Missing Data Handling**: The LLM will occasionally return empty arrays for `safetyGuardrails` or `locations` if the document doesn't mention them. The UI must handle empty lists safely without crashing, either by hiding the section entirely or showing an "All Clear" badge.
3. **Accessibility**: This is a medical app. High contrast text, legible font sizes (Tailwind `text-base` minimum for body copy), and very clear visual hierarchy are non-negotiable. 
