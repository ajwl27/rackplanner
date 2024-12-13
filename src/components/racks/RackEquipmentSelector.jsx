// components/racks/RackEquipmentSelector.jsx
"use client";
import React, { useState } from 'react';
import EnhancedEquipmentSelector from './EnhancedEquipmentSelector';
import { initialEquipment } from '@/lib/constants';

export function RackEquipmentSelector({ onAddEquipment }) {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  
  return <EnhancedEquipmentSelector onAddEquipment={onAddEquipment} />;
}