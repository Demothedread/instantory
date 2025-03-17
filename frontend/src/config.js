// This file is now a redirect to the structured config system
// Import the new config from the config directory
import config from './config/index';

// Re-export the config to maintain backward compatibility

export default config;

// This comment explains the change for developers:
/*
 * NOTICE: The config.js file has been deprecated in favor of a structured 
 * configuration system in the 'config/' directory.
 * 
 * To access configuration:
 * - Import from './config' instead of './config.js'
 * - Use config.auth for auth settings
 * - Use config.apiUrl for API URL
 * - See config/index.js for the full configuration schema
 */
