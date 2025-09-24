
# Calabar Eats: A Real-Time, Multi-Tenant Food and Grocery Delivery Platform

**An Academic Project Report**

**Author:** [Your Name]
**Date:** August 2024

---

## **Abstract**

This report documents the design, development, and implementation of "Calabar Eats," a modern, full-stack web application engineered to serve as a centralized platform for on-demand food and grocery delivery. The project addresses the logistical and technical challenges inherent in multi-vendor e-commerce systems by providing a unified ecosystem for consumers, vendors, dispatch riders, and administrators. The system is built on a robust, scalable technology stack, leveraging the Next.js React framework for server-side rendering and static site generation, and Google's Firebase suite (Firestore and Authentication) for real-time data persistence, user management, and back-end services. Key architectural features include a multi-tenant design with role-based access control (RBAC), real-time, event-driven updates for order tracking and live chat, and an automated, rule-based system for assigning delivery tasks to dispatchers. The resulting platform is a high-fidelity prototype that demonstrates the principles of modern, decoupled web architecture, real-time database integration, and the development of a complex, multi-user software system.

---

## **Chapter 1: Introduction**

### 1.1 Background and Motivation

The on-demand delivery market has seen exponential growth, fundamentally altering consumer expectations for convenience and speed. However, in many localized markets, this sector remains fragmented, with consumers having to navigate multiple vendor-specific applications and vendors struggling with disparate order management systems. This fragmentation creates inefficiencies for all stakeholders. Calabar Eats is conceived as a solution to this problem, aiming to create a single, cohesive marketplace that benefits the entire local commerce ecosystem.

### 1.2 Problem Statement

The core problem is the lack of a centralized, real-time platform in the local market that efficiently connects consumers, vendors, and dispatch riders. This leads to several challenges:

*   **For Consumers:** A disjointed user experience requiring multiple applications to access different stores.
*   **For Vendors:** Difficulty in managing online orders, tracking inventory, and communicating with customers and dispatchers.
*   **For Dispatch Riders:** Inefficient and inequitable manual assignment of delivery tasks.
*   **For Platform Administrators:** Lack of a centralized system for oversight, user management, and data analytics.

### 1.3 Aims and Objectives

The primary aim of this project is to develop a scalable, production-ready prototype of a multi-tenant food and grocery delivery platform.

The key objectives to achieve this aim are:

1.  **To Design a Multi-Role Architecture:** Implement a secure system with four distinct roles: User (customer), Vendor, Dispatcher, and Admin, each with a dedicated dashboard and functionalities.
2.  **To Implement Real-Time Functionality:** Utilize a real-time database (Firestore) to enable live order tracking, instant chat between users and vendors, and real-time updates across all dashboards.
3.  **To Automate Dispatcher Assignment:** Develop a server-side function that automatically assigns a new delivery task to an available dispatcher based on predefined rules (i.e., 'available' status).
4.  **To Build a Component-Based Frontend:** Construct a modern, responsive user interface using Next.js, React, and a component library (ShadCN/UI) for a consistent and maintainable codebase.
5.  **To Ensure Secure and Persistent User Sessions:** Integrate a robust authentication system (Firebase Auth) to manage user sign-up, login, and role-based access control across the application.

---

## **Chapter 2: System Architecture and Design**

### 2.1 Technology Stack

The technology stack was chosen to prioritize development velocity, scalability, and real-time capabilities.

*   **Frontend:** Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, ShadCN/UI.
*   **Backend & Database:** Firebase (Firestore for NoSQL database, Firebase Authentication for user management).
*   **Core Language:** TypeScript for end-to-end type safety.
*   **State Management:** Zustand (a lightweight, unopinionated state management library) for client-side state like the shopping cart.
*   **Server-Side Logic:** Next.js Server Actions for handling mutations and server-side operations securely.

### 2.2 Database Schema Design

A NoSQL data model was implemented using Firestore to support the flexible and nested data structures required by the application. The primary collections are:

*   **`users`**: Stores user profile information, including their role (`admin`, `vendor`, `user`, `dispatcher`) and a reference ID (`vendorId` or `dispatcherId`) linking them to their specific role profile if applicable.
*   **`vendors`**: Contains vendor-specific information, such as name, address, category (`food` or `groceries`), and image URLs. Products are managed in a separate collection.
*   **`products`**: A collection where each document represents a product, containing details like name, price, stock, and a `vendorId` to establish a many-to-one relationship with the `vendors` collection.
*   **`dispatchers`**: Stores profiles for dispatch riders, including their vehicle type, current status (`available`, `on-delivery`), and ratings.
*   **`orders`**: The most complex collection. Each order document contains the `userId`, `vendorId`, `dispatcherId` (once assigned), delivery address, total amount, and status (`placed`, `preparing`, `dispatched`, `delivered`, `cancelled`). It also contains a sub-collection for `messages`.
    *   **`messages` (sub-collection):** Nested within each order, this collection stores chat messages related to that specific order, providing a clean, queryable history.

### 2.3 System Architecture

The application employs a client-server architecture facilitated by Next.js. The use of the App Router allows for a hybrid approach, mixing server-rendered components for performance and SEO with client-rendered components for interactivity.

*   **Authentication Flow:** User authentication is handled by Firebase Auth. Upon login, a client-side session is established. The user's profile, including their role, is fetched from the `users` collection in Firestore. This role data is then used to grant access to the appropriate dashboard and functionalities (e.g., `/admin`, `/vendor`, `/dispatcher`).
*   **Real-Time Data Flow:** Firestore's real-time listeners (`onSnapshot`) are used extensively across the platform. For example, the dispatcher's dashboard subscribes to the `orders` collection, listening for documents where their `dispatcherId` is present. Similarly, the chat functionality subscribes to the `messages` sub-collection within an order. This event-driven architecture ensures that all UIs update instantly without the need for manual polling.
*   **Dispatcher Assignment Logic:** This critical business logic is implemented as a server-side function within a Next.js Server Action (`updateOrderStatus`). When a vendor changes an order's status to 'preparing', the action is triggered. It queries the `dispatchers` collection for all documents where the `status` field is 'available', randomly selects one, and updates the order document with the chosen `dispatcherId`. This atomic server-side operation prevents race conditions and ensures data integrity.

---

## **Chapter 3: Implementation and Key Features**

### 3.1 Role-Based Dashboards

Each of the four user roles has a unique, purpose-built dashboard.

*   **Admin Dashboard:** Provides a high-level overview of the entire system. It features CRUD (Create, Read, Update, Delete) interfaces for managing users, vendors, and dispatchers. It also includes data visualizations (charts) for total revenue, sales by category, and other key performance indicators.
*   **Vendor Dashboard:** Allows vendors to manage their store. Key features include a product management interface, an order management list with real-time status updates, and a detailed view of each order. Vendors can update an order's status, which triggers the dispatcher assignment process.
*   **Dispatcher Dashboard:** A focused interface for delivery tasks. It displays a real-time list of active and completed deliveries assigned to the logged-in dispatcher. From here, a dispatcher can update the order status from 'dispatched' to 'delivered'.
*   **User (Customer) Experience:** Includes browsing vendors by category, adding items to a cart, a multi-step checkout process, and viewing order history and real-time order tracking pages.

### 3.2 Real-Time Order Tracking and Chat

The order detail page (`/orders/[id]`) is a prime example of the system's real-time capabilities.

*   **Live Status Updates:** The page subscribes to the specific order document in Firestore. Any change to the `status` field (e.g., from 'preparing' to 'dispatched') is instantly reflected in the UI, showing a progress timeline to the user.
*   **Live Chat:** A chat component on the order page allows the user to communicate directly with the vendor. The component listens to the `messages` sub-collection for that order. When a new message is sent (by either user or vendor), it is added to the collection, and the `onSnapshot` listener automatically updates the UI for both parties. Read receipts are handled client-side using `localStorage` to track the timestamp of the last seen message.

### 3.3 Code Reusability and Maintainability

The codebase is structured for scalability and maintainability.

*   **Component-Driven UI:** The UI is built using reusable React components, many of which are styled with ShadCN/UI and Tailwind CSS. This ensures a consistent look and feel and reduces code duplication.
*   **Server Actions:** Business logic and database mutations are encapsulated in Next.js Server Actions (`src/lib/actions.ts`). This centralizes server-side logic, making it secure and easy to manage, while allowing it to be called from client components as if it were a local function.
*   **Typed Data Models:** TypeScript is used to define strict types for all data models (e.g., `User`, `Order`, `Product`). This prevents common data-related bugs and improves developer experience by providing autocompletion and type-checking.

---

## **Chapter 4: Conclusion and Future Work**

### 4.1 Project Summary

Calabar Eats successfully demonstrates the feasibility of building a complex, real-time, multi-tenant application using a modern serverless technology stack. The project meets all its core objectives, delivering a functional prototype with distinct, role-based interfaces, real-time data synchronization for critical features like order tracking and chat, and automated business logic for dispatcher assignment. The architecture is scalable, secure, and maintainable, providing a solid foundation for a production-grade application.

### 4.2 Future Work

While the current implementation is a robust prototype, several features could be added to enhance it further:

*   **Live Dispatcher Location Tracking:** Integrate a mapping library (e.g., Mapbox, Google Maps API) to show the dispatcher's location in real-time on the user's order tracking page.
*   **Payment Gateway Integration:** Replace the simulated payment processing with a real payment gateway like Stripe or Paystack.
*   **Inventory Management:** Implement logic to automatically decrement a product's stock when an order is placed and alert vendors when stock is low.
*   **Advanced Dispatcher Assignment:** Enhance the assignment algorithm to consider factors like proximity to the vendor, current workload, and dispatcher rating, potentially using a geospatial query.
*   **Notifications:** Add push notifications to alert users, vendors, and dispatchers of important events (e.g., new order, new chat message, order dispatched).
