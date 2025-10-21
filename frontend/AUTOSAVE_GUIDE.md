# Auto-Save Feature Guide

## Overview

LinkedOut now has an n8n-style auto-save feature that automatically saves your workflow changes to browser localStorage. Your work is preserved even when you close your laptop or browser!

## Features

### 🔄 Auto-Save (Every 3 Seconds)
- Workflows are automatically saved every 3 seconds while you work
- No manual save button needed
- Green pulsing indicator shows auto-save is active

### 💾 Manual Save (Ctrl+S / Cmd+S)
- Press `Ctrl+S` (Windows/Linux) or `Cmd+S` (Mac) to manually save
- Shows a success toast notification
- Useful for forcing an immediate save

### 📂 Workflow Storage
- All workflows stored in browser localStorage
- Persists across browser sessions
- Each workflow has a unique ID

### 🔍 Workflow Overview Page
- View all your saved workflows
- See last updated time (e.g., "16 hours ago")
- See creation date (e.g., "20 October")
- Click any workflow to open and edit it
- Toggle workflows active/inactive
- Delete workflows you no longer need

### ✨ What Gets Saved

Each workflow saves:
- **Workflow Title**: Editable at the top of the flow canvas
- **All Nodes**: Position, type, configuration, and data
- **Canvas Transform**: Zoom level and pan position
- **Metadata**: Created date, last updated time, active status

## How to Use

### Creating a New Workflow
1. Click "My Workflow" in the header
2. Click the "New Workflow" button
3. Start building your workflow
4. Changes auto-save every 3 seconds

### Opening an Existing Workflow
1. Click "My Workflow" in the header
2. Click on any workflow card
3. Your workflow loads with all nodes and canvas position restored
4. Continue editing - changes auto-save automatically

### Editing Workflow Title
1. Open a workflow in the flow editor
2. Click on the title field at the top-left
3. Type your new title
4. Auto-save will update it within 3 seconds

### Deleting a Workflow
1. Go to "My Workflow" overview page
2. Click the trash icon on any workflow card
3. Confirm deletion

## Visual Indicators

### In Flow Editor
- **Green Pulsing Dot**: Auto-save is active
- **"Auto-save active"**: Shown in bottom-left overlay
- **Workflow Title Field**: Top-left corner (editable)
- **Node Count**: Bottom-left shows number of nodes

### In Workflow Overview
- **Last Updated**: How long ago the workflow was modified
- **Created Date**: When the workflow was first created
- **Active/Inactive Toggle**: Enable or disable workflows
- **Personal Badge**: Indicates personal workflows

## Technical Details

### Storage Location
- **Key**: `linkedout_workflows`
- **Format**: JSON array of workflow objects
- **Location**: Browser localStorage

### Data Structure
```typescript
interface WorkflowData {
  id: string;              // Unique workflow ID
  title: string;           // Workflow name
  nodes: Node[];           // All nodes in the workflow
  transform: {             // Canvas view state
    x: number;             // Pan X position
    y: number;             // Pan Y position
    scale: number;         // Zoom level
  };
  lastUpdated: string;     // ISO date string
  created: string;         // ISO date string
  isActive: boolean;       // Active/inactive status
}
```

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires localStorage support
- ~5-10MB storage limit (sufficient for hundreds of workflows)

## Tips

1. **Rename workflows** for better organization
2. **Use the search bar** to find workflows quickly
3. **Manual save (Ctrl+S)** before closing if you want to be extra safe
4. **Check the pulsing indicator** to know auto-save is working
5. **Export important workflows** (future feature) for backup

## Troubleshooting

### Workflows not saving?
- Check browser console for errors
- Ensure localStorage is not disabled
- Clear browser cache and try again

### Lost workflow?
- Check the "My Workflow" page
- Workflows are sorted by last updated time
- Use the search bar to find by name

### Browser storage full?
- Delete old/unused workflows
- Each workflow is relatively small (~1-10KB)
- Most browsers support 5-10MB localStorage

## Future Enhancements

- ☁️ Cloud sync across devices
- 📤 Export/import workflows
- 📋 Workflow templates
- 🗂️ Folders/categories
- 👥 Sharing workflows with team
- 📊 Workflow analytics

---

**Note**: Data is stored locally in your browser. Clear browser data will delete all workflows. Cloud backup coming soon!

