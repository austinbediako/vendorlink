# A Web-Based Vendor Management System for Linking Businesses with Artisans and Service Providers

## Project Thesis

**UNIVERSITY OF GHANA**

**COLLEGE OF BASIC AND APPLIED SCIENCES**

**DEPARTMENT OF COMPUTER SCIENCE**

**A WEB BASED VENDOR MANAGEMENT SYSTEM FOR LINKING BUSINESSES WITH ARTISANS AND SERVICE PROVIDERS**

BY

**\[STUDENT FULL NAME\]**

INDEX NUMBER: \[INDEX NUMBER\]

A PROJECT SUBMITTED TO THE DEPARTMENT OF COMPUTER SCIENCE, UNIVERSITY OF GHANA, IN PARTIAL FULFILLMENT OF THE REQUIREMENTS FOR THE AWARD OF A BACHELOR OF SCIENCE DEGREE IN INFORMATION TECHNOLOGY

SUPERVISOR: \[SUPERVISOR NAME\]

2025/2026 ACADEMIC YEAR

---

# TABLE OF CONTENTS

1. [Chapter One: Introduction](#chapter-one-introduction)
2. [Chapter Two: Literature Review](#chapter-two-literature-review)
3. [Chapter Three: Methodology and System Design](#chapter-three-methodology-and-system-design)
4. [Chapter Four: Implementation and Testing](#chapter-four-implementation-and-testing)
5. [Chapter Five: Conclusion and Future Work](#chapter-five-conclusion-and-future-work)

---

# CHAPTER ONE: INTRODUCTION

## 1.1 Background of the Study

Ghana's service economy includes a large population of skilled artisans, including electricians, plumbers, carpenters, welders, tailors, and technicians, many of whom operate informally without a registered business presence or a digital footprint. Businesses that need this kind of work done, whether a small retail shop needing an electrical fault fixed or an office needing furniture repaired, typically rely on personal recommendations to find someone reliable. This method works reasonably well within an existing network but breaks down entirely for a business without one, or when the usual contact is unavailable, overbooked, or simply not skilled enough for the specific job at hand.

Digital platforms have addressed this exact problem in other markets. Services such as TaskRabbit and Thumbtack in the United States allow consumers to browse verified providers, compare ratings, and book a job through a single interface. Ghana does not yet have an equivalent platform purpose built for the relationship between businesses and artisans, and the informal digitization that does exist, largely through classifieds sites and social media groups, does not offer verification, booking, or accountability. This project responds directly to that gap.

## 1.2 Problem Statement

Businesses seeking artisans or service providers in Ghana currently have no structured way to evaluate a provider's competence, reliability, or history before engaging them. Engagements happen through informal channels with no record keeping, no rating history, and no formal process for resolving disputes when work is unsatisfactory or incomplete. Capable artisans, in turn, have no formal channel through which to build a reputation that extends beyond their immediate personal network, which limits their income opportunities regardless of skill level. The absence of a managed digital intermediary results in inefficiency for businesses and lost opportunity for providers.

## 1.3 Aim and Objectives

The aim of this study is to design and implement a web based vendor management system that connects businesses with verified artisans and service providers, and that supports the full engagement lifecycle from discovery through booking to completion and review.

The specific objectives guiding this work are as follows.

* To design a platform that allows businesses to post service requests and discover suitable artisans and service providers based on category, location, and rating.
* To implement a vendor verification and rating mechanism that establishes a measurable level of trust between businesses and providers.
* To enable structured service booking and job status tracking between a business and the provider it engages.
* To provide an administrative layer for vendor onboarding, oversight, and dispute resolution.
* To evaluate the usability and practical value of the system with a sample of target users drawn from both businesses and artisans.

## 1.4 Research Questions

* What features do businesses consider necessary when selecting an artisan or service provider through a digital platform?
* What verification and rating mechanisms are effective in establishing trust in an informal service economy such as Ghana's?
* How should the booking and job tracking workflow be structured to suit both parties in the transaction?
* What role should platform administration play in maintaining quality and resolving disputes?

## 1.5 Scope and Limitations

This study covers the design, development, and evaluation of a web based platform supporting three user roles, namely the business, the artisan or service provider, and the administrator. Core functionality includes account registration, service request posting, vendor discovery and search, booking, job status tracking, and post job rating. The prototype will be evaluated with a small sample of representative users within the academic timeline available. A live payment gateway, a dedicated native mobile application, and nationwide vendor recruitment fall outside the current scope and are identified in Chapter Five as directions for future work.

## 1.6 Significance of the Study

For businesses, this project offers a structured and lower risk way to find and engage reliable artisans, reducing the time and uncertainty currently involved in informal sourcing. For artisans and service providers, it offers a formal channel through which reputation and reliability can be demonstrated to a wider pool of potential clients than personal networks alone would reach. For the academic community, the project documents a concrete approach to designing trust and matching mechanisms for a two sided marketplace operating within an informal economy, a context that is comparatively under studied relative to formal gig economy platforms in developed markets.

## 1.7 Organization of the Report

This report is organized into five chapters. Chapter One introduces the study, the problem it addresses, and its objectives. Chapter Two reviews existing literature and comparable platforms, and identifies the specific gap this project addresses. Chapter Three presents the methodology and system design, including the requirements gathering approach and the architectural decisions guiding implementation. Chapter Four, to be completed during the implementation phase, will present the built system and the testing carried out against it. Chapter Five, also to be completed later, will summarize findings, note limitations, and recommend directions for future work.

---

# CHAPTER TWO: LITERATURE REVIEW

## 2.1 Introduction

This chapter reviews the conceptual foundations relevant to the proposed system and examines existing platforms that address comparable problems, whether in Ghana or in other markets. The chapter closes by identifying the specific gap that the proposed vendor management system is intended to fill.

## 2.2 The Informal Service Sector and Digital Intermediation

A large share of economic activity in Ghana, as in much of Sub Saharan Africa, takes place within the informal sector, where artisans and small service providers operate without formal registration, standardized pricing, or documented performance history. Research on digital intermediation in informal economies generally points to three recurring barriers that any platform must address, namely trust between strangers who have no prior relationship, discoverability of providers who have no existing marketing channel, and accountability once a transaction has taken place. Digital platforms that succeed in formal gig economies typically resolve these barriers through verification schemes, rating systems, and transaction records, none of which currently exist in a widely adopted form for Ghana's artisan and service provider economy.

## 2.3 Trust and Reputation Mechanisms in Two Sided Marketplaces

Two sided marketplace platforms, meaning platforms that connect a supply side and a demand side rather than serving a single user group, rely heavily on reputation systems to substitute for the trust that would otherwise come from personal referral. Star ratings, written reviews, verified badges, and job completion counts are the most common mechanisms observed across established platforms. For the proposed system, this literature supports building rating and verification into the core data model from the outset rather than treating it as an add on feature, since it is the mechanism that gives businesses a reason to engage a provider they have never met.

## 2.4 Review of Existing and Comparable Systems

A number of existing platforms address parts of the problem this project is concerned with, though none combine business focused vendor management with a Ghanaian informal service context. The table below compares the most relevant platforms against the dimensions that matter most for this project, namely target market, matching mechanism, trust and verification approach, payment integration, and the specific gap each leaves relative to the system proposed here.

| Platform | Target market | Matching mechanism | Trust and verification | Payment integration | Gap relative to proposed system |
| :---- | :---- | :---- | :---- | :---- | :---- |
| TaskRabbit | General consumer errands and small tasks in the United States and parts of Europe | Consumer browses tasker profiles and requests a booking directly | Background checks and a public rating system | In app card payment | Not localized for Ghana, not designed around registered businesses sourcing recurring artisan services |
| Thumbtack | Home improvement and professional services in the United States | Consumer posts a job, multiple providers submit quotes | Reviews, licensing verification where applicable | Payment handled outside the platform in most cases | No structured business to vendor workflow, and the quote bidding model does not fit informal artisan pricing norms in Ghana |
| Jiji Ghana (services category) | General classifieds including services, Ghana wide | Static listing browsed by the consumer, contact is made outside the app | No formal verification of vendors | No payment integration, transactions happen offline | Functions as a listing board rather than a managed system with booking, status tracking, and accountability |
| Informal WhatsApp and Facebook groups | Local, community based referrals | Word of mouth and manual matching | None, relies entirely on personal trust | None | No record keeping, no accountability, no way to compare providers on objective criteria |

Taken together, these comparisons show that global platforms such as TaskRabbit and Thumbtack have proven the underlying model of structured service marketplaces, but neither is localized for Ghana nor built around the recurring business to vendor relationship this project targets. Local alternatives such as Jiji function as classifieds boards rather than managed systems, offering no verification, booking, or tracking. Informal referral through WhatsApp and Facebook groups remains the dominant method in practice, but leaves no record, no accountability, and no way to compare providers on any objective basis.

## 2.5 Identified Gap

The reviewed literature and comparable platforms confirm that no existing solution combines the following three elements in a form suited to the Ghanaian market, namely a managed booking and job tracking workflow, a verification and rating mechanism built specifically around artisans and service providers rather than general consumer tasks, and a design oriented toward recurring business use rather than one off consumer requests. This is the specific gap the proposed vendor management system is designed to fill.

## 2.6 Summary

This chapter has reviewed the conceptual challenges of digitizing an informal service economy, examined how comparable platforms address trust and matching, and identified the specific gap this project addresses. The following chapter presents the methodology and system design that will guide the implementation of the proposed system.

---

# CHAPTER THREE: METHODOLOGY AND SYSTEM DESIGN

## 3.1 Introduction

This chapter presents the methodology adopted for the project and the design decisions that will guide implementation. It covers the development methodology, the approach to requirements gathering, the functional and non functional requirements of the system, and the architectural and data design that follows from those requirements.

## 3.2 Development Methodology

The project will be developed using the Agile methodology, structured around short iterative cycles rather than a single linear Waterfall process. This choice is justified by the nature of the problem being addressed. The system serves two distinct user groups, businesses and artisans, whose needs are not fully known in advance and are best refined through iterative feedback rather than fixed up front specification. Agile development allows each major feature, such as vendor search or job status tracking, to be built, reviewed, and adjusted independently, which reduces the risk of discovering a fundamental design flaw only after the full system has been built.

## 3.3 Requirements Gathering Approach

Requirements will be gathered primarily through short structured interviews with a small sample of small business owners and independent artisans or service providers, supplemented by informal observation of how these engagements currently take place. The purpose of this primary data collection is to validate the assumptions underlying the proposed feature set, particularly around what businesses look for when selecting a provider and what artisans would need in order to trust and adopt a new platform. Findings from this process will directly inform the functional requirements set out below and will be documented as they are gathered.

## 3.4 Functional Requirements

* The system shall allow a business to register an account and create a profile describing the nature of the business.
* The system shall require an artisan or service provider to complete a profile with categories, location, and contact details before accessing the marketplace.
* The system shall allow a business to post a service request specifying category, description, location, and preferred timeframe.
* The system shall only show artisans service requests that match the categories selected in their profile.
* The system shall allow a business to search and filter available artisans or service providers by category, location, and rating.
* The system shall mask exact coordinates from both parties until an application is approved or a booking is accepted.
* The system shall allow an artisan or service provider to apply to a posted service request or to be directly booked by a business.
* The system shall track the status of a booked job through defined stages, such as requested, accepted, in progress, and completed.
* The system shall allow a business to rate and review a provider following completion of a job.
* The system shall provide an administrator role capable of verifying new vendor registrations and reviewing flagged disputes.

## 3.5 Non Functional Requirements

* The system shall be accessible through standard web browsers on both desktop and mobile screen sizes.
* The system shall respond to typical user actions, such as search and booking, within a time frame that does not disrupt the user experience.
* The system shall protect user account credentials and personal data in line with standard authentication practices.
* The system shall be designed for reasonable scalability, so that additional vendor categories or user volume do not require a fundamental redesign.

## 3.6 System Architecture

The system follows a standard three-tier client-server architecture:

1. **Presentation Layer (Frontend)**: A React based single page application that provides the user interface for businesses, artisans, and administrators.
2. **Application Layer (Backend)**: A Node.js/Express REST API that implements business logic, authentication, and data access rules.
3. **Data Layer (Database)**: A PostgreSQL relational database that stores users, profiles, service requests, bookings, ratings, and disputes.

Communication between the frontend and backend is through a JSON based REST API over HTTP. This separation allows either layer to be replaced or scaled independently.

## 3.7 Use Case Overview

Three actors interact with the system, namely the business user, the artisan or service provider, and the administrator. The business user is able to register, post a service request, search and filter available providers, book a provider, track job status, and submit a rating on completion. The artisan or service provider is able to register, build a profile, respond to service requests, update job status as work progresses, and view ratings received. The administrator is able to verify new vendor registrations, monitor platform activity, and review or resolve disputes raised by either party.

## 3.8 Database Design

The relational database schema includes the following core entities:

* **users**: stores authentication credentials and role.
* **business_profiles**: extends users with business specific information and map coordinates.
* **artisan_profiles**: extends users with artisan specific information, categories, verification status, and map coordinates.
* **service_categories**: classifies the type of work offered.
* **service_requests**: records a business's request for work, including map coordinates and a calendar-based preferred date.
* **bookings**: links a business and artisan for a specific job and tracks its status.
* **booking_status_history**: records each status change for audit and tracking.
* **ratings**: stores business feedback for completed bookings.
* **disputes**: records conflicts raised by either party and their resolution.
* **notifications**: stores system messages for users.

## 3.9 Proposed Tools and Technologies

The implementation uses the following technologies:

* **Frontend**: React, Vite, React Router, Tailwind CSS, Axios, Lucide React, Leaflet (react-leaflet)
* **Backend**: Node.js, Express, JSON Web Tokens, bcryptjs, express-validator
* **Database**: PostgreSQL with node-postgres driver
* **Testing**: Jest and Supertest for backend API tests
* **Version Control**: Git

## 3.10 Summary

This chapter has set out the Agile methodology guiding the project, the approach to gathering requirements directly from businesses and artisans, the functional and non functional requirements derived from that process, and the architectural and data design that will carry the project into implementation. Chapter Four will present the implemented system against these requirements, together with the results of testing carried out on it.

---

# CHAPTER FOUR: IMPLEMENTATION AND TESTING

## 4.1 Introduction

This chapter describes how the vendor management system was implemented and the testing carried out to verify its functionality. The implementation is organized into a React frontend, a Node.js/Express backend, and a PostgreSQL database.

## 4.2 Project Structure

The project is divided into two main directories:

* `client/` contains the React frontend, including pages, reusable components, authentication context, and API service.
* `server/` contains the Express backend, including route handlers, middleware, database scripts, and API tests.

## 4.3 Backend Implementation

The backend exposes a REST API with the following route groups:

* `/api/auth` for registration and login
* `/api/profile` for profile management and completeness checks
* `/api/artisans` for vendor discovery and public profiles
* `/api/service-requests` for posting, browsing, applying, and approving requests
* `/api/bookings` for booking lifecycle and status updates
* `/api/ratings` for post job reviews
* `/api/admin` for administrator operations

Authentication is implemented using JSON Web Tokens (JWT). Passwords are hashed with bcryptjs before storage. Role based access control middleware restricts sensitive operations to appropriate user types.

## 4.4 Frontend Implementation

The frontend is a single page application built with React and React Router. Key pages include:

* **Home**: Landing page explaining the platform.
* **Login/Register**: Authentication forms.
* **Complete Profile**: Mandatory artisan onboarding page shown after registration.
* **Dashboard**: Role specific overview with quick actions.
* **Artisan Search**: Filterable listing of artisans.
* **Artisan Profile**: Detailed profile with reviews and booking form; exact location is hidden until an accepted booking exists.
* **Service Requests**: List of requests for the current user role. Artisans only see requests matching their selected categories, with approximate location only.
* **Service Request Detail**: Request details with an Apply button for artisans, and an applicant review/approve interface for businesses.
* **Booking Detail**: Status tracking, conditional exact-location display, rating, and dispute raising.
* **Admin Dashboard**: Statistics, verification queue, and dispute resolution.

Interactive map selection is implemented using Leaflet and OpenStreetMap tiles. Users click on a map to set latitude and longitude, which are stored alongside a human-readable location name. Preferred timeframes are captured through a calendar date picker to improve data consistency over free-text entries. Exact coordinates are masked from both sides until a booking is accepted or an artisan application is approved.

Styling is handled with Tailwind CSS, and icons are provided by Lucide React.

## 4.5 Database Setup

The database schema is defined in `server/db/schema.sql` and applied through `server/db/setup.js`. Sample data is inserted with `server/db/seed.js`, which creates default categories, an admin account, and sample business and artisan accounts for demonstration.

## 4.6 Testing Approach

Testing focused on the backend API using Jest and Supertest. The test suite covers:

* User registration and login, including duplicate email handling and invalid credentials.
* The complete business workflow: posting a service request, booking an artisan, updating status through to completion, submitting a rating, and verifying the rating appears on the artisan profile.

A total of eighteen tests were written covering authentication, the core booking workflow, and the new artisan application and location privacy flow. All tests pass successfully. Manual end to end testing was also performed through the browser interface to verify the frontend forms, navigation, and role based access control.

## 4.7 Test Results

| Test Suite | Tests | Passed | Failed |
| :---- | :---- | :---- | :---- |
| Authentication API | 5 | 5 | 0 |
| Core Business Workflow | 7 | 7 | 0 |
| Artisan Application & Location Privacy | 6 | 6 | 0 |
| **Total** | **18** | **18** | **0** |

The implemented prototype successfully supports the core workflows identified in Chapter Three: business and artisan registration, mandatory artisan onboarding, service request posting, category filtered request discovery for artisans, location masking, application approval, booking creation, status tracking, ratings, and administrator oversight.

## 4.8 Summary

This chapter described the implementation of the vendor management system using React, Node.js/Express, and PostgreSQL. The system was tested with automated API tests covering authentication and the main booking workflow, and all tests passed. The next chapter summarizes the project and identifies directions for future work.

---

# CHAPTER FIVE: CONCLUSION AND FUTURE WORK

## 5.1 Introduction

This final chapter summarizes the outcomes of the project, discusses its limitations, and suggests directions for future work.

## 5.2 Summary of Findings

The project succeeded in building a functional web based vendor management system that addresses the gap identified in Chapter Two. The platform provides structured vendor discovery, booking, status tracking, rating, and administration for the relationship between businesses and artisans in Ghana. The three user roles operate with appropriate permissions, and the core data model supports trust mechanisms such as verification status and ratings.

The testing results confirm that the system's primary workflows operate correctly end to end. The architecture separates concerns cleanly between frontend, backend, and database, making the system maintainable and extensible.

## 5.3 Limitations

The prototype has several limitations that should be acknowledged:

* **Payment Integration**: The system does not include a live payment gateway. Transactions are tracked through agreed prices but payment happens outside the platform.
* **Mobile Application**: Only a responsive web application is provided; there is no dedicated native mobile app.
* **Document Verification**: Artisan verification is currently managed through an admin status flag. Real identity document upload and review is represented by a placeholder URL.
* **Geographic Scope**: Vendor onboarding is limited to seeded and manually registered accounts; nationwide recruitment is outside the project scope.
* **Notifications**: Notifications are stored in the database but not delivered through email or push channels.

## 5.4 Recommendations for Future Work

The following enhancements are recommended for future iterations of the system:

* Integrate a mobile money or card payment gateway to handle deposits and milestone payments within the platform.
* Develop native Android and iOS applications to improve accessibility for artisans who primarily use smartphones.
* Implement real document upload and optical character recognition (OCR) based verification for artisan identity checks.
* Add an in-app messaging system so businesses and artisans can communicate without sharing personal contact details prematurely.
* Introduce push notifications, SMS alerts, and email confirmations for booking updates and verification status changes.
* Expand the onboarding process to support regional agent networks that can recruit and verify artisans across Ghana.

## 5.5 Conclusion

This project demonstrates that a web based vendor management system can bring structure and accountability to the informal artisan economy in Ghana. By combining verified profiles, transparent ratings, and a managed booking workflow, the system offers both businesses and artisans a better alternative to unstructured referral networks. While the current implementation is a prototype, it provides a solid foundation for further development and real world deployment.

---

# REFERENCES

* TaskRabbit. (n.d.). Retrieved from https://www.taskrabbit.com
* Thumbtack. (n.d.). Retrieved from https://www.thumbtack.com
* Jiji Ghana. (n.d.). Retrieved from https://jiji.com.gh
* Evans, D. S. (2003). The Antitrust Economics of Multi-Sided Platform Markets. *Yale Journal on Regulation*, 21(2), 295-350.
* Rochet, J. C., & Tirole, J. (2003). Platform Competition in Two-Sided Markets. *Journal of the European Economic Association*, 1(4), 990-1029.
