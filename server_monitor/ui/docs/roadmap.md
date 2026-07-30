# Roadmap

## Document Purpose

This document is the execution plan for the Friendly Neighborhood Server Monitor project.

Unlike the other project documentation, this file is expected to change frequently as the project evolves.

Its primary audience is **AI development assistants**.

An AI should be able to read this document, determine the current state of the project, implement the next logical piece of work, update this document, and stop.

The project should always remain in a functional state after completing any task.

---

# How To Use This Document

## For Human Contributors

* Review and adjust priorities as the project evolves.
* Mark completed work.
* Add new tasks when necessary.
* Keep this document synchronized with the repository.

## For AI Contributors

Unless explicitly instructed otherwise:

1. Read `architecture.md`.
2. Read `ui_style.md`.
3. Read `api.md`.
4. Read the documentation referenced by the current task.
5. Implement **one task only**.
6. Update documentation if required.
7. Mark the completed task.
8. Stop.

Do not begin the next task unless requested.

---

# Task Status

Use the following status values.

```text
☐ Not Started

◐ In Progress

☑ Complete

⚠ Blocked
```

---

# Effort Estimates

Effort estimates are intentionally approximate.

| Size | Description                                |
| ---- | ------------------------------------------ |
| XS   | Less than one short AI session             |
| S    | One normal AI session                      |
| M    | Multiple AI sessions                       |
| L    | Large feature requiring several iterations |

If a task becomes too large, it should be divided into additional implementation tasks.

---

# Current Progress

Current Phase:

**Phase 3**

Current Task:

**Task 3.5 - Maps Page**

# Phase 1 - Minimum Viable Community Hub

## Goal

Build the foundational UI architecture and the minimum set of pages required to make the application useful.

At the completion of this phase users should be able to:

* Navigate the application.
* View available servers.
* View server status.
* Access individual server pages.
* Experience a polished, consistent UI foundation.

---

## Task 1.1 - Project Foundation

Status: ☐ Not Started

Effort: M

### Dependencies

None.

### Objectives

Create the frontend foundation.

### Deliverables

* Create the UI project.
* Configure routing.
* Configure the global application layout.
* Configure shared styling.
* Configure API communication.
* Configure project structure.
* Verify development environment.

### Completion Checklist

* Application runs successfully.
* Routing functions correctly.
* Layout is reusable.
* Documentation updated.

---

## Task 1.2 - Navbar

Status: ☐ Not Started

Effort: S

### Dependencies

Task 1.1

### Objectives

Implement the primary application navigation.

### Deliverables

* Navbar
* Navigation links
* Active page highlighting
* Responsive behavior

### Completion Checklist

* Navbar appears on every page.
* Navigation is functional.
* Styling follows `ui_style.md`.

---

## Task 1.3 - Shared UI Components

Status: ☐ Not Started

Effort: M

### Dependencies

Task 1.1

### Objectives

Create the initial reusable component library.

### Deliverables

* Button
* Card
* Page Header
* Loading State
* Error State

Future tasks should reuse these components rather than creating page-specific implementations.

---

## Task 1.4 - Server Card

Status: ☐ Not Started

Effort: S

### Dependencies

Task 1.3

Reference:

`docs/components/server_card.md`

### Deliverables

Reusable Server Card component.

---

## Task 1.5 - Status Badge

Status: ☐ Not Started

Effort: XS

### Dependencies

Task 1.3

Reference:

`docs/components/status_badge.md`

Supported states:

* Online
* Offline
* Updating
* Restarting
* Error

---

## Task 1.6 - News Ticker

Status: ☐ Not Started

Effort: S

### Dependencies

Task 1.3

Reference:

`docs/components/ticker.md`

Initially support:

* Tips
* Announcements
* Events

---

## Task 1.7 - Home Page

Status: ☐ Not Started

Effort: M

### Dependencies

* Navbar
* Server Card
* Status Badge
* News Ticker

Reference:

`docs/pages/home.md`

---

## Task 1.8 - Servers Dashboard

Status: ☐ Not Started

Effort: S

### Dependencies

* Navbar
* Server Card
* Status Badge

Reference:

`docs/pages/servers_dashboard.md`

---

# Phase 2 - Server Experience

## Goal

Expand each server into a complete community landing page.

At the completion of this phase users should be able to:

* View detailed server information.
* View rotating server media.
* Create and manage community tasks.
* Better understand each server.

---

## Task 2.1 - Image Carousel

Status: ☑ Complete

Effort: S

Reference:

`docs/components/image_carousel.md`

---

## Task 2.2 - Task Card

Status: ☑ Complete

Effort: XS

Reference:

`docs/components/task_card.md`

---

## Task 2.3 - Server Page

Status: ☑ Complete

Effort: M

Dependencies:

* Image Carousel

Reference:

`docs/pages/server.md`

---

## Task 2.4 - Requests Page

Status: ☑ Complete

Effort: M

Dependencies:

* Task Card

Reference:

`docs/pages/requests.md`

---

# Phase 3 - Community Features

## Goal

Transform the application from a dashboard into a community hub.

At the completion of this phase users should be able to:

* Schedule events.
* Share media.
* Browse maps.
* Participate in the community.

---

## Task 3.1 - Event Card

Status: ☑ Complete

Effort: XS

Reference:

`docs/components/event_card.md`

---

## Task 3.2 - Gallery Card

Status: ☑ Complete

Effort: XS

Reference:

`docs/components/gallery_card.md`

---

## Task 3.3 - Events Page

Status: ☑ Complete

Effort: M

Dependencies:

* Event Card

Reference:

`docs/pages/events.md`

---

## Task 3.4 - Gallery Page

Status: ☑ Complete

Effort: M

Dependencies:

* Gallery Card

Reference:

`docs/pages/gallery.md`

---

## Task 3.5 - Maps Page

Status: ☐ Not Started

Effort: S

Reference:

`docs/pages/maps.md`

---

# Phase 4 - Administration

## Goal

Provide administrative functionality while maintaining a simple experience for normal users.

---

## Task 4.1 - Authentication

Status: ☐ Not Started

Effort: M

Implement the initial password-based authentication model documented in `api.md`.

Authentication should remain replaceable without requiring UI redesign.

---

## Task 4.2 - Admin Page

Status: ☐ Not Started

Effort: M

Dependencies:

* Authentication

Reference:

`docs/pages/admin.md`

---

# Future Ideas

The following ideas are intentionally excluded from the active roadmap.

* Community Feed
* World Progress
* Mod Manager
* Server Update History
* Mobile Optimizations

These ideas should remain here until promoted into an active development phase.

---

# End of Task Checklist

When an implementation task is completed:

* Update the task status.
* Update the current task.
* Update any affected documentation.
* Verify the application builds successfully.
* Verify no existing functionality has regressed.
* Commit the work if appropriate.

The project should always remain in a deployable state.
