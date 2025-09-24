
# Calabar Eats: Food & Grocery Delivery Platform

![Calabar Eats Hero](https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

**Developed by: Benjamin Omoraka**

---

## 📖 About The Project

**Calabar Eats** is a modern, full-stack, and real-time multi-tenant food and grocery delivery platform. It serves as a centralized marketplace connecting consumers, vendors, and dispatch riders, providing a seamless e-commerce experience for the local Calabar market.

The application is engineered to solve the fragmentation in the on-demand delivery sector by creating a unified ecosystem where users can browse various stores, vendors can manage their operations, and dispatchers can efficiently handle deliveries.

This project is a high-fidelity prototype built with a robust and scalable technology stack, showcasing modern web architecture, real-time database integration, and a complex multi-user software system.

---

## ✨ Key Features

- **Multi-Role Architecture:** Four distinct user roles, each with a purpose-built dashboard and permissions.
    - **👤 Admin:** System-wide oversight with dashboards for managing users, vendors, and dispatchers, complete with data visualizations for revenue and sales analytics.
    - **🏪 Vendor:** A comprehensive dashboard for product management, real-time order tracking, and status updates.
    - **🏍️ Dispatcher:** A focused interface for managing assigned delivery tasks, updating order statuses, and tracking earnings.
    - **🧑‍🍳 Customer:** A smooth and intuitive experience for browsing vendors, adding items to a cart, and tracking orders from placement to delivery.
- **Real-Time Functionality:** Powered by Firestore, the platform offers:
    - **Live Order Tracking:** Status updates are reflected instantly across all relevant dashboards.
    - **Live Chat:** Seamless communication between customers and vendors, and customers and dispatchers, within the context of an order.
    - **Two-Way Delivery Confirmation:** A secure handoff process where dispatchers mark an order as arrived, and customers confirm receipt.
- **Dispatcher Rating System:** Customers can rate their delivery experience, providing valuable feedback and ensuring service quality.
- **Secure Authentication:** Robust user sign-up, login, and session management handled by Firebase Authentication, with role-based access control.
- **Dynamic Frontend:** A fully responsive and interactive UI built with Next.js, React, and ShadCN/UI.

---

## 🛠️ Technology Stack

The project leverages a modern, serverless-first technology stack chosen for its scalability, real-time capabilities, and excellent developer experience.

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database:** [Firebase](https://firebase.google.com/)
    - **Firestore:** For the real-time NoSQL database.
    - **Firebase Authentication:** For user and session management.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [ShadCN/UI](https://ui.shadcn.com/) for the component library.
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) for lightweight client-side state (e.g., shopping cart).
- **Server-Side Logic:** Next.js Server Actions for secure and centralized business logic.
- **Icons:** [Lucide React](https://lucide.dev/)

---

## ⚙️ Getting Started

Follow these steps to get a local copy of the project up and running.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/calabar-eats.git
    cd calabar-eats
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up Firebase:**
    a. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    b. In your project, go to **Project settings** and add a new web app.
    c. Firebase will provide you with a `firebaseConfig` object. Copy this object.
    d. In the root of this project, navigate to `src/lib/firebase.ts`.
    e. **Replace the placeholder `firebaseConfig` object** with the one from your Firebase project.

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

### Seeding the Database

To get started with mock data, you can seed your Firestore database.

1.  After starting the application, log in as an admin user.
    *   **Note:** You can manually create an admin user in your Firebase Authentication console and then create a corresponding document in your `users` collection in Firestore with the `role` field set to `'admin'`.
2.  Navigate to the Admin Dashboard and go to the **Seed Data** page (`/admin/seed`).
3.  Click the "Seed Database" button. This will populate your database with mock vendors, products, users, and orders.

---

## 🚀 Project Structure

- **`src/app/`**: Contains all routes and pages, organized by role (admin, vendor, dispatcher) and feature (cart, checkout, orders).
- **`src/components/`**: Shared and UI components built with React and ShadCN/UI.
- **`src/lib/`**: Core application logic.
    - **`actions.ts`**: Server Actions for all database mutations and business logic.
    - **`data.ts`**: Functions for fetching data from Firestore.
    - **`firebase.ts`**: Firebase initialization and configuration.
    - **`types.ts`**: All TypeScript type definitions for the project.
- **`src/hooks/`**: Custom React hooks for managing state like authentication and the shopping cart.

---

This README provides a comprehensive guide to understanding, setting up, and exploring the Calabar Eats application.
