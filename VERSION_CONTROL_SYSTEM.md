# Version Control System - GitHub-Style Commits for 3D Models

## Overview
The system implements a complete version control system similar to GitHub commits, where every save creates a snapshot of the 3D model stored in Cloudinary with full history tracking.

## How It Works

### Automatic Version Snapshots
Every time a collaborator saves changes to a 3D model:

1. **Local Save**: Document saved to IndexedDB (browser storage)
2. **Cloud Upload**: Serialized 3D model uploaded to Cloudinary as a `.cd` file
3. **History Entry**: Change recorded in Firestore with:
   - User who made the change (name, email, ID)
   - Action type (created, modified, renamed, shared, deleted)
   - Description of the change
   - Timestamp
   - Cloudinary URL (snapshot of the model at that point in time)

### Version History Display
In the Team Management dialog, each project shows its complete edit history:

- **User Information**: Avatar, name, and email of who made each change
- **Action Badge**: Color-coded badge showing the type of change:
  - Created: Green (#4ade80)
  - Modified: Blue (#3b82f6)
  - Renamed: Orange (#f59e0b)
  - Shared: Purple (#8b5cf6)
  - Deleted: Red (#ef4444)
- **Description**: What was changed
- **Timestamp**: When the change was made (local time format)
- **Snapshot Indicator**: "Snapshot saved" label for versions with file URLs
- **View Button**: Blue "View" button to access the snapshot

### Viewing Previous Versions
Click the "View" button on any history entry to:
- **Download**: Download the specific version as a `.cd` file
- **View**: Open the Cloudinary URL in a new tab to inspect the file

## Technical Implementation

### Save Flow (packages/chili/src/commands/application/saveDocument.ts)
```typescript
1. Save to IndexedDB (local)
2. Serialize document to JSON
3. Upload to Cloudinary → Get secure_url
4. Update Firestore project with new URL
5. Add history entry with:
   - sessionId (project ID)
   - ownerId (project owner)
   - action: "modified"
   - description: "Updated project: {name}"
   - fileUrl: Cloudinary URL
   - User info (auto-captured from auth)
```

### History Storage (Firestore)
```
users/{ownerId}/projects/{sessionId}/history/{changeId}
  - userId: string
  - userEmail: string
  - userName: string
  - action: "created" | "modified" | "renamed" | "shared" | "deleted"
  - description: string
  - timestamp: Timestamp
  - fileUrl?: string (Cloudinary URL)
```

### History Retrieval
```typescript
projectHistoryService.getHistory(sessionId, ownerId)
  → Returns array of changes sorted by timestamp (newest first)
```

## Features

### ✅ Implemented
- Automatic snapshot creation on every save
- Complete history tracking with user attribution
- Cloudinary storage for all versions
- View/download previous versions
- Color-coded action badges
- Timestamp display in local format
- Graceful handling of projects without history
- Support for team projects (any member can view history)

### 🎯 Benefits
- **Accountability**: See who made what changes and when
- **Recovery**: Download and restore previous versions if needed
- **Audit Trail**: Complete record of all project modifications
- **Collaboration**: Team members can see each other's contributions
- **Version Comparison**: Access any previous state of the model

### 📊 Storage
- **Cloudinary**: Stores all `.cd` file snapshots
- **Firestore**: Stores metadata and history entries
- **IndexedDB**: Local browser cache for current version

## Usage

### For Collaborators
1. Make changes to the 3D model in the editor
2. Click Save (Ctrl+S or Save button)
3. System automatically:
   - Uploads snapshot to Cloudinary
   - Records change in history
   - Attributes change to your user account

### For Team Managers
1. Open Team Management dialog
2. Click on a project
3. Click the arrow icon to expand history
4. View complete timeline of changes
5. Click "View" on any entry to access that version

## Example History Entry
```
┌─────────────────────────────────────────────────────┐
│ John Doe                          [MODIFIED] [View] │
│ john@example.com                                    │
│ Updated project: CAD Design v2                      │
│ 2/11/2026, 3:45:23 PM • Snapshot saved             │
└─────────────────────────────────────────────────────┘
```

## Future Enhancements (Optional)
- Restore version directly from history (one-click restore)
- Compare two versions side-by-side
- Branch/merge functionality for parallel work
- Commit messages (custom descriptions)
- Version tagging (v1.0, v2.0, etc.)
- Diff visualization showing what changed
- Automatic cleanup of old versions (retention policy)

## Performance Considerations
- Cloudinary handles file storage and CDN delivery
- History queries are indexed by timestamp
- Only metadata stored in Firestore (not file content)
- Lazy loading of history (only when expanded)
- Efficient serialization of 3D models

## Security
- Only authenticated users can save
- History entries include user attribution
- Cloudinary URLs are secure and time-limited
- Firestore rules enforce owner/collaborator access
- No anonymous modifications possible
