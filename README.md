his repository contains a frontend simulation of the Tech Store platform.

The purpose of this version is to showcase:

UI/UX structure
Component architecture
State management logic
Frontend routing
API integration workflow (mocked)

This is not connected to the production backend.
Instead, it uses a simulated data layer that mimics the expected backend responses.

Objective

The goal of this repository is to:

Demonstrate how the frontend behaves in a real environment
Validate user flows (authentication, product browsing, cart logic, etc.)
Simulate API calls and asynchronous behavior
Present a near-final visual and functional experience

It serves as a frontend proof of concept before full backend integration.

Architecture
Frontend Stack
React
Vite / CRA (depending on your setup)
Tailwind CSS
React Router
Context API / State management (if used)
Simulated Backend

Instead of a real backend, this project uses:

Local JSON data
Mock service layer
Simulated async API calls (setTimeout, Promises)
Structured service functions that mirror real REST endpoints

Example structure:

src/
 ├── components/
 ├── pages/
 ├── services/        ← mock API layer
 ├── data/            ← static JSON data
 ├── context/
 └── routes/

The services/ layer is designed to match the expected real API contract.

Why a Simulation?

This approach allows:

Frontend-first development
Faster UI iteration
Independent development from backend team
Clear separation of concerns
Easy replacement of mock services with real API calls later

When integrating the real backend, only the service layer will need adjustment.

Current Features (Simulated)
Product listing
Product details page
Cart management
UI-based authentication flow
Responsive layout
Form validation
State persistence (if implemented)
How to Run the Project
npm install
npm run dev

Then open:

http://localhost:5173

(or your configured port)

Disclaimer

This repository is for demonstration and architectural validation purposes only.

No real database
No production authentication
No real payment system
No production API

It reflects the intended final user experience and frontend structure.

Future Integration Plan
Replace mock services with real API endpoints
Connect authentication to backend
Add production-grade error handling
Implement secure API communication
Author

Yanis Saidi
Frontend & Full Stack Developerhis repository contains a frontend simulation of the Tech Store platform.

The purpose of this version is to showcase:

UI/UX structure
Component architecture
State management logic
Frontend routing
API integration workflow (mocked)

This is not connected to the production backend.
Instead, it uses a simulated data layer that mimics the expected backend responses.

Objective

The goal of this repository is to:

Demonstrate how the frontend behaves in a real environment
Validate user flows (authentication, product browsing, cart logic, etc.)
Simulate API calls and asynchronous behavior
Present a near-final visual and functional experience

It serves as a frontend proof of concept before full backend integration.

Architecture
Frontend Stack
React
Vite / CRA (depending on your setup)
Tailwind CSS
React Router
Context API / State management (if used)
Simulated Backend

Instead of a real backend, this project uses:

Local JSON data
Mock service layer
Simulated async API calls (setTimeout, Promises)
Structured service functions that mirror real REST endpoints

Example structure:

src/
 ├── components/
 ├── pages/
 ├── services/        ← mock API layer
 ├── data/            ← static JSON data
 ├── context/
 └── routes/

The services/ layer is designed to match the expected real API contract.

Why a Simulation?

This approach allows:

Frontend-first development
Faster UI iteration
Independent development from backend team
Clear separation of concerns
Easy replacement of mock services with real API calls later

When integrating the real backend, only the service layer will need adjustment.

Current Features (Simulated)
Product listing
Product details page
Cart management
UI-based authentication flow
Responsive layout
Form validation
State persistence (if implemented)
How to Run the Project
npm install
npm run dev

Then open:

http://localhost:5173

Disclaimer

This repository is for demonstration and architectural validation purposes only.

No real database
No production authentication
No real payment system
No production API

It reflects the intended final user experience and frontend structure.

Future Integration Plan
Replace mock services with real API endpoints
Connect authentication to backend
Add production-grade error handling
Implement secure API communication
Author

Yanis Saidi
Frontend & Full Stack Developer
