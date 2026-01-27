### App Specification: Citizen Incident Reporting Web App

#### Overview
This application is a **responsive web app** designed for citizens of cities, villages, and municipalities to report public incidents. Typical incidents include road damage, uncollected garbage, broken street lamps, and similar issues.  

Although implemented as a web application, it is intended primarily for **mobile phone usage**, therefore:
- Responsive design is mandatory
- Compact and clear information architecture is essential

All general content is publicly accessible without authorization, with limited features restricted to administrators.

---

### Start Page (Home)

#### Header
- Application logo
- **Login / Logout button**
  - Displays **Login** for anonymous users
  - Displays **Logout** for authenticated admins

#### Main Content
- Teaser heading
- Short descriptive text explaining the purpose of the app
- Primary call-to-action button:
  - **Report Incident**

---

### Report Incident Flow

When the user clicks **Report Incident**, a new page is opened with the following form fields:

#### Incident Form Fields
- **Title**
  - Short text describing the incident
- **Location**
  - Button: *Use current location*
    - Uses device location (must be enabled on mobile)
    - Automatically generates and inserts a **Google Maps link** with coordinates
  - Manual input of a Google Maps link is also allowed
  - **Validation rules**:
    - Only valid Google Maps links are accepted
    - No other URLs are permitted
- **Image**
  - Upload an image or take a photo using the phone camera
  - Only one image is required
- **Description**
  - Short text description of the incident
- **Contact Option**
  - Checkbox: *I want to be contacted*
  - When selected, a **phone number input** is displayed
- **Date**
  - Automatically generated (current date)

#### On Save
- Incident is saved
- User is redirected to the **Start Page**
- Incident lists are updated immediately

---

### Incident Lists (Main Page)

The main page displays **two lists**:

#### Open Incidents
- Shows all currently open incidents
- Incidents reported within the **last 48 hours** are marked as **New**
- Each row displays:
  - Title
  - Report date
- On row click:
  - Row expands to show:
    - Google Maps link (opens in new tab or mobile app if available)
    - Image
    - Description

#### Closed Incidents
- Same structure as open incidents
- Date shown is the **close date**, not the report date

---

### Statistics Chart

Below the incident lists, a chart is displayed showing incident resolution statistics.

#### Chart Features
- Displays **number of closed incidents**
- View modes:
  - **All**
    - Years on the x-axis
    - Closed incidents per year
  - **Current**
    - Months of the current year
    - Closed incidents per month
- Toggle switch to change between views

---

### Authentication & Admin Features

#### Login
- Login is available **only for admins**
- Admin users are predefined and stored directly in the database
- No user registration is available
- Login form is displayed on a **separate page**

#### Admin Capabilities
When logged in:
- In the **Open Incidents** list:
  - A **Mark as Done** button is displayed for each incident
- When expanding an incident row:
  - Contact request information (*I want to be contacted* and phone number) is visible **only to admins**
- Clicking **Mark as Done**:
  - Opens a confirmation modal:
    - *“Are you sure you want to close this incident?”*
  - On confirmation:
    - Incident is moved to the Closed Incidents list
    - Close date is recorded
- Login button changes to **Logout**

---

### Contact Form

At the bottom of the page, a simple **contact form** is displayed:
- Intended for general inquiries
- Protected by **reCAPTCHA or a similar anti-spam mechanism**

---

### Access Control Summary
- **Public (no authorization required)**:
  - Viewing incidents
  - Reporting incidents
  - Viewing statistics
  - Contact form
- **Admin-only**:
  - Login / Logout
  - “Mark as Done” button
  - Viewing contact request information