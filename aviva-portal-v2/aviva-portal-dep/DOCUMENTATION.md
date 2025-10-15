# Aviva Insurance Portal Documentation

This document provides an overview of the features and functionality of the Aviva Insurance Portal.

## 1. Roles

The application has three user roles:

*   **Customer**: Can view their active policies, download policy documents, and view their profile.
*   **Sub-Admin**: Can create and manage users and policies that they have created.
*   **Admin**: Has full access to the system, including all users and policies.

## 2. Customer Functionality

### 2.1. Sign Up

Customers can sign up for a new account by providing their personal and vehicle information. Upon successful sign-up, a new user account is created, and a policy is generated with a "pending" status.

### 2.2. Login

Customers can log in to their account using their email and password.

### 2.3. View Policies

After logging in, customers are redirected to the "Policies" page, where they can see a list of their active policies.

### 2.4. View Policy Details

Customers can click on a policy to view its details, including policy period, vehicle specifications, cover details, and add-ons.

### 2.5. Download Policy

Customers can download a PDF copy of their policy documents from the policy details page.

### 2.6. View Profile

Customers can view their profile information, including personal details and an invoice summary, by clicking the "Profile" button on the policy details page.

## 3. Admin & Sub-Admin Functionality

### 3.1. Dashboard

Admins and sub-admins are redirected to their dashboard after logging in. The dashboard provides an overview of the system, including total policies, active policies, and total revenue.

### 3.2. User Management

Admins and sub-admins can manage users from the "Users" page. They can create new users, edit existing users, and delete users.

*   **Admins** can see and manage all users.
*   **Sub-admins** can only see and manage users they have created.

### 3.3. Policy Management

Admins and sub-admins can manage policies from the "Policies" page. They can create new policies, edit existing policies, and delete policies.

*   **Admins** can see and manage all policies.
*   **Sub-admins** can only see and manage policies they have created.

### 3.4. Activating Policies

When a new policy is created, either by a customer signing up or by an admin/sub-admin, it has a "pending" status. An admin or sub-admin must edit the policy and change its status to "active" for it to be visible to the customer.

## 4. How to Use

### 4.1. Customer

1.  Go to the sign-up page and create a new account.
2.  Wait for an admin to activate your policy.
3.  Log in to your account to view your active policies.

### 4.2. Admin / Sub-Admin

1.  Log in to your account.
2.  Use the dashboard to navigate to the user and policy management pages.
3.  Create and manage users and policies as needed.
4.  Remember to activate new policies to make them visible to customers.