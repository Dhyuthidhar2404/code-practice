import React from "react";
import Select from "react-select";
import { customStyles } from "../constants/customStyles";
import { languageOptions } from "../constants/languageOptions";

interface LanguagesDropdownProps {
  onSelectChange: (selectedOption: any) => void;
  selectedLanguage?: string;
}

const LanguagesDropdown = ({ onSelectChange, selectedLanguage }: LanguagesDropdownProps) => {
  // Find the current language in options or use the first one
  const defaultValue = selectedLanguage
    ? languageOptions.find(option => option.value === selectedLanguage)
    : languageOptions[0];
    
  return (
    <Select
      placeholder={`Select Language`}
      options={languageOptions}
      styles={customStyles}
      defaultValue={defaultValue}
      value={defaultValue}
      onChange={(selectedOption) => onSelectChange(selectedOption)}
      className="language-dropdown"
    />
  );
};

export default LanguagesDropdown; 