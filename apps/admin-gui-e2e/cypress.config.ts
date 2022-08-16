import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nrwl/cypress/plugins/cypress-preset';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__dirname),
    fileServerFolder: '.',
    fixturesFolder: './src/fixtures',
    video: true,
    videosFolder: '../../dist/cypress/apps/admin-gui-e2e/videos',
    screenshotsFolder: '../../dist/cypress/apps/admin-gui-e2e/screenshots',
    chromeWebSecurity: false,
    baseUrl: 'http://localhost:4200',
    env: {
      BA_USERNAME: 'perun',
      BA_PASSWORD: 'test',
      BA_USERNAME_VO_MANAGER: 'voManager',
      BA_PASSWORD_VO_MANAGER: 'test',
      BA_USERNAME_GROUP_MANAGER: 'groupManager',
      BA_PASSWORD_GROUP_MANAGER: 'test',
      BA_USERNAME_FACILITY_MANAGER: 'facilityManager',
      BA_PASSWORD_FACILITY_MANAGER: 'test',
      BA_USERNAME_RESOURCE_MANAGER: 'resourceManager',
      BA_PASSWORD_RESOURCE_MANAGER: 'test',
      BA_PASSWORD_TOP_GROUP_CREATOR: 'topGroupCreator',
    },
    specPattern: 'src/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false,
  },
});
