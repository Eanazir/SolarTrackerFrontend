/**
 * @file vite.config.ts
 * @description Vite configuration file for the Gong Cha POS project.
 * @see {@link https://vitejs.dev/config/}
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
/**
 * @function defineViteConfig
 * @description Defines the Vite configuration for the project.
 * @param {import('vite').UserConfig} config - Vite configuration object.
 * @returns {import('vite').UserConfig} Modified Vite configuration object.
 */
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    include: "**/*.tsx",
  })],
  base: '/'
})
