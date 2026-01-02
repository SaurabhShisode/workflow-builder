# Workflow Builder

A professional, interactive workflow builder application built with React and TypeScript. Create, edit, and manage complex workflow structures with an intuitive visual interface.

## Features

### Core Functionality

- **Visual Workflow Canvas**: Build workflows with a clean, intuitive interface
- **Node Types**:
  - **Start**: The root node of every workflow
  - **Action**: Single-step tasks that execute sequentially
  - **Branch (Condition)**: Decision points with True/False branches
  - **End**: Terminal nodes that mark workflow completion

- **Node Management**:
  - Add new nodes after any non-End node
  - Delete nodes (except the Start node)
  - Edit node labels by clicking on them
  - Automatic connection preservation when deleting nodes

- **Visual Connections**: 
  - Clear visual representation of workflow flow
  - Right-angle connections for branch nodes
  - Gradient-styled connection lines

### Bonus Features

- **Undo/Redo**: Full history management with keyboard shortcuts
  - `Ctrl+Z` / `Cmd+Z`: Undo
  - `Ctrl+Y` / `Cmd+Y` or `Ctrl+Shift+Z`: Redo
- **Context-Sensitive Menus**: Click on connection points to see a clean menu for adding nodes
- **Save Workflow**: Export workflow structure as JSON (logs to console)

## Technology Stack

- **React 19** with functional components and Hooks
- **TypeScript** for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for styling (no UI libraries)
- **CSS Transitions** for smooth animations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

## Usage

1. **Adding Nodes**: 
   - Click the connection point (circular button) below any node
   - Or click the "+ Add next step" button
   - Select the node type from the context menu

2. **Adding to Branches**:
   - For Condition nodes, click "+ Add step to True" or "+ Add step to False"
   - Select the node type from the menu

3. **Editing Labels**: 
   - Click on any node's label to edit it
   - Press Enter or click outside to save

4. **Deleting Nodes**: 
   - Click the × button in the top-right corner of any node
   - The node's children will automatically connect to its parent

5. **Undo/Redo**: 
   - Use the buttons in the header
   - Or use keyboard shortcuts: `Ctrl+Z` / `Ctrl+Y`

6. **Saving**: 
   - Click "Save Workflow" to export the current workflow structure
   - The JSON will be logged to the browser console

## Project Structure

```
src/
├── components/
│   ├── Canvas.tsx          # Main canvas container
│   ├── NodeCard.tsx        # Individual node component with menu
│   ├── RightAngleBranchArrows.tsx  # Branch connection arrows
│   └── ...
├── types/
│   └── workflow.ts         # TypeScript type definitions
├── utils/
│   ├── helpers.ts          # Utility functions
│   └── layout.ts           # Layout calculation helpers
├── App.tsx                 # Main application component
└── main.tsx               # Application entry point
```

## Data Structure

The workflow is represented as a graph structure:

```typescript
interface Workflow {
  rootId: string
  nodes: Record<string, WorkflowNode>
}

interface WorkflowNode {
  id: string
  type: "start" | "action" | "branch" | "end"
  label: string
  children: (string | null)[]  // For branch: [leftChild, rightChild]
                              // For others: [singleChild]
}
```

## Key Implementation Details

- **State Management**: React useState with history tracking for undo/redo
- **Node Insertion**: Automatically inserts nodes between parent and existing children
- **Node Deletion**: Preserves workflow continuity by connecting deleted node's children to parent
- **Layout**: Vertical tree layout with horizontal branching for conditions
- **Styling**: Custom Tailwind classes with gradient effects and smooth transitions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is created as a take-home assignment.
