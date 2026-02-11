# Collaborative Projects Fix

## Problem
Projects with multiple collaborators were not appearing in the "Collaborative Projects" section of the dashboard.

## Root Cause
When projects were shared with other users, the owner was not always added to the `collaborators` subcollection. This meant that when checking if a project had multiple collaborators (owner + others), the count was incorrect.

## Solution

### 1. Enhanced `shareProject()` Method
Updated `packages/chili-core/src/collaboration.ts` to ensure the owner is always added as a collaborator before sending invitations:

```typescript
async shareProject(projectId: string, email: string, permission: PermissionLevel): Promise<void> {
    // ... existing code ...
    
    // Ensure owner is added as collaborator (for old projects that don't have it)
    try {
        const collaborators = await projectCollaboratorService.getCollaborators(projectId, user.uid);
        const ownerExists = collaborators.some((c) => c.userId === user.uid);
        if (!ownerExists) {
            await projectCollaboratorService.addCollaborator(
                projectId,
                user.uid,
                user.uid,
                user.email!,
                user.displayName || user.email!.split("@")[0],
                "owner",
            );
        }
    } catch (error) {
        // If collaborators subcollection doesn't exist, add owner
        await projectCollaboratorService.addCollaborator(
            projectId,
            user.uid,
            user.uid,
            user.email!,
            user.displayName || user.email!.split("@")[0],
            "owner",
        );
    }
    
    // ... create invitation ...
}
```

### 2. Improved Dashboard Logging
Enhanced `packages/chili-web/src/pages/dashboard.ts` to provide better debugging information:

```typescript
async function loadProjectsTab(router: IRouter): Promise<void> {
    // ... existing code ...
    
    for (const project of projects) {
        try {
            const collaborators = await projectCollaboratorService.getCollaborators(
                project.sessionId,
                project.userId,
            );
            console.log(
                `Project "${project.projectName}" (${project.sessionId}) has ${collaborators.length} collaborator(s):`,
                collaborators.map((c) => c.email),
            );
            // If project has more than 1 collaborator (owner + others), it's collaborative
            if (collaborators.length > 1) {
                console.log(
                    `✓ Project "${project.projectName}" is collaborative (${collaborators.length} collaborators)`,
                );
                collaborativeOwnProjects.push(project);
            }
        } catch (error) {
            console.log(
                `⚠ No collaborators subcollection for project "${project.projectName}" (${project.sessionId})`,
                error,
            );
        }
    }
}
```

## How It Works

### Project Creation Flow
1. User creates a project → Owner is automatically added as a collaborator ✓
2. Project stored at: `users/{ownerId}/projects/{sessionId}`
3. Owner collaborator stored at: `users/{ownerId}/projects/{sessionId}/collaborators/{ownerId}`

### Invitation Flow
1. Owner shares project → System ensures owner is in collaborators subcollection ✓
2. Invitation created in `projectInvitations` collection
3. Invitee receives notification
4. Invitee accepts → Added to collaborators subcollection ✓
5. Project share created with status "accepted"

### Dashboard Display Logic
1. Load user's own projects
2. For each project, check collaborators count
3. If collaborators > 1 (owner + others) → Show in "Collaborative Projects"
4. Also show projects where user was invited and accepted

## Testing Steps

### Test 1: New Project with Collaborators
1. Create a new project
2. Share it with another user (send invitation)
3. Other user accepts invitation
4. Refresh dashboard
5. ✓ Project should appear in "Collaborative Projects" for both users

### Test 2: Existing Projects
1. Open an existing project that was created before this fix
2. Share it with another user
3. System will automatically add owner as collaborator
4. Other user accepts invitation
5. ✓ Project should appear in "Collaborative Projects" for both users

### Test 3: Console Verification
1. Open browser console
2. Navigate to dashboard
3. Check console logs for:
   - "Checking X projects for collaborators..."
   - "Project 'Name' (sessionId) has X collaborator(s): [emails]"
   - "✓ Project 'Name' is collaborative (X collaborators)"

## Firestore Structure

```
users/
  {ownerId}/
    projects/
      {sessionId}/
        - projectName: string
        - userId: string (owner)
        - collaboratorIds: string[] (array of user IDs)
        - ...
        
        collaborators/
          {userId}/
            - userId: string
            - email: string
            - displayName: string
            - role: "owner" | "editor" | "viewer"
            - addedAt: timestamp

projectInvitations/
  {invitationId}/
    - projectId: string
    - projectName: string
    - ownerId: string
    - ownerEmail: string
    - invitedEmail: string
    - permission: string
    - status: "pending" | "accepted" | "rejected"

projectShares/
  {shareId}/
    - projectId: string
    - sharedBy: string (ownerId)
    - sharedWith: string (email)
    - permission: string
    - status: "accepted"
    - sharedAt: timestamp
```

## Build Status
✅ Build successful
✅ TypeScript compilation successful
⚠️ Pre-existing linting warnings (not related to this fix)

## Files Modified
1. `packages/chili-core/src/collaboration.ts` - Enhanced shareProject method
2. `packages/chili-web/src/pages/dashboard.ts` - Improved logging in loadProjectsTab
