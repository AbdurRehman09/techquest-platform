'use client';

import React from 'react';
import Select, { SingleValue } from 'react-select';
import styles from './CompilerNavbar.module.css';

interface NavbarProps {
  userLang: string;
  setUserLang: (lang: string) => void;
  userTheme: string;
  setUserTheme: (theme: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

interface OptionType {
  value: string;
  label: string;
}

const CompilerNavbar: React.FC<NavbarProps> = ({
  userLang, setUserLang, userTheme,
  setUserTheme, fontSize, setFontSize
}) => {
  const languages: OptionType[] = [
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
  ];
  
  const themes: OptionType[] = [
    { value: "vs-dark", label: "Dark" },
    { value: "light", label: "Light" },
  ];

  const handleLanguageChange = (selectedOption: SingleValue<OptionType>) => {
    if (selectedOption) {
      setUserLang(selectedOption.value);
    }
  };

  const handleThemeChange = (selectedOption: SingleValue<OptionType>) => {
    if (selectedOption) {
      setUserTheme(selectedOption.value);
    }
  };

  return (
    <div className={styles.navbar}>
      <h1>TechQuest-platform Compiler</h1>
      <Select
        options={languages}
        value={languages.find(lang => lang.value === userLang)}
        onChange={handleLanguageChange}
        className={styles.select}
      />
      <Select
        options={themes}
        value={themes.find(theme => theme.value === userTheme)}
        onChange={handleThemeChange}
        className={styles.select}
      />
      <label>Font Size</label>
      <input
        type="range"
        min="18"
        max="30"
        value={fontSize}
        step="2"
        onChange={(e) => { setFontSize(Number(e.target.value)) }}
      />
    </div>
  );
};

export default CompilerNavbar; 
