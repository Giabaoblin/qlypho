# ShiftSync AI Security Specification

## Data Invariants
1. **User Identity**: Every document in `/users` must match the auth UID. Role changes must be restricted to admins.
2. **Shift Integrity**: Shifts can only be created/modified by `admin` or `manager` roles. `staff` can only read published shifts.
3. **Attendance Validity**: A check-in log must match the authenticated user. Geolocation must be valid (radius check is client-side but schema must be strict).
4. **Request Safeguards**: Users can create their own leave/swap requests. Only managers/admins can approve/reject.
5. **Location Guarding**: Only admins can define valid check-in locations.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Theft**: authenticated user A trying to create/update `/users/B`.
2. **Privilege Escalation**: `staff` trying to set their own role to `admin` in `/users/{uid}`.
3. **Ghost Shift**: `staff` trying to create a shift in `/shifts`.
4. **Time Travel**: Attempting to set `checkInTime` to a past or future date (non-server time).
5. **Orphaned Attendance**: Creating attendance for a non-existent `shiftId`.
6. **Malicious ID**: Using a 2KB string as a `shiftId` path variable.
7. **Status Hijack**: `staff` trying to approve their own leave request.
8. **Shadow Field Injection**: Adding `isVerified: true` to a user profile to bypass logic.
9. **PII Leak**: A `staff` member trying to list all users' private emails.
10. **Resource Exhaustion**: Sending a shift description string of 5MB.
11. **Cross-User Swap**: User A approving a swap request initiated by User B.
12. **Location Spoofing**: Creating a location with `radius: 9999999` to allow check-ins from anywhere.

## Terminal State Locking
- Approved/Rejected requests cannot be modified further.
- Completed shifts cannot have attendance records modified.
