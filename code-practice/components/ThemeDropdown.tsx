import React from "react";
import Select from "react-select";
import { customStyles } from "../constants/customStyles";

interface ThemeOption {
  label: string;
  value: string;
  key?: string;
}

interface ThemeDropdownProps {
  handleThemeChange: (selectedOption: ThemeOption) => void;
  theme: ThemeOption;
  themes?: Record<string, string>;
}

// List of supported themes
const supportedThemes = [
  { value: "vs-dark", label: "VS Dark", key: "vs-dark" },
  { value: "vs-light", label: "VS Light", key: "vs-light" },
  { value: "oceanic-next", label: "Oceanic Next", key: "oceanic-next" },
  { value: "monokai", label: "Monokai", key: "monokai" },
  { value: "github", label: "GitHub", key: "github" }
];

const ThemeDropdown = ({ handleThemeChange, theme }: ThemeDropdownProps) => {
  return (
    <Select
      placeholder={`Select Theme`}
      options={supportedThemes}
      value={theme}
      styles={customStyles}
      onChange={handleThemeChange}
      className="theme-dropdown"
    />
  );
};

export default ThemeDropdown; 