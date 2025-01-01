import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab } from '@mui/material';
import { ExportTheme, defaultTheme } from './ExportTheme';
import { ThemeCustomizer } from './ThemeCustomizer';
import { PDFExport } from './PDFExport';

interface ExportWithThemeProps {
  contentRef: React.RefObject<HTMLElement>;
}

export const ExportWithTheme: React.FC<ExportWithThemeProps> = ({ contentRef }) => {
  const [currentTheme, setCurrentTheme] = useState<ExportTheme>(defaultTheme);
  const [activeTab, setActiveTab] = useState(0);

  const handleThemeChange = (theme: ExportTheme) => {
    setCurrentTheme(theme);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Theme Customization" />
        <Tab label="Export Options" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <ThemeCustomizer
            onThemeChange={handleThemeChange}
            initialTheme={currentTheme}
          />
        </Box>
      )}

      {activeTab === 1 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <PDFExport
              contentRef={contentRef}
              theme={currentTheme}
              filename="themed-export.pdf"
            />
          </Box>
          {/* Additional export options can be added here */}
        </Box>
      )}
    </Paper>
  );
};

export default ExportWithTheme;
