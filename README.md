# Calabar Eats
A full-stack food and grocery delivery platform prototype built with
Next.js, TypeScript, Firebase, and Firestore.
The project models a multi-role marketplace connecting customers, vendors,
dispatchers, and administrators, with authentication, role-based access,
real-time order workflows, and server-side business logic.
> This is a high-fidelity prototype developed to explore multi-user
> application architecture, real-time data flows, and complex business
> workflows.
---
## Overview
Calabar Eats is designed as a centralized marketplace for food and grocery
delivery.
The platform supports different workflows for:
- Customers browsing vendors and placing orders
- Vendors managing products and orders
- Dispatchers managing assigned deliveries
- Administrators overseeing users, vendors, dispatchers, and platform data
The application uses Firebase Authentication for identity and Firestore for
real-time application data.
---
## Key Features
### Multi-Role Architecture
The application supports four primary roles:
- **Admin** — platform-wide management and operational dashboards
- **Vendor** — product management and order processing
- **Dispatcher** — assigned delivery management and status updates
- **Customer** — vendor browsing, cart management, ordering, and delivery
  tracking
### Authentication & Authorization
- Firebase Authentication
- User session management
- Role-based access control
- Role-specific application workflows and dashboards
### Real-Time Workflows
Firestore is used to support real-time application behaviour, including:
- Live order status updates
- Order-specific chat
- Delivery status changes
- Customer delivery confirmation
### Order & Delivery Workflow
The application models an order workflow across customers, vendors, and
dispatchers.
Dispatchers can update delivery status, while customers can confirm receipt
of completed deliveries.
### Dispatcher Ratings
Customers can submit ratings based on their delivery experience.
### Database Seeding
The application includes an admin-facing seed workflow for populating
Firestore with mock:
- Users
- Vendors
- Products
- Orders
---
## Technology Stack
- **Framework:** Next.js with App Router
- **Language:** TypeScript
- **Authentication:** Firebase Authentication
- **Database:** Cloud Firestore
- **Server-side logic:** Next.js Server Actions
- **UI:** React
- **Styling:** Tailwind CSS
- **Component library:** shadcn/ui
- **State management:** Zustand
- **Icons:** Lucide React
---
## Architecture
The application uses a serverless-oriented architecture built around
Next.js and Firebase.

                    ┌─────────────────────┐
                    │      Next.js UI     │
                    │  React + App Router │
                    └──────────┬──────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
       Firebase Auth                    Server Actions
              │                                 │
              │                                 ▼
              │                         Application Logic
              │                                 │
              └────────────────┬────────────────┘
                               ▼
                         Cloud Firestore
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
              Users         Products         Orders

⸻
        
Project Structure

src/
├── app/
│   ├── admin/
│   ├── vendor/
│   ├── dispatcher/
│   ├── cart/
│   ├── checkout/
│   └── orders/
│
├── components/
│   └── Shared React and UI components
│
├── hooks/
│   └── Custom React hooks
│
└── lib/
    ├── actions.ts
    ├── data.ts
    ├── firebase.ts
    └── types.ts

Core Application Logic

src/lib/actions.ts

Contains server-side actions responsible for database mutations and
business logic.

src/lib/data.ts

Contains functions used to retrieve application data from Firestore.

src/lib/firebase.ts

Initializes and configures Firebase.

src/lib/types.ts

Contains TypeScript type definitions used throughout the application.

⸻

Getting Started

Prerequisites

* Node.js 20.x or higher
* npm or Yarn
* A Firebase project

1. Clone the repository

git clone https://github.com/Tegzy-cmd/Calabar-Market.git
cd Calabar-Market

2. Install dependencies

npm install

3. Configure Firebase

Create a Firebase project and add a web application.

Configure the Firebase credentials required by the application in:

src/lib/firebase.ts

Do not commit private credentials, service-account keys, or other secrets to
the repository.

4. Start the development server

npm run dev

The application runs locally on:

http://localhost:9002

⸻

Database Seeding

The application includes a database seeding workflow for generating mock
application data.

To use it:

1. Create an administrator account through Firebase Authentication.
2. Create the corresponding user document in Firestore with the appropriate
    admin role.
3. Start the application.
4. Open the Admin Dashboard.
5. Navigate to the Seed Data page.
6. Run the database seed operation.

The seed workflow populates mock vendors, products, users, and orders.

⸻

Engineering Concepts Demonstrated

This project provided practical experience with:

* TypeScript application architecture
* Next.js App Router
* Server-side business logic
* Server Actions
* Firebase Authentication
* Role-based access control
* Firestore data modelling
* Real-time data flows
* Multi-role application design
* Order and delivery workflows
* Client-side state management
* Component-based UI architecture
* Type-safe application development

⸻

Project Status

High-fidelity prototype.

The project was built to explore the architecture and implementation of a
multi-role, real-time marketplace application and to strengthen practical
experience with TypeScript, Next.js, Firebase, and complex application
workflows.

⸻

Live Demo

⁠Calabar Market : https://calabar-market-nine.vercel.app
