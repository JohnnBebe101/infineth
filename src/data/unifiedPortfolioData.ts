// Unified portfolio data for the /portfolio page reconstruction
// Combines data from portfolioData.ts, portfolioWidgetData.ts, academyData.ts, and mspData.ts
// Maps to specification categories while preserving internal category names per user request

import { portfolioProjects } from './portfolioData';
import { widgetProjects } from './portfolioWidgetData';
import { academyProjects } from './academyData';
import { mspProjects } from './mspData';

// Helper function to check if a project already exists in our unified array by title
const createUnifiedPortfolio = () => {
  const unified: any[] = [];
  const existingTitles = new Set<string>();

  // Function to add project if not already present
  const addProjectIfUnique = (project: any, sourceCategory: string) => {
    if (!existingTitles.has(project.title)) {
      existingTitles.add(project.title);
      
      // Determine location - try to extract from client or use default
      let location = "Addis Ababa, Ethiopia"; // Default location
      
      // Try to extract location from client name when possible
      if (project.client) {
        const clientLower = project.client.toLowerCase();
        if (clientLower.includes("ethiopia") || clientLower.includes("ethiopian") || 
            clientLower.includes("addis ababa")) {
          location = "Addis Ababa, Ethiopia";
        } else if (clientLower.includes("kenya")) {
          location = "Nairobi, Kenya";
        } else if (clientLower.includes("rwanda")) {
          location = "Kigali, Rwanda";
        } else if (clientLower.includes("uganda")) {
          location = "Kampala, Uganda";
        } else if (clientLower.includes("sudan")) {
          location = "Khartoum, Sudan";
        } else if (clientLower.includes("djibouti")) {
          location = "Djibouti, Djibouti";
        }
      }
      
      unified.push({
        id: project.id,
        title: project.title,
        // Keep internal category names as requested by user, but we'll map for display in component
        category: sourceCategory,
        description: project.description,
        client: project.client,
        location: location,
        imageUrl: project.image
      });
    }
  };

  // Add projects from portfolioData.ts (primary source)
  portfolioProjects.forEach(project => addProjectIfUnique(project, project.category));

  // Add projects from portfolioWidgetData.ts (supplemental)
  widgetProjects.forEach(project => addProjectIfUnique(project, project.category));

  // Add academy projects (map to Training category for display)
  academyProjects.forEach(project => addProjectIfUnique(project, "Academy"));

  // Add MSP projects - map to 'msp' category for portfolio page
  mspProjects.forEach(project => addProjectIfUnique(project, "msp"));

  return unified;
};

export const unifiedPortfolioProjects = createUnifiedPortfolio();

// Also export a version with display-friendly category names for components that need it
export const portfolioProjectsWithDisplayCategories = unifiedPortfolioProjects.map(project => ({
  ...project,
  // For display purposes, map internal categories to specification names
  displayCategory: project.category === "Telecom" ? "Telecommunication" :
                   project.category === "ICT" ? "ICT & Datacenter" :
                   project.category === "Academy" ? "Training" :
                   project.category === "msp" ? "MSP" :
                   project.category
}));