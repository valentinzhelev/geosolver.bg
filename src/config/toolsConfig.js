// Configuration for tools in development
export const TOOLS_IN_DEVELOPMENT = {
  // Add tool routes that are currently in development
  // These tools will only be shown when the toggle is enabled
  '/coordinate-transformation': true,
  '/hansen-task': true,
  // Add more tools as needed
};

// Helper function to check if a tool is in development
export const isToolInDevelopment = (route) => {
  return TOOLS_IN_DEVELOPMENT[route] || false;
};

// Get all tools that are in development
export const getToolsInDevelopment = () => {
  return Object.keys(TOOLS_IN_DEVELOPMENT);
};
