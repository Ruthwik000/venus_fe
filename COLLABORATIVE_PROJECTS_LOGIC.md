# Collaborative Projects Display Logic

## Overview

Updated the "Collaborative Projects" section to show ALL projects that involve multiple users, including:
1. Projects shared with the current user (where they are a collaborator)
2. Projects owned by the current user that have collaborators (where they invited others)

## Logic

A project appears in "Collaborative Projects" if:
- **User is a collaborator**: Project was shared with them and they accepted the invitation
- **User is the owner AND has collaborators**: Project has more than 1 collaborator (owner + invited users)

## Implementation

### Updated Function: `loadProjectsTab()`

```typescript
async function loadProjectsTab(router: IRouter): Promise<void> {
    // 1. Get all user's projects
    const projects = await projectService.getProjects();
    
    // 2. Get projects shared with user
    const sharedProjects = await shareService.getSharedProjects();
    
    // 3. Find user's own projects that have collaborators
    const collaborativeOwnProjects = [];
    for (const project of projects) {
        const collaborators = await projectCollaboratorService.getCollaborators(
            project.sessionId,
            project.userId
        );
        // If more than 1 collaborator (owner + others), it's collaborative
        if (collaborators.length > 1) {
            collaborativeOwnProjects.push(project);
        }
    }
    
    // 4. Combine both types
    const allCollaborativeProjects = [...sharedProjects, ...collaborativeOwnProjects];
    
    // 5. Display in Collaborative Projects section
    // - Shared projects (where user is collaborator)
    // - Own projects with collaborators (where user is owner)
}
```

## User Experience

### Scenario 1: User Invites Collaborators
1. User creates "Project A"
2. User invites collaborator via share dialog
3. Collaborator accepts invitation
4. **Result**: "Project A" now appears in BOTH users' "Collaborative Projects" section
   - For owner: Shows in "Collaborative Projects" because it has >1 collaborator
   - For collaborator: Shows in "Collaborative Projects" because they were invited

### Scenario 2: User Accepts Invitation
1. User receives project invitation
2. User accepts invitation
3. **Result**: Project appears in user's "Collaborative Projects" section
4. **Also**: Project appears in owner's "Collaborative Projects" section (if not already there)

### Scenario 3: Solo Project
1. User creates "Project B"
2. User does NOT invite anyone
3. **Result**: "Project B" appears ONLY in "My Projects" section
   - Not in "Collaborative Projects" because collaborators.length === 1 (only owner)

## Display Sections

### Collaborative Projects
Shows:
- ✅ Projects shared with me (I'm a collaborator)
- ✅ My projects that have collaborators (I'm the owner, others joined)
- ❌ My solo projects (only I have access)

### My Projects  
Shows:
- ✅ All projects I own (including collaborative ones)
- ✅ Solo projects
- ✅ Projects with collaborators

**Note**: A project can appear in BOTH sections if:
- User is the owner
- Project has collaborators
- Then it shows in "Collaborative Projects" AND "My Projects"

## Benefits

1. **Clear Visibility**: Users can see all projects they're collaborating on in one place
2. **Owner Awareness**: Owners can see which of their projects are collaborative
3. **Consistent Experience**: Both owners and collaborators see collaborative projects in the same section
4. **Easy Access**: No need to remember if you own or were invited to a project

## Technical Details

### Collaborator Count Check
```typescript
const collaborators = await projectCollaboratorService.getCollaborators(
    project.sessionId,
    project.userId
);

// collaborators.length === 1 → Solo project (only owner)
// collaborators.length > 1 → Collaborative project (owner + others)
```

### Rendering
```typescript
// Render shared projects first (where user is collaborator)
for (const share of sharedProjects) {
    const card = createSharedProjectCard(share, router);
    collabGrid.appendChild(card);
}

// Then render own collaborative projects (where user is owner)
for (const project of collaborativeOwnProjects) {
    const card = createProjectCard(project, router, true);
    collabGrid.appendChild(card);
}
```

## Performance Considerations

- Queries collaborators for each project to determine if collaborative
- May be slow with many projects
- Future optimization: Store `collaboratorCount` field in project document
- Update count when collaborators are added/removed

## Future Enhancements

1. Add badge showing number of collaborators on project card
2. Show collaborator avatars on project card
3. Filter/sort by collaboration status
4. Separate tabs for "Owned Collaborative" vs "Invited To"
5. Cache collaborator counts to improve performance
