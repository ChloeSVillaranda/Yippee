import {
  Autocomplete,
  Box,
  Chip,
  Paper,
  TextField,
  autocompleteClasses,
} from "@mui/material";

interface CategorySelectorProps {
  value: string[];
  onChange: (newValue: string[]) => void;
  label?: string;
}

const PREDEFINED_CATEGORIES = [
  "Math",
  "Science",
  "History",
  "Geography",
  "Literature",
  "Sports",
  "Entertainment",
  "Technology",
  "Art",
  "Music",
];

function getColorForTag(tag: string): string {
  const colors: Record<string, string> = {
    Math: "#64b5f6",
    Science: "#81c784",
    History: "#ffb74d",
    Geography: "#4dd0e1",
    Literature: "#ba68c8",
    Sports: "#e57373",
    Entertainment: "#f06292",
    Technology: "#7986cb",
    Art: "#a1887f",
    Music: "#90a4ae",
  };
  return colors[tag] || "#f48fb1";
}

export default function CategorySelector({
  value,
  onChange,
  label = "Categories",
}: CategorySelectorProps) {
  const availableOptions = PREDEFINED_CATEGORIES.filter(
    (option) => !value.includes(option)
  );

  const handleDelete = (categoryToDelete: string) => {
    onChange(value.filter((cat) => cat !== categoryToDelete));
  };

  return (
    <Box sx={{ my: 2, maxWidth: 400 }}>
      <Autocomplete
        multiple
        freeSolo
        options={availableOptions}
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label={label}
            placeholder="Add or select category"
          />
        )}
        renderValue={(selected, getTagProps) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((option: string, index: number) => (
              <Chip
                label={option}
                sx={{
                  backgroundColor: getColorForTag(option),
                  color: "white",
                }}
                {...getTagProps({ index })}
              />
            ))}
          </Box>
        )}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 1,
              boxShadow: 3,
              [`& .${autocompleteClasses.option}`]: {
                padding: 1.5,
              },
            },
            elevation: 3,
          },
          listbox: {
            sx: {
              maxHeight: 200,
            },
          },
        }}
      />
    </Box>
  );
}