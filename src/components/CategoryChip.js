import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CategoryChip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.label, active && styles.labelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EEF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  chipActive: {
    backgroundColor: '#148F77',
    borderColor: '#148F77',
  },
  label: {
    fontSize: 13,
    color: '#555',
    textTransform: 'capitalize',
  },
  labelActive: {
    color: '#FFF',
    fontWeight: '600',
  },
});
