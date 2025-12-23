import * as React from "react"
import { cn } from "@/lib/utils"

// Simplified Select components for basic functionality
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange }}>
      {children}
    </SelectContext.Provider>
  );
};

const SelectTrigger: React.FC<SelectTriggerProps> = ({ className, children }) => {
  const { value, onValueChange } = React.useContext(SelectContext);

  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {children}
    </select>
  );
};

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  return <option value="" disabled>{placeholder}</option>;
};

const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  // For simplified version, content is handled by the select element
  return <>{children}</>;
};

const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
};